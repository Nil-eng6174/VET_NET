'use client';
import { useState } from 'react';
import { useTranslation } from '../i18n/i18n';

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const { t, language } = useTranslation();
    const [messages, setMessages] = useState([{ sender: 'bot', text: 'Hello! I am your KrishiCare veterinary assistant. You can ask me questions about animal diseases, symptoms, or treatments.' }]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const toggleChat = () => setIsOpen(!isOpen);

    const sendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMsg = inputValue.trim();
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setInputValue('');
        setIsTyping(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg, language })
            });
            const data = await res.json();
            
            if (data.success) {
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

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isOpen && (
                <div className="w-80 md:w-96 bg-surface-base border border-border-grid rounded-2xl shadow-xl flex flex-col overflow-hidden mb-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-surface-panel-active border-b border-border-grid p-4 flex items-center justify-between">
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
                        <button onClick={toggleChat} className="text-text-muted hover:text-on-surface">
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto max-h-96 flex flex-col gap-4 bg-surface-base">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${msg.sender === 'user' ? 'bg-primary text-on-primary rounded-br-sm' : 'bg-surface-panel border border-border-grid text-on-surface rounded-bl-sm'}`}>
                                    <p className="font-body-md text-[15px]">{msg.text}</p>
                                </div>
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
                            <input 
                                type="text" 
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent text-on-surface outline-none font-body-md min-w-0"
                            />
                            <button onClick={sendMessage} disabled={!inputValue.trim()} className="text-primary hover:text-primary-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 flex items-center justify-center">
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
