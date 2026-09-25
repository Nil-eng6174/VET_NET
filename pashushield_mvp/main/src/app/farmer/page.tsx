'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../i18n/i18n';

export default function FarmerDashboard() {
    const router = useRouter();
    const { t, language, setLanguage } = useTranslation();
    const [currentTime, setCurrentTime] = useState('');
    const [fileName, setFileName] = useState('');
    
    // Logged-in farmer identity from localStorage
    const [farmer, setFarmer] = useState({ name: '', mobile: '', locality: '', aadhaar: '' });

    // New States for Geolocation and AI Result
    const [location, setLocation] = useState('Fetching GPS...');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [aiResult, setAiResult] = useState<any>(null);

    // Load farmer from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem('ps_user');
            if (stored) {
                const user = JSON.parse(stored);
                setFarmer({
                    name: user.name || '',
                    mobile: user.mobile || '',
                    locality: user.locality || '',
                    aadhaar: user.aadhaar || ''
                });
            }
        } catch {}
    }, []);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST');
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Geolocation API
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude.toFixed(4);
                    const lng = position.coords.longitude.toFixed(4);
                    setLocation(`${lat}° N, ${lng}° E`);
                },
                (error) => {
                    setLocation('Location access denied');
                },
                { timeout: 10000, enableHighAccuracy: true }
            );
        } else {
            setLocation('Geolocation not supported');
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setAiResult(null);
        
        try {
            const formData = new FormData(e.target as HTMLFormElement);
            
            // Inject logged-in farmer credentials so the backend uses real identity
            formData.append('farmer_name', farmer.name);
            formData.append('farmer_mobile', farmer.mobile);
            formData.append('farmer_locality', farmer.locality);
            formData.append('farmer_aadhaar', farmer.aadhaar);

            const res = await fetch('/api/submit', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            
            if (data.status === 'success') {
                setAiResult(data);
                // Scroll to result
                setTimeout(() => {
                    document.getElementById('aiResultCard')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            } else {
                alert('Submission failed: ' + (data.message || 'Unknown error'));
            }
        } catch (err) {
            alert('Failed to connect to server');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-surface-base text-on-surface font-body-md flex flex-col min-h-screen">
            {/* Tactical Header */}
            <header className="fixed top-0 inset-x-0 z-50 bg-surface-panel/90 backdrop-blur-xl pt-safe shadow-sm border-b border-border-grid">
                <div className="h-24 flex flex-col justify-center px-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                            <img alt="Brand logo" className="h-10 w-auto object-contain flex-shrink-0" src="https://lh3.googleusercontent.com/aida/AEtjO1XLDFrDglF2n3r1uftl6goq7UaqNywM2Y8F1AiGpEF9f2yjmaeRYSn6PlDywK2f9wJ1UUksm88RBO2IVnE0Ww_w3t1JskqMyVGZCs4ChjZiCwmC0Zv6qG8IENUxijWZ3KJXLy6oS21lwJg1Bi3e7vYCnNIWDJ96uf5OVMlXqGR4YTnqu595XvzdXTj-U_OT2TihUn11A2hBufR-4lKiCjQHOPqDL75oLHa3ZzgdWwWO4m0_jvF6QCL-MM4"/>
                            <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-title-lg text-data-parchment tracking-tight text-xl">{t('app.title')}</span>
                                    <span className="px-2 py-0.5 bg-surface-panel-active text-radar-emerald font-label-sm uppercase rounded">{t('app.subtitle')}</span>
                                </div>
                                <span className="font-body-sm text-text-muted truncate mt-0.5">{t('farmer.header.triage')}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex items-center bg-surface-base px-3 py-1.5 gap-2 text-radar-emerald font-label-sm border border-border-grid rounded-lg shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-radar-emerald animate-pulse"></span>
                                <span>SYNC ACTIVE</span>
                            </div>
                            <div className="flex items-center bg-surface-container-high rounded-lg p-1 shadow-sm">
                                <button className={`px-3 py-1.5 rounded-md text-sm font-bold ${language === 'en' ? 'bg-primary text-on-primary shadow' : 'text-text-muted hover:text-on-surface'}`} onClick={() => setLanguage('en')}>EN</button>
                                <button className={`px-3 py-1.5 rounded-md text-sm font-bold ${language === 'mr' ? 'bg-primary text-on-primary shadow' : 'text-text-muted hover:text-on-surface'}`} onClick={() => setLanguage('mr')}>मराठी</button>
                                <button className={`px-3 py-1.5 rounded-md text-sm font-bold ${language === 'gu' ? 'bg-primary text-on-primary shadow' : 'text-text-muted hover:text-on-surface'}`} onClick={() => setLanguage('gu')}>ગુજરાતી</button>
                            </div>
                            <button onClick={() => router.push('/')} className="text-text-muted hover:text-on-surface p-2 ml-2 bg-surface-container-high rounded-full hover:bg-border-grid transition-colors">
                                <span className="material-symbols-outlined text-[24px]">logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex flex-col relative w-full pt-32 pb-24 bg-surface-base min-h-screen">
                <div className="flex flex-col w-full pb-12 max-w-4xl mx-auto px-4 md:px-6">
                    
                    {/* PWA Network & Quick Status Banner */}
                    <div className="flex flex-col w-full bg-surface-panel px-6 py-4 rounded-xl shadow-sm border border-border-grid mb-6">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="w-3 h-3 rounded-full bg-radar-emerald animate-pulse flex-shrink-0 shadow-[0_0_8px_rgba(5,150,105,0.6)]"></span>
                                <span className="font-title-md text-radar-emerald truncate">{t('farmer.status.online')}</span>
                            </div>
                            <div className="flex items-center gap-4 flex-shrink-0">
                                <span className="bg-surface-container-high px-3 py-1 text-secondary-fixed font-title-md rounded-lg">
                                    {t('farmer.queue.pending')}
                                </span>
                                <a className="bg-telemetry-saffron px-4 py-1.5 text-white font-title-md flex items-center gap-2 shadow-md hover:shadow-lg rounded-lg transition-all" href="tel:1962">
                                    <span className="material-symbols-outlined text-[18px]">phone_in_talk</span>
                                    <span>{t('farmer.kisan_ah')}</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Tactical Header & Farmer Geo Identity */}
                    <div className="flex flex-col w-full bg-surface-panel p-6 rounded-xl shadow-sm border border-border-grid mb-6">
                        <div className="flex items-start justify-between gap-6">
                            <div className="flex flex-col min-w-0 gap-1.5">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-telemetry-saffron text-[24px]">verified_user</span>
                                    <span className="font-headline-sm text-data-parchment truncate">{farmer.name || 'Loading...'}</span>
                                </div>
                                <span className="font-body-md text-text-muted truncate ml-9">UID: {farmer.aadhaar ? farmer.aadhaar.replace(/(.{4})(.{4})(.{4})/, '$1-$2-$3') : '••••-••••-••••'} • {farmer.mobile ? `+91-${farmer.mobile}` : ''}</span>
                                <span className="font-title-md text-secondary-fixed ml-9 mt-1">LOCALITY: {farmer.locality || '—'}</span>
                            </div>
                            <div className="bg-surface-panel-active px-4 py-3 flex flex-col items-end flex-shrink-0 text-right rounded-lg border border-border-grid">
                                <span className="font-title-md text-radar-emerald">{t('farmer.geo.radar')}</span>
                                <span className="font-body-sm text-data-parchment mt-1">{t('farmer.geo.secure')}</span>
                            </div>
                        </div>
                        
                        {/* Precision GeoLock Sensor Strip */}
                        <div className="flex items-center justify-between bg-surface-base border border-border-grid px-5 py-4 mt-6 text-data-parchment rounded-lg">
                            <div className="flex items-center gap-4 min-w-0">
                                <span className="material-symbols-outlined text-radar-emerald text-[24px] animate-spin" style={{animationDuration: '8s'}}>radar</span>
                                <div className="flex flex-col min-w-0 gap-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="font-title-md text-radar-emerald uppercase tracking-wider">{t('farmer.geo.geolocked')}</span>
                                        <span className="font-body-sm text-text-muted">• {t('farmer.geo.accuracy')}</span>
                                    </div>
                                    <span className="font-body-md text-data-parchment truncate font-mono">{location}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end text-right flex-shrink-0">
                                <span className="font-label-sm text-text-muted mb-0.5">{t('farmer.geo.timestamp')}</span>
                                <span className="font-title-md text-secondary-fixed">{currentTime || '...'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Incident Workflow Step Tracker */}
                    <div className="flex flex-col w-full mb-6">
                        <div className="flex items-center justify-between bg-surface-panel-active border border-border-grid px-6 py-4 text-data-parchment rounded-xl shadow-sm">
                            <div className="flex items-center gap-4">
                                <span className="px-3 py-1 bg-telemetry-saffron text-white font-title-md rounded-md shadow-sm">{t('farmer.step.1')}</span>
                                <span className="font-headline-sm text-data-parchment tracking-tight">{t('farmer.step.title')}</span>
                            </div>
                        </div>
                    </div>

                    {/* AI Result Card - Shows upon successful submission */}
                    {aiResult && (
                        <div id="aiResultCard" className="mb-6 bg-surface-panel border-l-4 border-l-threat-crimson border-y border-r border-border-grid rounded-xl p-6 shadow-sm animate-in fade-in zoom-in duration-300">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1 flex flex-col gap-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-outlined text-threat-crimson text-[24px]">warning</span>
                                        <h3 className="text-xl font-bold text-threat-crimson font-title-lg tracking-wide uppercase">AI Preliminary Analysis</h3>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {aiResult.reasons.map((r: string, i: number) => (
                                            <span key={i} className="text-sm text-text-muted">
                                                • {r}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="bg-error-container/20 border border-threat-crimson/30 p-4 rounded-lg mt-3">
                                        <p className="text-base text-threat-crimson font-bold uppercase tracking-wide mb-1">Recommendation:</p>
                                        <p className="text-base text-on-surface mb-2">{aiResult.recommendation}</p>
                                        <p className="text-sm font-bold text-radar-emerald flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px]">check_circle</span> 
                                            SMS Alert dispatched to field officer.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center justify-center bg-surface-base border border-border-grid p-6 rounded-lg min-w-[200px]">
                                    <span className="text-sm font-bold uppercase tracking-wider text-text-muted mb-2">Risk Score</span>
                                    <div className="relative w-28 h-28 flex items-center justify-center mb-3">
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" fill="none" r="40" stroke="#1A202C" strokeWidth="12" className="opacity-50"></circle>
                                            <circle 
                                                className="transition-all duration-1000 ease-out" 
                                                cx="50" cy="50" fill="none" r="40" 
                                                stroke={aiResult.risk_level === 'HIGH' ? '#D32F2F' : '#F59E0B'} 
                                                strokeDasharray="251.2" 
                                                strokeDashoffset={251.2 - (251.2 * (aiResult.score / 100))} 
                                                strokeWidth="12"
                                            ></circle>
                                        </svg>
                                        <span className="absolute text-3xl text-data-parchment font-bold font-telemetry-num">{aiResult.score}%</span>
                                    </div>
                                    <span className={`text-sm font-bold uppercase px-3 py-1 rounded-sm border ${aiResult.risk_level === 'HIGH' ? 'bg-error-container text-threat-crimson border-threat-crimson/50' : 'bg-surface-panel-active text-telemetry-amber border-telemetry-amber/50'}`}>
                                        {aiResult.risk_level} RISK
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Report Form Component (Pasu Style adapted to Light Tactical Minimal) */}
                    <section className="flex flex-col w-full bg-surface-panel border border-border-grid p-6 shadow-sm rounded-xl mb-6">
                        <form className="flex flex-col gap-6 w-full" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="font-title-md text-on-surface">{t('farmer.form.animalType')}</label>
                                    <select name="animal" className="rounded-lg border border-border-grid bg-surface-base py-3 px-4 focus:border-primary focus:ring-1 focus:ring-primary text-on-surface text-lg outline-none" required>
                                        <option disabled selected value="">{t('farmer.form.selectAnimal')}</option>
                                        <option value="cow">{t('farmer.species.cattle')}</option>
                                        <option value="buffalo">{t('farmer.species.buffalo')}</option>
                                        <option value="goat">{t('farmer.species.goat')}</option>
                                        <option value="sheep">{t('farmer.species.sheep')}</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="font-title-md text-on-surface">{t('farmer.form.mainSymptom')}</label>
                                    <select name="symptom" className="rounded-lg border border-border-grid bg-surface-base py-3 px-4 focus:border-primary focus:ring-1 focus:ring-primary text-on-surface text-lg outline-none" required>
                                        <option disabled selected value="">{t('farmer.form.selectSymptom')}</option>
                                        <option value="fever">{t('farmer.symp.fever')}</option>
                                        <option value="diarrhea">{t('farmer.symp.diarrhea')}</option>
                                        <option value="reduced-milk">{t('farmer.symp.milk')}</option>
                                        <option value="lameness">{t('farmer.symp.lameness')}</option>
                                        <option value="skin-lesions">{t('farmer.symp.skin')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 mt-2">
                                <span className="font-title-md text-on-surface">{t('farmer.form.additionalSymptoms')}</span>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-1 bg-surface-base p-4 rounded-lg border border-border-grid">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input name="additionalSymptoms" className="rounded border-outline-variant text-telemetry-saffron focus:ring-telemetry-saffron h-5 w-5 accent-telemetry-saffron" type="checkbox" value="Lethargy"/>
                                        <span className="font-body-md text-lg">{t('farmer.addsymp.lethargy')}</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input name="additionalSymptoms" className="rounded border-outline-variant text-telemetry-saffron focus:ring-telemetry-saffron h-5 w-5 accent-telemetry-saffron" type="checkbox" value="Coughing"/>
                                        <span className="font-body-md text-lg">{t('farmer.addsymp.coughing')}</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input name="additionalSymptoms" className="rounded border-outline-variant text-telemetry-saffron focus:ring-telemetry-saffron h-5 w-5 accent-telemetry-saffron" type="checkbox" value="Nasal Discharge"/>
                                        <span className="font-body-md text-lg">{t('farmer.addsymp.nasal')}</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input name="additionalSymptoms" className="rounded border-outline-variant text-telemetry-saffron focus:ring-telemetry-saffron h-5 w-5 accent-telemetry-saffron" type="checkbox" value="Drooling"/>
                                        <span className="font-body-md text-lg">{t('farmer.addsymp.drooling')}</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                                <div className="flex flex-col gap-2">
                                    <label className="font-title-md text-on-surface">{t('farmer.form.duration')}</label>
                                    <input name="duration" className="rounded-lg border border-border-grid bg-surface-base py-3 px-4 focus:border-primary focus:ring-1 focus:ring-primary text-on-surface text-lg outline-none w-full font-mono" min="1" placeholder="e.g., 3" type="number" required />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="font-title-md text-on-surface">{t('farmer.form.affectedAnimals')}</label>
                                    <input name="numAnimals" className="rounded-lg border border-border-grid bg-surface-base py-3 px-4 focus:border-primary focus:ring-1 focus:ring-primary text-on-surface text-lg outline-none w-full font-mono" min="1" placeholder="e.g., 5" type="number" required />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="font-title-md text-on-surface">{t('farmer.form.mortality')}</label>
                                    <input name="numMortality" className="rounded-lg border border-border-grid bg-surface-base py-3 px-4 focus:border-primary focus:ring-1 focus:ring-primary text-on-surface text-lg outline-none w-full font-mono" min="0" placeholder="e.g., 0" type="number" defaultValue="0" required />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 mt-2">
                                <label className="font-title-md text-on-surface">{t('farmer.form.notes')}</label>
                                <textarea name="notes" className="rounded-lg border border-border-grid bg-surface-base py-3 px-4 focus:border-primary focus:ring-1 focus:ring-primary text-on-surface text-lg outline-none font-body-md" placeholder={t('farmer.form.notesPlaceholder')} rows={3}></textarea>
                            </div>

                            <div className="flex flex-col gap-2 mt-2">
                                <label className="font-title-md text-on-surface">{t('farmer.form.upload')}</label>
                                <label htmlFor="animalImage" className="border-2 border-dashed border-border-grid rounded-xl p-8 flex flex-col items-center justify-center bg-surface-base hover:bg-surface-panel-active transition-colors cursor-pointer text-center group">
                                    <span className="material-symbols-outlined text-[48px] text-text-muted mb-2 group-hover:text-primary transition-colors">add_a_photo</span>
                                    <span className="text-lg text-text-muted group-hover:text-primary font-body-md">
                                        {fileName ? fileName : t('farmer.form.uploadText')}
                                    </span>
                                    <input name="image" id="animalImage" accept="image/*" className="hidden" type="file" onChange={handleFileChange} />
                                </label>
                            </div>

                            <input type="hidden" name="lat" value={location.split('°')[0]} />
                            <input type="hidden" name="lng" value={location.split(' ')[2]?.replace('°', '')} />

                            <div className="mt-4">
                                <button disabled={isSubmitting} className="w-full bg-primary text-white text-lg font-title-md py-4 rounded-xl hover:bg-primary-container transition-colors flex items-center justify-center gap-3 shadow-lg disabled:opacity-75 disabled:cursor-not-allowed" type="submit">
                                    <span className={`material-symbols-outlined text-[24px] ${isSubmitting ? 'animate-spin' : ''}`}>
                                        {isSubmitting ? 'refresh' : 'analytics'}
                                    </span> 
                                    {isSubmitting ? 'Processing AI Analysis...' : t('farmer.submit')}
                                </button>
                            </div>
                        </form>
                    </section>

                </div>
            </main>
        </div>
    );
}

