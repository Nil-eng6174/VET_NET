from flask import Flask, render_template, request, jsonify, send_from_directory, session, redirect
from openpyxl import Workbook, load_workbook
import os
import smtplib
from email.message import EmailMessage
from werkzeug.utils import secure_filename
from ai_rules import calculate_risk, get_recommendation
from sms import send_sms
from textbee import send_textbee_sms
from datetime import datetime
from twilio.twiml.voice_response import VoiceResponse, Gather


app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "super_secret_krishicare_key_change_in_production")

EXCEL_FILE = os.getenv("EXCEL_FILE", "farmer_data.xlsx")
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
DEFAULT_LOCALITY = os.getenv("DEFAULT_LOCALITY", "Pune")

REPORT_HEADERS = [
    "Username", "Mobile", "Password", "Locality", "Animal", "Num Animals", "Num Mortality", "Main Symptom", 
    "Additional Symptoms", "Duration", "Notes", "Image", "Risk Score", 
    "Risk Level", "Recommendation", "Date & Time", "Aadhaar", "Latitude", "Longitude"
]

FARMER_HEADERS = ["Role", "Name", "Aadhaar", "Mobile", "Locality"]
VET_HEADERS = ["Role", "Name", "Aadhaar", "Mobile", "Locality", "Email"]
ALERT_HEADERS = ["Date", "Locality", "Case Count", "Status"]

def init_excel():
    """Ensure Excel file exists with proper multiple sheets."""
    if not os.path.exists(EXCEL_FILE):
        workbook = Workbook()
        # Default sheet rename
        sheet = workbook.active
        sheet.title = "Farmer Reports"
        sheet.append(REPORT_HEADERS)
        
        workbook.create_sheet("Farmers").append(FARMER_HEADERS)
        workbook.create_sheet("Veterinarians").append(VET_HEADERS)
        workbook.create_sheet("Alerts").append(ALERT_HEADERS)
        workbook.save(EXCEL_FILE)
    else:
        try:
            workbook = load_workbook(EXCEL_FILE)
            sheets = workbook.sheetnames
            if "Farmer Reports" not in sheets:
                workbook.create_sheet("Farmer Reports").append(REPORT_HEADERS)
            if "Farmers" not in sheets:
                workbook.create_sheet("Farmers").append(FARMER_HEADERS)
            if "Veterinarians" not in sheets:
                workbook.create_sheet("Veterinarians").append(VET_HEADERS)
            if "Alerts" not in sheets:
                workbook.create_sheet("Alerts").append(ALERT_HEADERS)
            workbook.save(EXCEL_FILE)
        except Exception as e:
            print(f"Error checking Excel file: {e}")

init_excel()

def send_outbreak_email(locality, count, animal, symptom):
    """Send an email alert to all veterinarians using SMTP."""
    sender_email = os.getenv("SMTP_EMAIL", "gaurang.gobe_comp25@pccoer.in")
    sender_password = os.getenv("SMTP_PASSWORD", "")
    
    # Retrieve all vet emails
    vet_emails = []
    try:
        workbook = load_workbook(EXCEL_FILE)
        if "Veterinarians" in workbook.sheetnames:
            vet_sheet = workbook["Veterinarians"]
            for row in vet_sheet.iter_rows(min_row=2, values_only=True):
                if len(row) >= 6 and row[5]:
                    if isinstance(row[5], str) and "@" in row[5]:
                        vet_emails.append(row[5])
    except Exception as e:
        print(f"Error fetching vet emails: {e}")
        
    if not vet_emails:
        vet_emails = [sender_email] # fallback
    
    if not sender_password:
        print(f"SMTP_PASSWORD not set. [SIMULATION] Sent Email to {vet_emails} regarding {locality} outbreak ({count} cases of {symptom} in {animal}).")
        return
        
    try:
        msg = EmailMessage()
        msg.set_content(f"URGENT: Outbreak detected in {locality}. There are {count} active cases of {symptom} in {animal}. Please check your KrishiCare Dashboard.")
        msg["Subject"] = f"KrishiCare Outbreak Alert: {locality} ({animal} - {symptom})"
        msg["From"] = sender_email
        msg["Bcc"] = ", ".join(vet_emails)
        msg["To"] = sender_email 
        
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        print(f"Outbreak email sent for {locality} to all veterinarians.")
    except Exception as e:
        print(f"Error sending email: {e}")

