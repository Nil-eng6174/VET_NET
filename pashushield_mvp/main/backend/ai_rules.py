import os
from google import genai
from google.genai import types
import json

def calculate_risk(animal, symptom, additional_symptoms, duration, num_mortality=0, image_path=None, notes=None):
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    image_description = None

    if gemini_api_key and image_path and os.path.exists(image_path):
        try:
            client = genai.Client(api_key=gemini_api_key)
            # Upload the file using the Files API
            uploaded_file = client.files.upload(file=image_path)
            
            prompt = f"First, verify if the image contains an animal or livestock. If it does not (e.g. it is a human or an unrelated object), return ONLY a valid JSON object with {{'is_animal': false}}. If it DOES contain an animal, analyze the image along with these details: animal type: {animal}, main symptom: {symptom}, additional symptoms: {additional_symptoms}, notes: {notes}, duration: {duration}, mortality: {num_mortality}. Provide a description of the suspected disease and all other visible things in 100-150 words. Also assign a risk score (0-100), assign a risk level (LOW, MEDIUM, HIGH). Return ONLY a valid JSON object with keys: 'is_animal' (boolean), 'disease' (string), 'score' (number), 'risk_level' (string), 'reasons' (list of strings), and 'description' (string, 100-150 words)."
            
            response = client.models.generate_content(
                model='gemini-3.6-flash',
                contents=[uploaded_file, prompt]
            )
            
            # Try to parse the JSON
            response_text = response.text.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:-3]
            elif response_text.startswith("```"):
                response_text = response_text[3:-3]
                
            data = json.loads(response_text)
            
            if not data.get("is_animal", True):
                raise ValueError("NOT_LIVESTOCK")
                
            score = data.get("score", 50)
            risk_level = data.get("risk_level", "MEDIUM")
            reasons = data.get("reasons", [data.get("disease", "Unknown Disease")])
            image_description = data.get("description", "")
            
            if "disease" in data and data["disease"] not in reasons:
                reasons.insert(0, f"Probable Disease: {data['disease']}")
                
            return score, risk_level, reasons, image_description
        except ValueError as ve:
            if str(ve) == "NOT_LIVESTOCK":
                raise ve
            print(f"Gemini API failed or image invalid, falling back to rules. Error: {ve}")
        except Exception as e:
            print(f"Gemini API failed or image invalid, falling back to rules. Error: {e}")

    # Fallback Rule-based logic
    score = 0
    reasons = []

    symptom_str = str(symptom).strip().lower() if symptom else ""
    add_symptom_str = str(additional_symptoms).strip().lower() if additional_symptoms else ""
    duration_str = str(duration).strip().lower() if duration else ""
    notes_str = str(notes).strip().lower() if notes else ""
    
    all_text = f"{symptom_str} {add_symptom_str} {notes_str}"

    if "difficulty breathing" in all_text:
        score += 35
        reasons.append("Difficulty breathing")
    if "excessive salivation" in all_text:
        score += 25
        reasons.append("Excessive salivation")
    if "diarrhea" in all_text:
        score += 20
        reasons.append("Diarrhea")
    if "skin lesions" in all_text or "wounds" in all_text:
        score += 20
        reasons.append("Skin lesions / Wounds")
    if "fever" in all_text:
        score += 15
        reasons.append("Fever")
    if "swelling" in all_text:
        score += 15
        reasons.append("Swelling")
    if "loss of appetite" in all_text:
        score += 15
        reasons.append("Loss of appetite")
    if "coughing" in all_text:
        score += 15
        reasons.append("Coughing")
    if "lameness" in all_text:
        score += 15
        reasons.append("Lameness")
    if "milk production decreased" in all_text:
        score += 15
        reasons.append("Milk production decreased")
    if "weight loss" in all_text:
        score += 10
        reasons.append("Weight loss")
    if symptom and symptom not in str(reasons).lower():
        score += 10
        reasons.append(str(symptom))

    if "abnormal movement" in all_text:
        score += 20
        reasons.append("Abnormal movement")
    if "weakness" in all_text:
        score += 10
        reasons.append("Weakness")
    if "red eyes" in all_text:
        score += 10
        reasons.append("Red eyes")
    if "nasal discharge" in all_text:
        score += 10
        reasons.append("Nasal discharge")
    if "hair loss" in all_text:
        score += 10
        reasons.append("Hair loss")

    if "more than 1 week" in duration_str:
        score += 15
        reasons.append("Duration: > 1 week")
    elif "4" in duration_str and "7" in duration_str:
        score += 10
        reasons.append("Duration: 4-7 days")
    elif "1" in duration_str and "3" in duration_str:
        score += 5
        reasons.append("Duration: 1-3 days")

    if int(num_mortality) > 0:
        score += 50
        reasons.append(f"Mortality reported ({num_mortality} deaths)")

    score = min(score, 100)

    if score >= 70:
        risk_level = "HIGH"
    elif score >= 40:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return score, risk_level, reasons, image_description


