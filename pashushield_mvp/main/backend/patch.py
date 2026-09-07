import re

with open(r'c:\Users\Pratiksha Ingale\my_code\.vscode\python_learnings\disease_check\pashushield_mvp\main\backend\app.py', 'r', encoding='utf-8') as f:
    content = f.read()

new_ivr = '''# ================== TWILIO IVR ================== #

@app.route("/ivr/incoming", methods=['POST'])
def ivr_incoming():
    resp = VoiceResponse()
    gather = Gather(num_digits=1, action='/ivr/process_language')
    # English
    gather.say("Welcome to the Pashu Shield automated triage line. For English, press 1.", voice='alice', language='en-IN')
    # Marathi
    gather.say("मराठीसाठी, दोन दाबा.", voice='Google.mr-IN-Standard-A', language='mr-IN')
    # Gujarati
    gather.say("ગુજરાતી માટે, ત્રણ દબાવો.", voice='Google.gu-IN-Standard-A', language='gu-IN')
    
    resp.append(gather)
    return str(resp)

@app.route("/ivr/process_language", methods=['POST'])
def ivr_process_language():
    digits = request.values.get('Digits', '1')
    lang_map = {"1": "en", "2": "mr", "3": "gu"}
    language = lang_map.get(digits, "en")
    
    prompts = {
        "en": ("For Cow, press 1. For Buffalo, press 2. For Goat or Sheep, press 3.", "alice", "en-IN"),
        "mr": ("गायीसाठी १ दाबा. म्हशीसाठी २ दाबा. शेळी किंवा मेंढीसाठी ३ दाबा.", "Google.mr-IN-Standard-A", "mr-IN"),
        "gu": ("ગાય માટે 1 દબાવો. ભેંસ માટે 2 દબાવો. બકરી કે ઘેટા માટે 3 દબાવો.", "Google.gu-IN-Standard-A", "gu-IN")
    }
    text, voice, lang_code = prompts.get(language, prompts["en"])
    
    resp = VoiceResponse()
    gather = Gather(num_digits=1, action=f'/ivr/process_animal?lang={language}')
    gather.say(text, voice=voice, language=lang_code)
    resp.append(gather)
    return str(resp)

@app.route("/ivr/process_animal", methods=['POST'])
def ivr_process_animal():
    language = request.args.get('lang', 'en')
    digits = request.values.get('Digits', '1')
    
    animal_map = {"1": "Cow", "2": "Buffalo", "3": "Goat/Sheep"}
    animal = animal_map.get(digits, "Cow")
    
    prompts = {
        "en": (f"You selected {animal}. To report Fever, press 1. For Lameness, press 2. For excessive salivation, press 3.", "alice", "en-IN"),
        "mr": (f"तुम्ही निवडले आहे {animal}. तापासाठी १ दाबा. लंगडत असल्यास २ दाबा. जास्त लाळ गळत असल्यास ३ दाबा.", "Google.mr-IN-Standard-A", "mr-IN"),
        "gu": (f"તમે પસંદ કર્યું છે {animal}. તાવ માટે 1 દબાવો. લંગડાપણું માટે 2 દબાવો. વધુ પડતી લાળ માટે 3 દબાવો.", "Google.gu-IN-Standard-A", "gu-IN")
    }
    text, voice, lang_code = prompts.get(language, prompts["en"])
    
    resp = VoiceResponse()
    gather = Gather(num_digits=1, action=f'/ivr/finalize?lang={language}&animal={animal}')
    gather.say(text, voice=voice, language=lang_code)
    resp.append(gather)
    return str(resp)

@app.route("/ivr/finalize", methods=['POST'])
def ivr_finalize():
    language = request.args.get('lang', 'en')
    animal = request.args.get('animal', 'Cow')
    digits = request.values.get('Digits', '1')
    
    symptom_map = {"1": "fever", "2": "lameness", "3": "excessive salivation"}
    symptom = symptom_map.get(digits, "unknown symptom")
    caller_phone = request.values.get('From', 'Unknown')
    
    # Calculate Risk via AI
    try:
        score, risk_level, reasons, _ = calculate_risk(animal, symptom, "", "1-3 days", 0, None, "Reported via Phone IVR")
    except Exception:
        score, risk_level, reasons = 50, "MEDIUM", ["System fallback"]

    # Save to Excel
    init_excel()
    workbook = load_workbook(EXCEL_FILE)
    sheet = workbook["Farmer Reports"]
    
    recommendation = f"Check {risk_level} protocols. Animal reported {symptom}."
    
    sheet.append([
        "IVR Caller", caller_phone, "N/A", "Pune", animal, "1", "0", symptom,
        "", "1 day", "Reported via IVR", "",
        score, risk_level, recommendation,
        datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "N/A", "18.5204", "73.8567"
    ])
    workbook.save(EXCEL_FILE)
    
    check_outbreak_threshold("Pune", animal, symptom)

    prompts = {
        "en": (f"Your report for a {animal} with {symptom} has been recorded. Your risk level is {risk_level}. A veterinarian has been notified. Thank you.", "alice", "en-IN"),
        "mr": (f"तुमचा {animal} चा रिपोर्ट नोंदवला गेला आहे. धोका पातळी {risk_level} आहे. पशुवैद्यकाला कळवले आहे. धन्यवाद.", "Google.mr-IN-Standard-A", "mr-IN"),
        "gu": (f"તમારો {animal} નો અહેવાલ નોંધવામાં આવ્યો છે. જોખમ સ્તર {risk_level} છે. પશુચિકિત્સકને જાણ કરવામાં આવી છે. આભાર.", "Google.gu-IN-Standard-A", "gu-IN")
    }
    text, voice, lang_code = prompts.get(language, prompts["en"])

    resp = VoiceResponse()
    resp.say(text, voice=voice, language=lang_code)
    return str(resp)

'''

# replace using regex
content = re.sub(r'(?s)# ================== TWILIO IVR ================== #.*?(?=# ================== VIEWS ================== #)', new_ivr, content)

with open(r'c:\Users\Pratiksha Ingale\my_code\.vscode\python_learnings\disease_check\pashushield_mvp\main\backend\app.py', 'w', encoding='utf-8') as f:
    f.write(content)