def check_outbreak_threshold(locality, animal, symptom):
    """Check if the given locality has crossed the 100 case threshold for a specific animal and disease."""
    workbook = load_workbook(EXCEL_FILE)
    sheet = workbook["Farmer Reports"]
    count = 0
    # Header is row 1
    for row in sheet.iter_rows(min_row=2, values_only=True):
        if len(row) >= 8 and row[3] == locality and row[4] == animal and row[7] == symptom:
            try:
                num_animals = int(row[5]) if row[5] else 1
            except (ValueError, TypeError):
                num_animals = 1
            count += num_animals
            
    if count > 100: # threshold reached
        # Check if alert already sent today for this locality to prevent spam
        alert_sheet = workbook["Alerts"]
        today = datetime.now().strftime("%Y-%m-%d")
        already_alerted = False
        for row in alert_sheet.iter_rows(min_row=2, values_only=True):
            if row[0] and str(row[0]).startswith(today) and row[1] == locality and row[3] == f"Outbreak: {animal} - {symptom}":
                already_alerted = True
                break
                
        if not already_alerted:
            # Save Alert
            alert_sheet.append([datetime.now().strftime("%Y-%m-%d %H:%M:%S"), locality, count, f"Outbreak: {animal} - {symptom}"])
            workbook.save(EXCEL_FILE)
            
            # Send Email and SMS Alerts
            send_outbreak_email(locality, count, animal, symptom)
            # In production, loop over Vets in that locality and send_sms(vet_mobile, ...)
            print(f"[SIMULATION] Sent SMS to Vets in {locality} regarding outbreak of {symptom} in {animal}!")



# ================== TWILIO IVR ================== #

@app.route("/ivr/incoming", methods=['POST'])
def ivr_incoming():
    base = os.getenv("NGROK_URL", "").rstrip("/")
    resp = VoiceResponse()
    gather = Gather(num_digits=1, action=base + '/ivr/process_language')
    gather.say(
        'Welcome to the Pashu Shield automated triage line. '
        'For English, press 1. '
        'For Marathi, press 2. '
        'For Gujarati, press 3.',
        voice='alice', language='en-IN'
    )
    resp.append(gather)
    return str(resp)


@app.route("/ivr/process_language", methods=['POST'])
def ivr_process_language():
    base = os.getenv("NGROK_URL", "").rstrip("/")
    digits = request.values.get('Digits', '1')
    lang_map = {"1": "en", "2": "mr", "3": "gu"}
    language = lang_map.get(digits, "en")

    # Using phonetic romanisation for Marathi/Gujarati so alice TTS sounds correct
    prompts = {
        "en": "For Cow, press 1. For Buffalo, press 2. For Goat or Sheep, press 3.",
        "mr": "Gaai saathi ek dabaa. Mhais saathi don dabaa. Sheli kiva Mendhi saathi teen dabaa.",
        "gu": "Gaay maate ek dabavo. Bhens maate be dabavo. Bakari ke Gheta maate tran dabavo."
    }
    text = prompts.get(language, prompts["en"])

    resp = VoiceResponse()
    gather = Gather(num_digits=1, action=base + '/ivr/process_animal?lang=' + language)
    gather.say(text, voice='alice', language='en-IN')
    resp.append(gather)
    return str(resp)