def get_recommendation(risk_level, symptom=None, additional_symptoms=None, notes=None, image_description=None, language="en"):
    try:
        from chatbot import get_chat_response
        
        if image_description:
            query = f"Based on the following AI visual analysis of the animal: '{image_description}', provide a brief, actionable recommendation. The assessed risk level is {risk_level}."
        else:
            query = f"Provide a brief, actionable recommendation for an animal with the main symptom: {symptom}."
            if additional_symptoms:
                query += f" Additional symptoms: {additional_symptoms}."
            if notes:
                query += f" Notes from farmer: {notes}."
            query += f" The assessed risk level is {risk_level}."
        
        response = get_chat_response(query, language=language)
        if response and "Sorry, I am facing an issue" not in response and "माफ करा" not in response and "માફ કરશો" not in response:
            return response
    except Exception as e:
        print(f"Chatbot recommendation failed: {e}")

    fallbacks = {
        'en': {
            'HIGH': "URGENT: Contact a qualified veterinarian immediately. Keep the affected animal separated from other animals until professional advice is obtained. Provide clean drinking water and avoid giving medicines without veterinary advice.",
            'MEDIUM': "Monitor the animal closely. Provide clean water, adequate rest and appropriate nutrition. Contact a veterinarian if symptoms persist, worsen, or new symptoms appear.",
            'LOW': "Continue observation. Provide clean water, proper nutrition and a clean environment. Consult a veterinarian if the condition worsens."
        },
        'mr': {
            'HIGH': "तातडीचे: त्वरित पात्र पशुवैद्यकाशी संपर्क साधा. व्यावसायिक सल्ला मिळेपर्यंत बाधित प्राण्याला इतर प्राण्यांपासून वेगळे ठेवा.",
            'MEDIUM': "प्राण्यावर बारकाईने लक्ष ठेवा. स्वच्छ पाणी, पुरेशी विश्रांती आणि योग्य पोषण द्या. लक्षणे कायम राहिल्यास पशुवैद्यकाशी संपर्क साधा.",
            'LOW': "निरीक्षण चालू ठेवा. स्वच्छ पाणी, योग्य पोषण आणि स्वच्छ वातावरण द्या."
        },
        'gu': {
            'HIGH': "તાકીદ: તાત્કાલિક લાયક પશુચિકિત્સકનો સંપર્ક કરો. જ્યાં સુધી વ્યાવસાયિક સલાહ ન મળે ત્યાં સુધી અસરગ્રસ્ત પ્રાણીને અન્ય પ્રાણીઓથી અલગ રાખો.",
            'MEDIUM': "પ્રાણીનું નજીકથી નિરીક્ષણ કરો. સ્વચ્છ પાણી, પૂરતો આરામ અને યોગ્ય પોષણ આપો.",
            'LOW': "નિરીક્ષણ ચાલુ રાખો. સ્વચ્છ પાણી, યોગ્ય પોષણ અને સ્વચ્છ વાતાવરણ પ્રદાન કરો."
        }
    }
    lang_dict = fallbacks.get(language, fallbacks['en'])
    return lang_dict.get(risk_level, lang_dict['LOW'])
