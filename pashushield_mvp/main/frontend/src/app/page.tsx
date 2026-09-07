'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../i18n/i18n';

export default function Home() {
    const router = useRouter();
    const [role, setRole] = useState('Farmer');
    const [view, setView] = useState('login'); // 'login', 'register', or 'portal_choice'
    const { t, language, setLanguage } = useTranslation();
    const registerFormRef = useRef<HTMLFormElement>(null);

    const [loginError, setLoginError] = useState('');

    const handleLogin = async (e: any) => {
        e.preventDefault();
        const form = e.currentTarget;
        const aadhaar = (form.querySelector('input[name="aadhaar"]') as HTMLInputElement)?.value?.trim();
        const selectedRole = (form.querySelector('select[name="role"]') as HTMLSelectElement)?.value || role;

        if (!aadhaar || aadhaar.length < 12) {
            setLoginError('Please enter a valid 12-digit Aadhaar number.');
            return;
        }
        setLoginError('');

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: selectedRole, aadhaar })
            });
            const data = await res.json();
            if (data.success) {
                // Persist farmer identity to localStorage so /farmer/page.tsx can read it
                localStorage.setItem('ps_user', JSON.stringify({
                    name: data.name,
                    mobile: data.mobile,
                    locality: data.locality,
                    aadhaar: aadhaar,
                    role: selectedRole
                }));
                setView('portal_choice');
            } else {
                setLoginError(data.message || 'Login failed. Please register first.');
            }
        } catch {
            setLoginError('Cannot connect to server. Is the backend running?');
        }
    };

    const handleNavigate = (destination: 'dashboard' | 'report') => {
        if (role === 'Farmer') {
            router.push(destination === 'report' ? '/farmer' : '/farmer/dashboard');
        } else {
            router.push(destination === 'report' ? '/vet/reports' : '/vet');
        }
    };

    return (
        <div className="bg-surface-base text-on-surface min-h-screen flex flex-col relative overflow-y-auto">
            {/* Header */}
            <header className="fixed top-0 inset-x-0 z-50 bg-surface-panel/90 backdrop-blur-xl shadow-sm h-16 px-4 md:px-6 flex items-center justify-between border-b border-border-grid">
                <div className="flex items-center gap-2">
                    <img 
                      alt="PashuShield"
                      src="https://lh3.googleusercontent.com/aida/AEtjO1XLDFrDglF2n3r1uftl6goq7UaqNywM2Y8F1AiGpEF9f2yjmaeRYSn6PlDywK2f9wJ1UUksm88RBO2IVnE0Ww_w3t1JskqMyVGZCs4ChjZiCwmC0Zv6qG8IENUxijWZ3KJXLy6oS21lwJg1Bi3e7vYCnNIWDJ96uf5OVMlXqGR4YTnqu595XvzdXTj-U_OT2TihUn11A2hBufR-4lKiCjQHOPqDL75oLHa3ZzgdWwWO4m0_jvF6QCL-MM4" 
                      className="h-8 w-auto object-contain flex-shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="font-title-lg text-data-parchment tracking-tight truncate">{t('app.title')}</span>
                            <span className="px-1 py-0.5 bg-surface-panel-active text-radar-emerald font-label-sm uppercase rounded-sm">{t('app.subtitle')}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-1 items-end">
                    <div className="flex items-center bg-surface-container-high rounded p-1 text-sm font-label-sm font-semibold shadow-sm">
                        <button className={`px-2 py-1 rounded ${language === 'en' ? 'bg-primary text-on-primary' : 'text-text-muted hover:text-on-surface'}`} onClick={() => setLanguage('en')}>EN</button>
                        <button className={`px-2 py-1 rounded ${language === 'mr' ? 'bg-primary text-on-primary' : 'text-text-muted hover:text-on-surface'}`} onClick={() => setLanguage('mr')}>मराठी</button>
                        <button className={`px-2 py-1 rounded ${language === 'gu' ? 'bg-primary text-on-primary' : 'text-text-muted hover:text-on-surface'}`} onClick={() => setLanguage('gu')}>ગુજરાતી</button>
                    </div>
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center p-4 md:p-6 z-10 relative pt-24 pb-12">
                <div className="w-full max-w-lg glass-card rounded-2xl overflow-hidden flex flex-col shadow-lg border border-border-grid">
                    <div className="bg-surface-panel border-b border-border-grid p-8 text-center">
                        <h1 className="font-headline-lg text-primary text-3xl font-bold">
                            {view === 'portal_choice' ? t('login.portal_title') : t('login.welcome')}
                        </h1>
                        <p className="font-body-md text-text-muted mt-2 text-lg">
                            {view === 'portal_choice' ? `Welcome back, ${role}.` : t('login.subtitle')}
                        </p>
                    </div>
                    
                    <div className="p-8 flex flex-col gap-6 bg-surface-base">
                        {view === 'portal_choice' ? (
                            <div className="flex flex-col gap-4 animate-in fade-in zoom-in duration-300">
                                <button 
                                    onClick={() => handleNavigate('dashboard')}
                                    className="flex items-center justify-between p-6 bg-surface-panel border border-border-grid rounded-xl hover:border-primary hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center group-hover:bg-primary-container transition-colors">
                                            <span className="material-symbols-outlined text-text-muted group-hover:text-primary text-[28px]">dashboard</span>
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-title-lg text-on-surface font-bold">{t('login.portal_dashboard')}</h3>
                                            <p className="font-body-sm text-text-muted mt-1">View insights and recent activity</p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-outline-variant group-hover:text-primary">arrow_forward_ios</span>
                                </button>
                                
                                <button 
                                    onClick={() => handleNavigate('report')}
                                    className="flex items-center justify-between p-6 bg-surface-panel border border-border-grid rounded-xl hover:border-telemetry-saffron hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center group-hover:bg-primary-container transition-colors">
                                            <span className="material-symbols-outlined text-text-muted group-hover:text-telemetry-saffron text-[28px]">add_circle</span>
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-title-lg text-on-surface font-bold">{t('login.portal_report')}</h3>
                                            <p className="font-body-sm text-text-muted mt-1">File a new health triage report</p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-outline-variant group-hover:text-telemetry-saffron">arrow_forward_ios</span>
                                </button>

                                <button className="mt-4 font-title-md text-text-muted hover:text-primary transition-colors mx-auto" onClick={() => setView('login')}>
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex bg-surface-panel-active p-1.5 rounded-lg border border-border-grid" role="group">
                                    <button 
                                        className={`flex-1 py-3 text-center rounded-md flex items-center justify-center gap-2 transition-all font-title-md ${role === 'Farmer' ? 'bg-surface-panel text-primary shadow-sm' : 'text-text-muted hover:text-on-surface'}`}
                                        onClick={() => setRole('Farmer')}
                                    >
                                        <span className="material-symbols-outlined text-[22px]">agriculture</span>
                                        {t('nav.farmer')}
                                    </button>
                                    <button 
                                        className={`flex-1 py-3 text-center rounded-md flex items-center justify-center gap-2 transition-all font-title-md ${role === 'Veterinarian' ? 'bg-surface-panel text-primary shadow-sm' : 'text-text-muted hover:text-on-surface'}`}
                                        onClick={() => setRole('Veterinarian')}
                                    >
                                        <span className="material-symbols-outlined text-[22px]">medical_services</span>
                                        {t('nav.veterinarian')}
                                    </button>
                                </div>
                                
                                {view === 'login' ? (
                                    <form className="flex flex-col gap-6 transition-opacity duration-300" onSubmit={handleLogin}>
                                        {/* Hidden role field so handleLogin can read it */}
                                        <input type="hidden" name="role" value={role} />
                                        <div>
                                            <label className="block font-title-md text-on-surface mb-2" htmlFor="login-aadhaar">{t('login.aadhaar')}</label>
                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">fingerprint</span>
                                                <input
                                                    className="w-full pl-12 pr-4 py-4 border border-border-grid rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-surface-panel aadhaar-input font-bold text-lg text-data-parchment"
                                                    id="login-aadhaar"
                                                    name="aadhaar"
                                                    maxLength={12}
                                                    placeholder="12-digit Aadhaar"
                                                    type="text"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        {loginError && (
                                            <p className="text-sm text-red-500 -mt-3 font-medium">{loginError}</p>
                                        )}
                                        <button className="w-full bg-primary hover:bg-telemetry-saffron text-on-primary font-title-md py-4 rounded-xl mt-2 transition-colors flex items-center justify-center gap-2 shadow-sm font-bold text-lg" type="submit">
                                            {t('login.button')} <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                        </button>
                                        <div className="text-center mt-2">
                                            <span className="font-body-md text-text-muted">{t('login.no_account')} </span>
                                            <button className="font-title-md text-primary hover:underline font-bold" onClick={() => setView('register')} type="button">{t('login.register_now')}</button>
                                        </div>
                                    </form>
                                ) : (
                                    <form ref={registerFormRef} className="flex flex-col gap-5 transition-opacity duration-300" onSubmit={async (e) => {
                                            e.preventDefault();
                                            const fd = new FormData(registerFormRef.current!);
                                            const payload = {
                                                role: (fd.get('role') as string),
                                                name: (fd.get('name') as string),
                                                aadhaar: (fd.get('aadhaar') as string),
                                                mobile: (fd.get('mobile') as string),
                                                locality: (fd.get('locality') as string),
                                            };
                                            const res = await fetch('/api/register', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
                                            const data = await res.json();
                                            if (data.success) { alert('Registration successful! Please login.'); setView('login'); }
                                            else { alert(data.message || 'Registration failed.'); }
                                        }}>
                                        <div>
                                            <label className="block font-title-md text-on-surface mb-1.5">Role</label>
                                            <select name="role" required className="w-full px-4 py-3.5 border border-border-grid rounded-xl focus:ring-2 focus:ring-primary outline-none bg-surface-panel text-on-surface font-body-md text-base">
                                                <option value="Farmer">Farmer</option>
                                                <option value="Veterinarian">Veterinarian</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block font-title-md text-on-surface mb-1.5">Full Name</label>
                                            <input name="name" required className="w-full px-4 py-3.5 border border-border-grid rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-surface-panel text-on-surface font-body-md text-base" placeholder="As per Aadhaar" type="text"/>
                                        </div>
                                        <div>
                                            <label className="block font-title-md text-on-surface mb-1.5">Aadhaar Number</label>
                                            <input name="aadhaar" required maxLength={12} minLength={12} className="w-full px-4 py-3.5 border border-border-grid rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-surface-panel text-on-surface font-body-md text-base" placeholder="12-digit Aadhaar" type="text"/>
                                        </div>
                                        <div>
                                            <label className="block font-title-md text-on-surface mb-1.5">Mobile Number <span className="text-telemetry-saffron text-xs font-normal">(SMS alerts will be sent here)</span></label>
                                            <div className="flex items-center border border-border-grid rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary bg-surface-panel">
                                                <span className="px-3 py-3.5 bg-surface-base text-text-muted font-bold border-r border-border-grid select-none">+91</span>
                                                <input name="mobile" required maxLength={10} minLength={10} className="flex-1 px-4 py-3.5 outline-none bg-transparent text-on-surface font-body-md text-base" placeholder="10-digit mobile" type="tel"/>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block font-title-md text-on-surface mb-1.5">District / Locality</label>
                                            <select name="locality" required className="w-full px-4 py-3.5 border border-border-grid rounded-xl focus:ring-2 focus:ring-primary outline-none bg-surface-panel text-on-surface font-body-md text-base">
                                                {['Pune','Solapur','Satara','Kolhapur','Sangli','Ahmednagar','Nashik','Raigad','Ratnagiri','Sindhudurg'].map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <button className="w-full bg-primary hover:bg-telemetry-saffron text-on-primary font-title-md py-4 rounded-xl mt-1 transition-colors flex items-center justify-center gap-2 shadow-sm font-bold text-lg" type="submit">
                                            Register Now <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                                        </button>
                                        <div className="text-center mt-1">
                                            <span className="font-body-md text-text-muted">Already have an account? </span>
                                            <button className="font-title-md text-primary hover:underline font-bold" onClick={() => setView('login')} type="button">Login</button>
                                        </div>
                                    </form>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