@app.route("/ivr/process_animal", methods=['POST'])
def ivr_process_animal():
    base = os.getenv("NGROK_URL", "").rstrip("/")
    language = request.args.get('lang', 'en')
    digits = request.values.get('Digits', '1')

    animal_map = {"1": "Cow", "2": "Buffalo", "3": "Goat"}
    animal = animal_map.get(digits, "Cow")

    prompts = {
        "en": "You selected " + animal + ". For Fever, press 1. For Lameness, press 2. For excessive salivation, press 3.",
        "mr": "Tumhi nivadlat " + animal + ". Tap saathi ek dabaa. Langdat asalyaas don dabaa. Jaast laar saathi teen dabaa.",
        "gu": "Tame pasand karyu " + animal + ". Taav maate ek dabavo. Langdapanu maate be dabavo. Vadhu laar maate tran dabavo."
    }
    text = prompts.get(language, prompts["en"])

    resp = VoiceResponse()
    gather = Gather(num_digits=1, action=base + '/ivr/finalize?lang=' + language + '&animal=' + animal)
    gather.say(text, voice='alice', language='en-IN')
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

    # Calculate risk via AI rules
    try:
        score, risk_level, reasons, _ = calculate_risk(
            animal, symptom, "", "1-3 days", 0, None, "Reported via Phone IVR"
        )
    except Exception:
        score, risk_level = 50, "MEDIUM"

    # Persist to Excel
    init_excel()
    workbook = load_workbook(EXCEL_FILE)
    sheet = workbook["Farmer Reports"]
    recommendation = "Check " + risk_level + " protocols. Animal reported " + symptom + "."
    sheet.append([
        "IVR Caller", caller_phone, "N/A", "Pune", animal, "1", "0", symptom,
        "", "1 day", "Reported via IVR", "",
        score, risk_level, recommendation,
        datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "N/A", "18.5204", "73.8567"
    ])
    workbook.save(EXCEL_FILE)
    check_outbreak_threshold("Pune", animal, symptom)

    # Build closing message
    prompts = {
        "en": "Your report for a " + animal + " with " + symptom + " has been recorded. "
              "Risk level is " + risk_level + ". A veterinarian has been notified. Thank you. Goodbye.",
        "mr": "Tumcha " + animal + " cha report nodavla gela aahe. Dhoka patali " + risk_level +
              " aahe. Pashuvaidyakala kalavle aahe. Dhanyavaad.",
        "gu": "Tamaro " + animal + " no ahewal nodhvama aavyo chhe. Jokhum star " + risk_level +
              " chhe. Pashu chikitsakne jan karavama aavi chhe. Aabhar."
    }
    text = prompts.get(language, prompts["en"])

    resp = VoiceResponse()
    resp.say(text, voice='alice', language='en-IN')
    return str(resp)

# ================== VIEWS ================== #

@app.route("/")
def home():
    if "aadhaar" in session:
        return redirect("/farmer" if session.get("role") == "Farmer" else "/vet")
    return render_template("login.html")

@app.route("/farmer")
def farmer_dashboard():
    if session.get("role") != "Farmer":
        return redirect("/")
    return render_template("farmer.html")

@app.route("/vet")
def vet_dashboard():
    if session.get("role") != "Veterinarian":
        return redirect("/")
    return render_template("vet.html")

@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


# ================== API AUTHENTICATION ================== #

@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    role = data.get("role")
    name = data.get("name")
    aadhaar = data.get("aadhaar")
    mobile = data.get("mobile")
    locality = data.get("locality")
    email = data.get("email", "")
    
    if not all([role, name, aadhaar, mobile, locality]):
        return jsonify({"success": False, "message": "All fields are required!"})
        
    init_excel()
    workbook = load_workbook(EXCEL_FILE)
    
    # Check if exists
    sheet_name = "Farmers" if role == "Farmer" else "Veterinarians"
    sheet = workbook[sheet_name]

    for row in sheet.iter_rows(min_row=2, values_only=True):
        if row[2] == aadhaar: # Aadhaar column
            return jsonify({"success": False, "message": "Aadhaar already registered!"})

    # Strict role separation: an Aadhaar may hold only ONE role.
    # Block registration in the second sheet so a farmer ID can never log in as a vet (or vice versa).
    other_role_name = "Veterinarian" if role == "Farmer" else "Farmer"
    other_sheet = workbook["Veterinarians" if role == "Farmer" else "Farmers"]
    for row in other_sheet.iter_rows(min_row=2, values_only=True):
        if row and row[2] == aadhaar:
            return jsonify({"success": False, "message": f"This Aadhaar is already registered as a {other_role_name}. Please login as {other_role_name}."})

    if role == "Farmer":
        sheet.append([role, name, aadhaar, mobile, locality])
    else:
        sheet.append([role, name, aadhaar, mobile, locality, email])
        
    workbook.save(EXCEL_FILE)
    return jsonify({"success": True})

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    role = data.get("role")
    aadhaar = data.get("aadhaar")
    
    init_excel()
    workbook = load_workbook(EXCEL_FILE)
    sheet_name = "Farmers" if role == "Farmer" else "Veterinarians"
    sheet = workbook[sheet_name]
    
    for row in sheet.iter_rows(min_row=2, values_only=True):
        if row and row[2] == aadhaar:
            # Login successful
            session["role"] = role
            session["aadhaar"] = aadhaar
            session["name"] = row[1]
            session["mobile"] = row[3]
            session["locality"] = row[4]
            return jsonify({
                "success": True,
                "name": row[1],
                "mobile": row[3],
                "locality": row[4]
            })
            
    return jsonify({"success": False, "message": "Aadhaar not found. Please register first."})

