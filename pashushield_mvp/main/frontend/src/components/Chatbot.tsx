'use client';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../i18n/i18n';

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const { t, language } = useTranslation();
    const [messages, setMessages] = useState([{ sender: 'bot', text: 'Hello! I am your KrishiCare veterinary assistant. You can ask me questions about animal diseases, symptoms, or treatments.' }]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    
    // New Feature States
    const [mode, setMode] = useState<'general' | 'report'>('general');
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const [wizardStep, setWizardStep] = useState(0);
    const [reportData, setReportData] = useState({ animal: '', symptom: '', duration: '', notes: '' });
    const recognitionRef = useRef<any>(null);

    // Dictionary for Wizard in different languages
    const dict = {
        en: {
            greetReport: "Let's file a report. What kind of animal is sick? (e.g. Cow, Buffalo, Goat, Sheep)",
            askSymptom: "Got it. What is the main symptom?",
            askDuration: "How long has the animal been sick? (e.g. 1-3 days, more than a week)",
            askNotes: "Any other details or additional symptoms?",
            submitting: "Submitting your report to the vet network...",
            submitSuccess: "Report filed successfully! The vet has been notified.",
            generalMode: "Switched to General QA mode. Ask me anything!",
            options: {
                animal: ["Cow", "Buffalo", "Goat", "Sheep"],
                symptom: ["Fever", "Diarrhea", "Lameness", "Reduced Milk", "Skin Lesions"],
                duration: ["1-3 days", "4-7 days", "More than 1 week"]
            }
        },
        mr: {
            greetReport: "चला अहवाल नोंदवूया. कोणता प्राणी आजारी आहे? (उदा. गाय, म्हैस, शेळी, मेंढी)",
            askSymptom: "ठीक आहे. मुख्य लक्षण काय आहे?",
            askDuration: "प्राणी किती दिवसांपासून आजारी आहे? (उदा. १-३ दिवस, एका आठवड्यापेक्षा जास्त)",
            askNotes: "इतर काही माहिती किंवा अतिरिक्त लक्षणे आहेत का?",
            submitting: "तुमचा अहवाल पशुवैद्यकीय नेटवर्कवर पाठवत आहे...",
            submitSuccess: "अहवाल यशस्वीरित्या नोंदवला गेला! डॉक्टरांना कळवण्यात आले आहे.",
            generalMode: "सामान्य प्रश्न मोडमध्ये स्वागत आहे. मला काहीही विचारा!",
            options: {
                animal: ["गाय (Cow)", "म्हैस (Buffalo)", "शेळी (Goat)", "मेंढी (Sheep)"],
                symptom: ["ताप (Fever)", "जुलाब (Diarrhea)", "लंगडणे (Lameness)", "दूध कमी (Reduced Milk)"],
                duration: ["१-३ दिवस", "४-७ दिवस", "१ आठवड्याहून जास्त"]
            }
        },
        gu: {
            greetReport: "ચાલો રિપોર્ટ નોંધાવીએ. કયું પ્રાણી બીમાર છે? (દા.ત. ગાય, ભેંસ, બકરી, ઘેટું)",
            askSymptom: "બરાબર. મુખ્ય લક્ષણ શું છે?",
            askDuration: "પ્રાણી કેટલા સમયથી બીમાર છે? (દા.ત. ૧-૩ દિવસ)",
            askNotes: "કોઈ અન્ય વિગતો અથવા વધારાના લક્ષણો?",
            submitting: "તમારો રિપોર્ટ સબમિટ થઈ રહ્યો છે...",
            submitSuccess: "રિપોર્ટ સફળતાપૂર્વક નોંધાઈ ગયો!",
            generalMode: "સામાન્ય પ્રશ્નો માટે સ્વાગત છે. કંઈપણ પૂછો!",
            options: {
                animal: ["ગાય (Cow)", "ભેંસ (Buffalo)", "બકરી (Goat)", "ઘેટું (Sheep)"],
                symptom: ["તાવ (Fever)", "ઝાડા (Diarrhea)", "લંગડાપણું (Lameness)"],
                duration: ["૧-૩ દિવસ", "૪-૭ દિવસ", "૧ અઠવાડિયાથી વધુ"]
            }
        }
    };

    const getDict = () => dict[language as keyof typeof dict] || dict['en'];

    // Web Speech API Initialization
    useEffect(() => {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            
            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInputValue(transcript);
                setIsListening(false);
            };
            
            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                if (event.error === 'not-allowed') {
                    alert("Microphone access blocked! If you are on mobile, you MUST use a secure HTTPS link (like Ngrok) for the microphone to work, not an IP address.");
                }
                setIsListening(false);
            };
            
            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, [language]);

    // TTS Logic
    const speakText = (text: string) => {
        if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
        
        window.speechSynthesis.cancel(); // Stop any ongoing speech
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Default to English India
        let targetLang = 'en-IN';
        if (language === 'mr') targetLang = 'mr-IN';
        if (language === 'gu') targetLang = 'gu-IN';
        
        utterance.lang = targetLang;
        utterance.rate = 0.9; // Slightly slower for better regional pronunciation
        
        // Find best native voice available on device
        const voices = window.speechSynthesis.getVoices();
        let selectedVoice = null;

        if (language === 'mr') {
            // 1. Try exact Marathi match by language code or name
            selectedVoice = voices.find(v => v.lang.toLowerCase().includes('mr') || v.name.toLowerCase().includes('marathi'));
            // 2. Try exact Hindi match (Devanagari script reads Marathi well)
            if (!selectedVoice) {
                selectedVoice = voices.find(v => v.lang.toLowerCase().includes('hi') || v.name.toLowerCase().includes('hindi'));
            }
            // 3. Try any Indian voice as a last resort
            if (!selectedVoice) {
                selectedVoice = voices.find(v => v.lang.toLowerCase().includes('in'));
            }
        } else if (language === 'gu') {
            selectedVoice = voices.find(v => v.lang.toLowerCase().includes('gu') || v.name.toLowerCase().includes('gujarati'));
            if (!selectedVoice) selectedVoice = voices.find(v => v.lang.toLowerCase().includes('in'));
        } else {
            selectedVoice = voices.find(v => v.lang.toLowerCase().includes('en-in') || v.name.toLowerCase().includes('india'));
        }
        
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        
        window.speechSynthesis.speak(utterance);
    };
    
    // Load voices eagerly so they are ready when needed
    useEffect(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
            window.speechSynthesis.getVoices();
        }
    }, []);

    // Auto-speak newest bot message
    useEffect(() => {
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.sender === 'bot') {
                speakText(lastMsg.text);
            }
        }
    }, [messages, voiceEnabled]);

    const toggleChat = () => setIsOpen(!isOpen);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            if (language === 'mr') recognitionRef.current.lang = 'mr-IN';
            else if (language === 'gu') recognitionRef.current.lang = 'gu-IN';
            else recognitionRef.current.lang = 'en-IN';
            
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (err) {
                console.error("Speech recognition start failed:", err);
                setIsListening(false);
            }
        }
    };

    const switchMode = (newMode: 'general' | 'report') => {
        setMode(newMode);
        const ldict = getDict();
        if (newMode === 'report') {
            setWizardStep(0);
            setReportData({ animal: '', symptom: '', duration: '', notes: '' });
            setMessages([{ sender: 'bot', text: ldict.greetReport }]);
        } else {
            setMessages([{ sender: 'bot', text: ldict.generalMode }]);
        }
    };

    const handleWizardResponse = async (userMsg: string) => {
        const ldict = getDict();
        
        if (wizardStep === 0) {
            setReportData(prev => ({ ...prev, animal: userMsg }));
            setWizardStep(1);
            setMessages(prev => [...prev, { sender: 'bot', text: ldict.askSymptom }]);
        } else if (wizardStep === 1) {
            setReportData(prev => ({ ...prev, symptom: userMsg }));
            setWizardStep(2);
            setMessages(prev => [...prev, { sender: 'bot', text: ldict.askDuration }]);
        } else if (wizardStep === 2) {
            setReportData(prev => ({ ...prev, duration: userMsg }));
            setWizardStep(3);
            setMessages(prev => [...prev, { sender: 'bot', text: ldict.askNotes }]);
        } else if (wizardStep === 3) {
            const finalNotes = userMsg;
            setWizardStep(4);
            setMessages(prev => [...prev, { sender: 'bot', text: ldict.submitting }]);
            
            // Actually submit the report to backend
            try {
                const formData = new FormData();
                formData.append('animal', reportData.animal);
                formData.append('symptom', reportData.symptom);
                formData.append('duration', reportData.duration);
                formData.append('notes', finalNotes);
                
                // Fallback farmer identity for chatbot submission MVP
                formData.append('farmer_name', "Voice User");
                formData.append('farmer_mobile', "9999999999");
                formData.append('farmer_locality', "Pune");

                const res = await fetch('/api/submit', { method: 'POST', body: formData });
                const data = await res.json();
                
                if (data.status === 'success') {
                    setMessages(prev => [...prev, { sender: 'bot', text: `${ldict.submitSuccess} Risk Level: ${data.risk_level}. Recommendation: ${data.recommendation}` }]);
                } else {
                    setMessages(prev => [...prev, { sender: 'bot', text: "Failed to submit report." }]);
                }
            } catch (err) {
                setMessages(prev => [...prev, { sender: 'bot', text: "Network error during submission." }]);
            }
        }
    };

    const sendMessage = async (presetValue?: string) => {
        const valueToSend = presetValue || inputValue;
        if (!valueToSend.trim()) return;

        const userMsg = valueToSend.trim();
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setInputValue('');

        if (mode === 'report') {
            handleWizardResponse(userMsg);
            return;
        }

        setIsTyping(true);
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg, language })
            });
            const data = await res.json();
            
            if (data.status === 'success') {
                setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
            } else {
                setMessages(prev => [...prev, { sender: 'bot', text: 'Error connecting to the assistant.' }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { sender: 'bot', text: 'Network error.' }]);
        } finally {
            setIsTyping(false);
        }
    };

    const renderOptions = () => {
        if (mode !== 'report') return null;
        const ldict = getDict();
        let options: string[] = [];
        
        if (wizardStep === 0) options = ldict.options.animal;
        else if (wizardStep === 1) options = ldict.options.symptom;
        else if (wizardStep === 2) options = ldict.options.duration;
        
        if (options.length === 0) return null;

        return (
            <div className="flex flex-wrap gap-2 mt-2 pl-4">
                {options.map((opt, i) => (
                    <button 
                        key={i} 
                        onClick={() => sendMessage(opt)}
                        className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-primary hover:text-white transition-colors"
                    >
                        {opt}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isOpen && (
                <div className="w-80 md:w-96 bg-surface-base border border-border-grid rounded-2xl shadow-xl flex flex-col overflow-hidden mb-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-surface-panel-active border-b border-border-grid p-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-telemetry-saffron/20 flex items-center justify-center border border-telemetry-saffron/30">
                                    <span className="material-symbols-outlined text-telemetry-saffron">smart_toy</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-title-md text-data-parchment uppercase tracking-wide">AI Assistant</span>
                                    <span className="font-label-sm text-radar-emerald flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-radar-emerald animate-pulse"></span> Online
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => setVoiceEnabled(!voiceEnabled)} className={`p-1.5 rounded-lg ${voiceEnabled ? 'text-primary bg-primary/10' : 'text-text-muted hover:bg-surface-base'}`}>
                                    <span className="material-symbols-outlined text-[20px]">{voiceEnabled ? 'volume_up' : 'volume_off'}</span>
                                </button>
                                <button onClick={toggleChat} className="text-text-muted hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-base">
                                    <span className="material-symbols-outlined text-[20px]">close</span>
                                </button>
                            </div>
                        </div>
                        <div className="flex bg-surface-base p-1 rounded-lg border border-border-grid">
                            <button onClick={() => switchMode('general')} className={`flex-1 py-1 text-xs font-bold uppercase rounded ${mode === 'general' ? 'bg-primary text-white shadow' : 'text-text-muted hover:text-on-surface'}`}>General QA</button>
                            <button onClick={() => switchMode('report')} className={`flex-1 py-1 text-xs font-bold uppercase rounded ${mode === 'report' ? 'bg-primary text-white shadow' : 'text-text-muted hover:text-on-surface'}`}>File Report</button>
                        </div>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto max-h-96 flex flex-col gap-4 bg-surface-base">
                        {messages.map((msg, idx) => (
                            <div key={idx} className="flex flex-col">
                                <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${msg.sender === 'user' ? 'bg-primary text-on-primary rounded-br-sm' : 'bg-surface-panel border border-border-grid text-on-surface rounded-bl-sm'}`}>
                                        <p className="font-body-md text-[15px]">{msg.text}</p>
                                    </div>
                                </div>
                                {msg.sender === 'bot' && idx === messages.length - 1 && renderOptions()}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-surface-panel border border-border-grid rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                                    <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{animationDelay: '0ms'}}></span>
                                    <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{animationDelay: '150ms'}}></span>
                                    <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{animationDelay: '300ms'}}></span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-surface-panel border-t border-border-grid">
                        <div className="flex items-center gap-2 bg-surface-base border border-border-grid rounded-xl px-3 py-2">
                            <button onClick={toggleListening} className={`shrink-0 p-1 rounded-full transition-colors ${isListening ? 'text-threat-crimson bg-threat-crimson/10 animate-pulse' : 'text-text-muted hover:text-on-surface'}`}>
                                <span className="material-symbols-outlined text-[20px]">mic</span>
                            </button>
                            <input 
                                type="text" 
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Type or speak..."
                                className="flex-1 bg-transparent text-on-surface outline-none font-body-md min-w-0"
                            />
                            <button onClick={() => sendMessage()} disabled={!inputValue.trim()} className="text-primary hover:text-primary-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[24px]">send</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <button 
                onClick={toggleChat}
                className="w-14 h-14 bg-primary hover:bg-primary-container text-on-primary rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
            >
                <span className="material-symbols-outlined text-[28px]">
                    {isOpen ? 'close' : 'chat'}
                </span>
            </button>
        </div>
    );
}
