export type Language = 'en' | 'mr' | 'gu';

export const translations = {
  en: {
    // General
    'app.title': 'PashuShield',
    'app.subtitle': 'IndiaAI',
    'app.helpline': 'BIOSECURITY HELPLINE: 1800-425-XXXX',
    'app.sos': 'SOS CALL',
    'nav.farmer': 'Farmer',
    'nav.veterinarian': 'Veterinarian',
    
    // Login Page
    'login.welcome': 'Welcome',
    'login.subtitle': 'Secure access to veterinary services',
    'login.aadhaar': 'Aadhaar Number',
    'login.button': 'Login',
    'login.no_account': 'Don\'t have an account?',
    'login.register_now': 'Register Now',
    'login.full_name': 'Full Name',
    'login.register_button': 'Register',
    'login.has_account': 'Already have an account?',
    'login.portal_title': 'Select Destination',
    'login.portal_dashboard': 'View Dashboard',
    'login.portal_report': 'Submit New Report',
    
    // Farmer Dashboard - Tactical Header
    'farmer.header.triage': 'Field Triage Report',
    'farmer.status.online': 'STATUS: ONLINE (IndexedDB Armed)',
    'farmer.queue.pending': '0 Pending Queue',
    'farmer.kisan_ah': '1962 KISAN AH',
    'farmer.geo.radar': 'RADAR SYNC',
    'farmer.geo.secure': 'SECURE L4',
    'farmer.geo.geolocked': 'GeoLocked',
    'farmer.geo.accuracy': '±2.8m Accuracy',
    'farmer.geo.timestamp': 'TIMESTAMP',
    
    'farmer.step.1': 'STEP 1/3',
    'farmer.step.title': 'HERD & SYMPTOM TRIAGE',
    'farmer.step.severity': 'P1 HIGH-SEVERITY',

    // Farmer Form (Pasu style)
    'farmer.form.animalType': 'Animal Type',
    'farmer.form.selectAnimal': 'Select Animal',
    'farmer.form.mainSymptom': 'Main Symptom',
    'farmer.form.selectSymptom': 'Select Symptom',
    'farmer.form.additionalSymptoms': 'Additional Symptoms',
    'farmer.form.duration': 'Duration of Illness (Days)',
    'farmer.form.affectedAnimals': 'Affected Animals',
    'farmer.form.mortality': 'Number of Deaths (Mortality)',
    'farmer.form.notes': 'Additional Notes',
    'farmer.form.notesPlaceholder': 'Describe any other observations...',
    'farmer.form.upload': 'Upload Image (Optional but recommended)',
    'farmer.form.uploadText': 'Tap to upload a photo of the affected area',
    
    // Species and Symptoms (Dropdowns/Checks)
    'farmer.species.cattle': 'Cow',
    'farmer.species.buffalo': 'Buffalo',
    'farmer.species.goat': 'Goat',
    'farmer.species.sheep': 'Sheep',
    'farmer.symp.fever': 'Fever',
    'farmer.symp.diarrhea': 'Diarrhea',
    'farmer.symp.milk': 'Reduced Milk Production',
    'farmer.symp.lameness': 'Lameness',
    'farmer.symp.skin': 'Skin Lesions',
    'farmer.addsymp.lethargy': 'Lethargy',
    'farmer.addsymp.coughing': 'Coughing',
    'farmer.addsymp.nasal': 'Nasal Discharge',
    'farmer.addsymp.drooling': 'Drooling',
    
    'farmer.submit': 'Analyze Disease'
  },
  mr: {
    // General
    'app.title': 'पशुशील्ड',
    'app.subtitle': 'इंडिया एआय',
    'app.helpline': 'बायोसुरक्षा हेल्पलाइन: १८००-४२५-XXXX',
    'app.sos': 'एसओएस कॉल',
    'nav.farmer': 'शेतकरी',
    'nav.veterinarian': 'पशुवैद्य',
    
    // Login Page
    'login.welcome': 'स्वागत आहे',
    'login.subtitle': 'पशुवैद्यकीय सेवांमध्ये सुरक्षित प्रवेश',
    'login.aadhaar': 'आधार क्रमांक',
    'login.button': 'लॉगिन करा',
    'login.no_account': 'खाते नाहीये का?',
    'login.register_now': 'आता नोंदणी करा',
    'login.full_name': 'पूर्ण नाव',
    'login.register_button': 'नोंदणी करा',
    'login.has_account': 'आधीच खाते आहे का?',
    'login.portal_title': 'गंतव्यस्थान निवडा',
    'login.portal_dashboard': 'डॅशबोर्ड पहा',
    'login.portal_report': 'नवीन अहवाल सबमिट करा',
    
    // Farmer Dashboard
    'farmer.header.triage': 'फील्ड ट्रिएज रिपोर्ट',
    'farmer.status.online': 'स्थिती: ऑनलाइन (IndexedDB सशस्त्र)',
    'farmer.queue.pending': '० प्रलंबित रांग',
    'farmer.kisan_ah': '१९६२ किसान एएच',
    'farmer.geo.radar': 'रडार सिंक',
    'farmer.geo.secure': 'सुरक्षित L4',
    'farmer.geo.geolocked': 'जिओलॉक्ड',
    'farmer.geo.accuracy': '±२.८m अचूकता',
    'farmer.geo.timestamp': 'वेळेची नोंद',
    
    'farmer.step.1': 'पाऊल १/३',
    'farmer.step.title': 'कळप आणि लक्षणे ट्रिएज',
    'farmer.step.severity': 'P1 उच्च-तीव्रता',

    // Farmer Form
    'farmer.form.animalType': 'प्राण्याचा प्रकार',
    'farmer.form.selectAnimal': 'प्राणी निवडा',
    'farmer.form.mainSymptom': 'मुख्य लक्षण',
    'farmer.form.selectSymptom': 'लक्षण निवडा',
    'farmer.form.additionalSymptoms': 'अतिरिक्त लक्षणे',
    'farmer.form.duration': 'आजाराचा कालावधी (दिवस)',
    'farmer.form.affectedAnimals': 'बाधित प्राणी',
    'farmer.form.mortality': 'मृत्यूची संख्या',
    'farmer.form.notes': 'अतिरिक्त माहिती',
    'farmer.form.notesPlaceholder': 'इतर काही निरीक्षणे सांगा...',
    'farmer.form.upload': 'फोटो अपलोड करा',
    'farmer.form.uploadText': 'बाधित भागाचा फोटो अपलोड करण्यासाठी टॅप करा',
    
    // Species and Symptoms (Dropdowns/Checks)
    'farmer.species.cattle': 'गाय',
    'farmer.species.buffalo': 'म्हैस',
    'farmer.species.goat': 'शेळी',
    'farmer.species.sheep': 'मेंढी',
    'farmer.symp.fever': 'ताप',
    'farmer.symp.diarrhea': 'अतिसार',
    'farmer.symp.milk': 'दूध कमी होणे',
    'farmer.symp.lameness': 'लंगडणे',
    'farmer.symp.skin': 'त्वचेचे विकार',
    'farmer.addsymp.lethargy': 'सुस्ती',
    'farmer.addsymp.coughing': 'खोकला',
    'farmer.addsymp.nasal': 'नाकातून स्त्राव',
    'farmer.addsymp.drooling': 'लाळ गळणे',
    
    'farmer.submit': 'रोगाचे विश्लेषण करा'
  },
  gu: {
    // General
    'app.title': 'પશુશીલ્ડ',
    'app.subtitle': 'ઇન્ડિયા એઆઇ',
    'app.helpline': 'બાયોસિક્યોરિટી હેલ્પલાઇન: 1800-425-XXXX',
    'app.sos': 'એસઓએસ કૉલ',
    'nav.farmer': 'ખેડૂત',
    'nav.veterinarian': 'પશુચિકિત્સક',
    
    // Login Page
    'login.welcome': 'સ્વાગત છે',
    'login.subtitle': 'પશુચિકિત્સા સેવાઓની સુરક્ષિત ઍક્સેસ',
    'login.aadhaar': 'આધાર નંબર',
    'login.button': 'લૉગિન',
    'login.no_account': 'ખાતું નથી?',
    'login.register_now': 'હવે નોંધણી કરો',
    'login.full_name': 'પૂરું નામ',
    'login.register_button': 'નોંધણી કરો',
    'login.has_account': 'પહેલેથી જ ખાતું છે?',
    'login.portal_title': 'ગંતવ્ય પસંદ કરો',
    'login.portal_dashboard': 'ડેશબોર્ડ જુઓ',
    'login.portal_report': 'નવો રિપોર્ટ સબમિટ કરો',
    
    // Farmer Dashboard
    'farmer.header.triage': 'ફિલ્ડ ટ્રાયજ રિપોર્ટ',
    'farmer.status.online': 'સ્થિતિ: ઑનલાઇન (IndexedDB સશસ્ત્ર)',
    'farmer.queue.pending': '0 બાકી કતાર',
    'farmer.kisan_ah': '1962 કિસાન એએચ',
    'farmer.geo.radar': 'રડાર સિંક',
    'farmer.geo.secure': 'સુરક્ષિત L4',
    'farmer.geo.geolocked': 'જીઓલોક્ડ',
    'farmer.geo.accuracy': '±2.8m ચોકસાઈ',
    'farmer.geo.timestamp': 'સમયની નોંધ',
    
    'farmer.step.1': 'પગલું 1/3',
    'farmer.step.title': 'ટોળું અને લક્ષણો ટ્રાયજ',
    'farmer.step.severity': 'P1 ઉચ્ચ-તીવ્રતા',

    // Farmer Form
    'farmer.form.animalType': 'પ્રાણીનો પ્રકાર',
    'farmer.form.selectAnimal': 'પ્રાણી પસંદ કરો',
    'farmer.form.mainSymptom': 'મુખ્ય લક્ષણ',
    'farmer.form.selectSymptom': 'લક્ષણ પસંદ કરો',
    'farmer.form.additionalSymptoms': 'વધારાના લક્ષણો',
    'farmer.form.duration': 'બીમારીનો સમયગાળો (દિવસો)',
    'farmer.form.affectedAnimals': 'અસરગ્રસ્ત પ્રાણીઓ',
    'farmer.form.mortality': 'મૃત્યુની સંખ્યા',
    'farmer.form.notes': 'વધારાની નોંધો',
    'farmer.form.notesPlaceholder': 'અન્ય કોઈ અવલોકનોનું વર્ણન કરો...',
    'farmer.form.upload': 'છબી અપલોડ કરો',
    'farmer.form.uploadText': 'અસરગ્રસ્ત વિસ્તારનો ફોટો અપલોડ કરવા માટે ટેપ કરો',
    
    // Species and Symptoms (Dropdowns/Checks)
    'farmer.species.cattle': 'ગાય',
    'farmer.species.buffalo': 'ભેંસ',
    'farmer.species.goat': 'બકરી',
    'farmer.species.sheep': 'ઘેટાં',
    'farmer.symp.fever': 'તાવ',
    'farmer.symp.diarrhea': 'ઝાડા',
    'farmer.symp.milk': 'દૂધ ઘટવું',
    'farmer.symp.lameness': 'લંગડાવું',
    'farmer.symp.skin': 'ચામડીના રોગ',
    'farmer.addsymp.lethargy': 'સુસ્તી',
    'farmer.addsymp.coughing': 'ઉધરસ',
    'farmer.addsymp.nasal': 'નાકમાંથી સ્રાવ',
    'farmer.addsymp.drooling': 'લાળ પડવી',
    
    'farmer.submit': 'રોગનું વિશ્લેષણ કરો'
  }
};

export type TranslationKey = keyof typeof translations.en;