@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True})

@app.route("/api/user_info", methods=["GET"])
def user_info():
    if "aadhaar" in session:
        return jsonify({
            "success": True,
            "role": session.get("role"),
            "name": session.get("name"),
            "locality": session.get("locality")
        })
    return jsonify({"success": False})


# ================== FARMER HISTORY ================== #

@app.route("/api/farmer/history", methods=["GET"])
def farmer_history():
    """Return the logged-in farmer's info and their past reports from the Excel sheet."""
    # Identity comes from the frontend's localStorage pass-through (same as /submit)
    aadhaar = request.args.get("aadhaar", "").strip()
    mobile  = request.args.get("mobile", "").strip()

    init_excel()
    workbook = load_workbook(EXCEL_FILE)
    sheet = workbook["Farmer Reports"]

    history = []
    for row in sheet.iter_rows(min_row=2, values_only=True):
        if not row or not row[0]:
            continue
        # Row layout: [Username, Mobile, Password, Locality, Animal, Num Animals, Num Mortality,
        #              Main Symptom, Additional Symptoms, Duration, Notes, Image, Risk Score,
        #              Risk Level, Recommendation, Date & Time, Aadhaar, Latitude, Longitude]
        row_mobile = str(row[1]).strip() if len(row) > 1 and row[1] else ""
        row_aadhaar = str(row[16]).strip() if len(row) > 16 and row[16] else ""

        # Match on aadhaar first, fall back to mobile (IVR callers only have a phone number)
        if not ((aadhaar and aadhaar == row_aadhaar) or (mobile and mobile == row_mobile)):
            continue

        history.append({
            "date": row[15] if len(row) > 15 else "",
            "animal": row[4] if len(row) > 4 else "",
            "symptom": row[7] if len(row) > 7 else "",
            "additional_symptoms": row[8] if len(row) > 8 else "",
            "num_animals": row[5] if len(row) > 5 else "",
            "num_mortality": row[6] if len(row) > 6 else "",
            "risk_score": row[12] if len(row) > 12 else "",
            "risk_level": row[13] if len(row) > 13 else "",
            "recommendation": row[14] if len(row) > 14 else "",
            "image": row[11] if len(row) > 11 else "",
        })

    # Newest first
    history.sort(key=lambda r: str(r["date"]), reverse=True)

    # Farmer info pulled from the matched report rows (reports carry the farmer's identity)
    info = {}
    if history:
        # Name, locality and mobile come from the most recent matching report row.
        # IVR callers only leave a phone number, so name falls back to a generic label.
        name = ""
        locality = ""
        matched_mobile = ""
        for row in sheet.iter_rows(min_row=2, values_only=True):
            if not row or not row[0]:
                continue
            row_mobile = str(row[1]).strip() if len(row) > 1 and row[1] else ""
            row_aadhaar = str(row[16]).strip() if len(row) > 16 and row[16] else ""
            if (aadhaar and aadhaar == row_aadhaar) or (mobile and mobile == row_mobile):
                if row[0]:
                    name = str(row[0])
                if len(row) > 3 and row[3]:
                    locality = str(row[3])
                if len(row) > 1 and row[1]:
                    matched_mobile = str(row[1])
        # Generic label for IVR callers (no telling who called), real name otherwise
        display_name = "IVR Caller" if name.strip().lower() in ("ivr caller", "ivr", "") else name
        info = {
            "name": display_name,
            "mobile": mobile or matched_mobile,
            "locality": locality,
            "aadhaar": aadhaar,
            "report_count": len(history),
        }

    return jsonify({
        "success": True,
        "info": info,
        "history": history,
        "count": len(history)
    })


