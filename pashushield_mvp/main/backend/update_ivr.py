import re

with open('pashushield_mvp/main/backend/app.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the IVR section
ivr_old = """# ================== TWILIO IVR ================== #

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
    return str(resp)"""

ivr_new = """# ================== TWILIO IVR ================== #

@app.route("/ivr/incoming", methods=['POST'])
def ivr_incoming():
    base = os.getenv("NGROK_URL", "").rstrip("/")
    resp = VoiceResponse()
    gather = Gather(num_digits=1, action=base + '/ivr/process_language')
    # Defaulting to Marathi greeting as requested
    gather.say(
        'नमस्कार, पशु शील्ड मध्ये आपले स्वागत आहे. '
        'मराठीसाठी १ दाबा. '
        'For English, press 2. '
        'ગુજરાતી માટે 3 દબાવો.',
        voice='Polly.Aditi', language='hi-IN' # hi-IN with Aditi perfectly reads Marathi Devanagari
    )
    resp.append(gather)
    return str(resp)


@app.route("/ivr/process_language", methods=['POST'])
def ivr_process_language():
    base = os.getenv("NGROK_URL", "").rstrip("/")
    digits = request.values.get('Digits', '1')
    lang_map = {"1": "mr", "2": "en", "3": "gu"}
    language = lang_map.get(digits, "mr")

    prompts = {
        "en": {"text": "For Cow, press 1. For Buffalo, press 2. For Goat or Sheep, press 3.", "lang": "en-IN", "voice": "alice"},
        "mr": {"text": "गाईसाठी १ दाबा. म्हशीसाठी २ दाबा. शेळी किंवा मेंढीसाठी ३ दाबा.", "lang": "hi-IN", "voice": "Polly.Aditi"},
        "gu": {"text": "ગાય માટે ૧ દબાવો. ભેંસ માટે ૨ દબાવો. બકરી માટે ૩ દબાવો.", "lang": "gu-IN", "voice": "Polly.Aditi"}
    }
    config = prompts.get(language, prompts["mr"])

    resp = VoiceResponse()
    gather = Gather(num_digits=1, action=base + '/ivr/process_animal?lang=' + language)
    gather.say(config["text"], voice=config["voice"], language=config["lang"])
    resp.append(gather)
    return str(resp)


@app.route("/ivr/process_animal", methods=['POST'])
def ivr_process_animal():
    base = os.getenv("NGROK_URL", "").rstrip("/")
    language = request.args.get('lang', 'mr')
    digits = request.values.get('Digits', '1')

    animal_map = {"1": "Cow", "2": "Buffalo", "3": "Goat"}
    animal = animal_map.get(digits, "Cow")
    
    animal_trans = {
        "Cow": {"mr": "गाय", "gu": "ગાય", "en": "Cow"},
        "Buffalo": {"mr": "म्हैस", "gu": "ભેંસ", "en": "Buffalo"},
        "Goat": {"mr": "शेळी", "gu": "બકરી", "en": "Goat"}
    }
    animal_name = animal_trans[animal][language]

    prompts = {
        "en": {"text": f"You selected {animal_name}. For Fever, press 1. For Lameness, press 2. For excessive salivation, press 3.", "lang": "en-IN", "voice": "alice"},
        "mr": {"text": f"तुम्ही {animal_name} निवडली आहे. तापासाठी १ दाबा. लंगडत असल्यास २ दाबा. जास्त लाळ गळत असल्यास ३ दाबा.", "lang": "hi-IN", "voice": "Polly.Aditi"},
        "gu": {"text": f"તમે {animal_name} પસંદ કરી છે. તાવ માટે ૧ દબાવો. લંગડાપણા માટે ૨ દબાવો. વધુ લાળ માટે ૩ દબાવો.", "lang": "gu-IN", "voice": "Polly.Aditi"}
    }
    config = prompts.get(language, prompts["mr"])

    resp = VoiceResponse()
    gather = Gather(num_digits=1, action=base + '/ivr/finalize?lang=' + language + '&animal=' + animal)
    gather.say(config["text"], voice=config["voice"], language=config["lang"])
    resp.append(gather)
    return str(resp)"""

content = content.replace(ivr_old, ivr_new)

# Update finalize to speak the correct language outcome
finalize_old = """    # Generate voice response
    resp = VoiceResponse()
    resp.say(f"Thank you. Your report for {animal} with {symptom} has been recorded. "
             f"The risk level is {risk_level}. We will notify the local vet.",
             voice='alice', language='en-IN')
    return str(resp)"""

finalize_new = """    # Generate voice response
    prompts = {
        "en": {"text": f"Thank you. Your report for {animal} with {symptom} has been recorded. The risk level is {risk_level}. We will notify the local vet.", "lang": "en-IN", "voice": "alice"},
        "mr": {"text": f"धन्यवाद. तुमची नोंद झाली आहे. धोक्याची पातळी {risk_level} आहे. आम्ही लवकरच डॉक्टरांना कळवू.", "lang": "hi-IN", "voice": "Polly.Aditi"},
        "gu": {"text": f"આભાર. તમારી રિપોર્ટ નોંધાઈ ગઈ છે. જોખમનું સ્તર {risk_level} છે. અમે પશુચિકિત્સકને જાણ કરીશું.", "lang": "gu-IN", "voice": "Polly.Aditi"}
    }
    config = prompts.get(language, prompts["mr"])
    
    resp = VoiceResponse()
    resp.say(config["text"], voice=config["voice"], language=config["lang"])
    return str(resp)"""

content = content.replace(finalize_old, finalize_new)

with open('pashushield_mvp/main/backend/app.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Twilio IVR updated to native Marathi.")
