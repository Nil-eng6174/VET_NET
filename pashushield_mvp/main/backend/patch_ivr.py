import re, sys

content = open(
    r'c:\Users\Pratiksha Ingale\my_code\.vscode\python_learnings\disease_check\pashushield_mvp\main\backend\app.py',
    'r', encoding='utf-8'
).read()

new_ivr = r"""# ================== TWILIO IVR ================== #

@app.route("/ivr/incoming", methods=['POST'])
def ivr_incoming():
    base = request.url_root.rstrip('/')
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
    base = request.url_root.rstrip('/')
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
    base = request.url_root.rstrip('/')
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

"""

content = re.sub(
    r'(?s)# ================== TWILIO IVR ================== #.*?(?=# ================== VIEWS ================== #)',
    new_ivr,
    content
)

open(
    r'c:\Users\Pratiksha Ingale\my_code\.vscode\python_learnings\disease_check\pashushield_mvp\main\backend\app.py',
    'w', encoding='utf-8'
).write(content)

print("DONE - IVR patched with absolute URLs")