# ================== API DASHBOARD ================== #

@app.route("/api/vet/dashboard_data", methods=["GET"])
def vet_dashboard_data():
    # Strict role gate: only a logged-in Veterinarian may read vet data
    if session.get("role") != "Veterinarian":
        return jsonify({"success": False, "message": "Veterinarian login required."}), 403

    init_excel()
    workbook = load_workbook(EXCEL_FILE)
    
    # Read Reports
    report_sheet = workbook["Farmer Reports"]
    recent_reports = []
    symptom_counts = {}
    localities_count = {}
    histogram_data = {}
    
    for row in report_sheet.iter_rows(min_row=2, values_only=True):
        if not row or not row[0]: continue
        
        # Row layout: [Username, Mobile, Password, Locality, Animal, Num Animals, Num Mortality, Main Symptom, Additional Symptoms, Duration, Notes, Image, Risk Score, Risk Level, Recommendation, Date & Time, Aadhaar, Latitude, Longitude]
        date_val = row[15] if len(row) > 15 else ""
        name = row[0]
        locality = row[3]
        animal = row[4]
        try:
            num_animals = int(row[5]) if row[5] else 1
        except:
            num_animals = 1
        symptom = row[7]
        risk = row[13] if len(row) > 13 else ""
        lat = row[17] if len(row) > 17 else ""
        lng = row[18] if len(row) > 18 else ""
        
        # Populate tables
        recent_reports.insert(0, {
            "date": date_val, "name": name, "locality": locality,
            "animal": animal, "symptom": symptom, "risk": risk,
            "lat": lat, "lng": lng
        })
        
        # Populate Chart data (overall cases by symptom, counting reports)
        if symptom:
            symptom_counts[symptom] = symptom_counts.get(symptom, 0) + 1
            
        # Populate Map data (overall cases by locality, counting reports)
        if locality:
            localities_count[locality] = localities_count.get(locality, 0) + 1
            
        # Populate Histogram data (districtwise count of animals with specific diseases)
        if locality and animal and symptom:
            if locality not in histogram_data:
                histogram_data[locality] = {}
            key = f"{animal} - {symptom}"
            histogram_data[locality][key] = histogram_data[locality].get(key, 0) + num_animals
            
    # Read Alerts
    alert_sheet = workbook["Alerts"]
    alerts = []
    for row in alert_sheet.iter_rows(min_row=2, values_only=True):
        if row and row[1]:
            alerts.insert(0, f"{row[1]} has crossed the threshold! ({row[2]} cases)")

    # Send only the 10 most recent reports to save bandwidth
    recent_reports = recent_reports[:15]
    alerts = alerts[:5]

    return jsonify({
        "success": True,
        "chart_labels": list(symptom_counts.keys()),
        "chart_data": list(symptom_counts.values()),
        "localities_count": localities_count,
        "recent_reports": recent_reports,
        "alerts": alerts,
        "histogram_data": histogram_data
    })


# ================== FARMER SUBMISSION ================== #

@app.route("/submit", methods=["POST"])
def submit():
    # Session check bypassed for MVP
        
    try:
        # Priority: form fields (from Next.js localStorage pass-through) > Flask session > blank
        username = request.form.get("farmer_name", "").strip() or session.get("name", "")
        mobile   = request.form.get("farmer_mobile", "").strip() or session.get("mobile", "")
        locality = request.form.get("farmer_locality", "").strip() or session.get("locality", "Pune")
        aadhaar  = request.form.get("farmer_aadhaar", "").strip() or session.get("aadhaar", "")
        password = "AUTH_VIA_OTP"

        animal = request.form.get("animal", "").strip()
        numAnimals = request.form.get("numAnimals", "1").strip()
        numMortality = request.form.get("numMortality", "0").strip()
        symptom = request.form.get("symptom", "").strip()
        additional_symptoms = request.form.get("additionalSymptoms", "").strip()
        duration = request.form.get("duration", "").strip()
        notes = request.form.get('notes', '').strip()
        language = request.form.get('language', 'en').strip()
        lat = request.form.get("lat", "")
        lng = request.form.get("lng", "")

        image = request.files.get("image")
        image_name = ""

        if image and image.filename:
            safe_name = secure_filename(image.filename)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            image_name = f"{timestamp}_{safe_name}" if safe_name else f"{timestamp}_image.jpg"
            image.save(os.path.join(UPLOAD_FOLDER, image_name))

        image_path = os.path.join(UPLOAD_FOLDER, image_name) if image_name else None
        
        try:
            score, risk_level, reasons, image_desc = calculate_risk(animal, symptom, additional_symptoms, duration, num_mortality=numMortality, image_path=image_path, notes=notes)
        except ValueError as ve:
            if str(ve) == "NOT_LIVESTOCK":
                return jsonify({
                    "status": "error",
                    "message": "The uploaded image does not appear to be an animal or livestock. Please upload a valid image."
                }), 400
            else:
                raise ve

        recommendation = get_recommendation(risk_level, symptom, additional_symptoms, notes, image_desc, language=language)

        init_excel()
        workbook = load_workbook(EXCEL_FILE)
        sheet = workbook["Farmer Reports"]

        sheet.append([
            username, mobile, password, locality, animal, numAnimals, numMortality, symptom,
            additional_symptoms, duration, notes, image_name,
            score, risk_level, recommendation,
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            aadhaar, lat, lng
        ])
        workbook.save(EXCEL_FILE)
        
        # --- OUTBREAK LOGIC TRIGGER ---
        check_outbreak_threshold(locality, animal, symptom)

        sms_sent = False
        sms_info = ""
        
        # --- SEND EMAIL AND SMS (PROTOTYPE) ---
        target_email = os.getenv("SMTP_EMAIL", "gaurang.gobe_comp25@pccoer.in")
        sender_password = os.getenv("SMTP_PASSWORD", "")
        
        email_sent = False
        if sender_password:
            try:
                msg = EmailMessage()
                msg.set_content(
                    f"KrishiCare Animal Health Alert\n\n"
                    f"Risk Score: {score}%\n"
                    f"Risk Level: {risk_level}\n\n"
                    f"Advice:\n{recommendation}\n\n"
                    f"Consult a veterinarian for diagnosis."
                )
                msg["Subject"] = f"KrishiCare AI Report: {animal.capitalize()} ({risk_level} RISK)"
                msg["From"] = target_email
                msg["To"] = target_email
                
                server = smtplib.SMTP("smtp.gmail.com", 587)
                server.starttls()
                server.login(target_email, sender_password)
                server.send_message(msg)
                server.quit()
                email_sent = True
            except Exception as e:
                print(f"Email failed: {str(e)}")

        # Send WhatsApp SMS
        if mobile:
            w_sent, w_info = send_textbee_sms(mobile, score, risk_level, recommendation)
            sms_sent = w_sent
            sms_info = w_info
        else:
            sms_info = "No mobile number provided."

        if email_sent:
            sms_info += " (Email also sent to farmer)"

        return jsonify({
            "status": "success",
            "message": "Report saved successfully!",
            "score": score,
            "risk_level": risk_level,
            "reasons": reasons,
            "recommendation": recommendation,
            "sms_sent": sms_sent,
            "sms_info": sms_info
        }), 200

    except Exception as e:
        print(f"Error in submit endpoint: {e}")
        return jsonify({
            "status": "error",
            "message": f"Server error: {str(e)}"
        }), 500


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json
    query = data.get('message', '')
    language = data.get('language', 'en')
    if not query:
        return jsonify({"success": False, "message": "Message is required."})
    
    try:
        from chatbot import get_chat_response
        response = get_chat_response(query, language=language)
        return jsonify({"success": True, "reply": response})
    except Exception as e:
        print(f"Chat error: {e}")
        return jsonify({"success": False, "message": "Failed to get a response."}), 500

if __name__ == "__main__":
    # Binding to 0.0.0.0 allows other devices on the same network to access the app
    app.run(host="0.0.0.0", port=5000, debug=True)



