'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../../i18n/i18n';

interface ReportItem {
    date: string;
    animal: string;
    symptom: string;
    additional_symptoms: string;
    num_animals: string;
    num_mortality: string;
    risk_score: string;
    risk_level: string;
    recommendation: string;
    image: string;
}

interface FarmerInfo {
    name: string;
    mobile: string;
    locality: string;
    aadhaar: string;
    report_count: number;
}

const RISK_STYLES: Record<string, string> = {
    HIGH: 'bg-error-container text-threat-crimson border-threat-crimson/50',
    MEDIUM: 'bg-surface-panel-active text-telemetry-amber border-telemetry-amber/50',
    LOW: 'bg-surface-panel-active text-radar-emerald border-radar-emerald/50',
};

export default function FarmerDashboard() {
    const router = useRouter();
    const { t } = useTranslation();

    // Logged-in farmer identity from localStorage (same as /farmer/page.tsx)
    const [farmer] = useState(() => {
        try {
            const stored = localStorage.getItem('ps_user');
            if (stored) {
                const user = JSON.parse(stored);
                return {
                    name: user.name || '',
                    mobile: user.mobile || '',
                    locality: user.locality || '',
                    aadhaar: user.aadhaar || ''
                };
            }
        } catch {}
        return { name: '', mobile: '', locality: '', aadhaar: '' };
    });

    const [history, setHistory] = useState<ReportItem[]>([]);
    const [info, setInfo] = useState<FarmerInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!farmer.aadhaar && !farmer.mobile) return;

        let cancelled = false;
        setLoading(true);
        setError('');

        (async () => {
            try {
                const params = new URLSearchParams();
                if (farmer.aadhaar) params.set('aadhaar', farmer.aadhaar);
                if (farmer.mobile) params.set('mobile', farmer.mobile);
                const res = await fetch(`/api/farmer/history?${params.toString()}`);
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || t('farmer.dashboard.error'));
                }
                if (data.success) {
                    setHistory(data.history || []);
                    setInfo(data.info || null);
                } else {
                    setError(data.message || t('farmer.dashboard.error'));
                }
            } catch {
                setError(t('farmer.dashboard.error'));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [farmer.aadhaar, farmer.mobile, t]);

    const maskAadhaar = (aadhaar: string) =>
        aadhaar ? aadhaar.replace(/(.{4})(.{4})(.{4})/, '$1-$2-$3') : '••••-••••-••••';

    const formatDate = (date: string) => {
        if (!date) return '—';
        // Excel stores "YYYY-MM-DD HH:MM:SS"; show date + time
        return date.replace('T', ' ');
    };

    return (
        <div className="bg-surface-base text-on-surface min-h-screen flex flex-col relative font-sans">
            {/* Tactical Header */}
            <header className="fixed top-0 inset-x-0 z-50 bg-surface-panel/90 backdrop-blur-xl shadow-sm h-16 px-4 md:px-6 flex items-center justify-between border-b border-border-grid">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">dashboard</span>
                    <span className="font-title-lg text-data-parchment font-bold">{t('farmer.dashboard.title')}</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center bg-surface-container-high px-3 py-1.5 gap-2 text-radar-emerald font-label-sm border border-border-grid rounded-lg shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-radar-emerald animate-pulse"></span>
                        <span>{t('farmer.dashboard.sync')}</span>
                    </div>
                    <button onClick={() => router.push('/farmer')} className="text-text-muted hover:text-on-surface p-2 bg-surface-container-high rounded-full hover:bg-border-grid transition-colors">
                        <span className="material-symbols-outlined text-[24px]">add_circle</span>
                    </button>
                    <button onClick={() => router.push('/')} className="text-text-muted hover:text-on-surface p-2 bg-surface-container-high rounded-full hover:bg-border-grid transition-colors">
                        <span className="material-symbols-outlined text-[24px]">logout</span>
                    </button>
                </div>
            </header>

            <main className="flex flex-col relative w-full pt-24 pb-24 bg-surface-base min-h-screen">
                <div className="flex flex-col w-full pb-12 max-w-4xl mx-auto px-4 md:px-6">

                    {/* Farmer Info Card */}
                    <div className="flex flex-col w-full bg-surface-panel p-6 rounded-xl shadow-sm border border-border-grid mb-6">
                        <div className="flex items-start justify-between gap-6">
                            <div className="flex flex-col min-w-0 gap-1.5">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-telemetry-saffron text-[24px]">verified_user</span>
                                    <span className="font-headline-sm text-data-parchment truncate">
                                        {info?.name || farmer.name || 'Loading...'}
                                    </span>
                                </div>
                                <span className="font-body-md text-text-muted truncate ml-9">
                                    UID: {maskAadhaar(info?.aadhaar || farmer.aadhaar)} • {farmer.mobile ? `+91-${farmer.mobile}` : info?.mobile || ''}
                                </span>
                                <span className="font-title-md text-secondary-fixed ml-9 mt-1">
                                    {t('farmer.dashboard.locality')}: {info?.locality || farmer.locality || '—'}
                                </span>
                            </div>
                            <div className="bg-surface-panel-active px-4 py-3 flex flex-col items-end flex-shrink-0 text-right rounded-lg border border-border-grid">
                                <span className="font-title-md text-radar-emerald">{t('farmer.dashboard.reportCount')}</span>
                                <span className="font-body-sm text-data-parchment mt-1">{info?.report_count ?? (loading ? t('farmer.dashboard.loading') : 0)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Reporting History */}
                    <div className="flex flex-col w-full">
                        <div className="flex items-center justify-between bg-surface-panel-active border border-border-grid px-6 py-4 text-data-parchment rounded-t-xl shadow-sm">
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-primary">history</span>
                                <span className="font-headline-sm text-data-parchment tracking-tight">{t('farmer.dashboard.history.title')}</span>
                            </div>
                        </div>

                        {loading && (
                            <div className="flex flex-col items-center justify-center bg-surface-panel border-x border-b border-border-grid px-6 py-12 rounded-b-xl gap-3">
                                <span className="material-symbols-outlined text-primary animate-spin" style={{ animationDuration: '1.5s' }}>radar</span>
                                <span className="font-body-md text-text-muted">{t('farmer.dashboard.loading')}</span>
                            </div>
                        )}

                        {!loading && error && (
                            <div className="flex flex-col items-center justify-center bg-surface-panel border-x border-b border-border-grid px-6 py-12 rounded-b-xl gap-3 text-center">
                                <span className="material-symbols-outlined text-threat-crimson text-[40px]">cloud_off</span>
                                <span className="font-body-md text-threat-crimson">{error}</span>
                                <button
                                    onClick={loadHistory}
                                    className="mt-2 bg-primary text-white font-title-md py-2 px-6 rounded-lg hover:bg-primary-container transition-colors shadow-sm"
                                >
                                    {t('farmer.dashboard.retry')}
                                </button>
                            </div>
                        )}

                        {!loading && !error && history.length === 0 && (
                            <div className="flex flex-col items-center justify-center bg-surface-panel border-x border-b border-border-grid px-6 py-12 rounded-b-xl gap-3 text-center">
                                <span className="material-symbols-outlined text-text-muted text-[40px]">inbox</span>
                                <span className="font-body-md text-text-muted">{t('farmer.dashboard.history.empty')}</span>
                                <button
                                    onClick={() => router.push('/farmer')}
                                    className="mt-2 bg-primary text-white font-title-md py-2 px-6 rounded-lg hover:bg-primary-container transition-colors shadow-sm"
                                >
                                    {t('farmer.dashboard.history.reportNow')}
                                </button>
                            </div>
                        )}

                        {!loading && !error && history.length > 0 && (
                            <div className="overflow-x-auto bg-surface-panel border-x border-b border-border-grid rounded-b-xl shadow-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-border-grid bg-surface-base/60">
                                            <th className="px-4 py-3 font-label-sm text-text-muted uppercase tracking-wider">{t('farmer.dashboard.history.date')}</th>
                                            <th className="px-4 py-3 font-label-sm text-text-muted uppercase tracking-wider">{t('farmer.dashboard.history.animal')}</th>
                                            <th className="px-4 py-3 font-label-sm text-text-muted uppercase tracking-wider">{t('farmer.dashboard.history.symptom')}</th>
                                            <th className="px-4 py-3 font-label-sm text-text-muted uppercase tracking-wider">{t('farmer.dashboard.history.mortality')}</th>
                                            <th className="px-4 py-3 font-label-sm text-text-muted uppercase tracking-wider">{t('farmer.dashboard.history.risk')}</th>
                                            <th className="px-4 py-3 font-label-sm text-text-muted uppercase tracking-wider">{t('farmer.dashboard.history.recommendation')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map((report, i) => (
                                            <tr key={`${report.date}-${report.animal}-${i}`} className="border-b border-border-grid last:border-b-0 hover:bg-surface-panel-active/60 transition-colors">
                                                <td className="px-4 py-4 font-body-sm text-text-muted whitespace-nowrap">{formatDate(report.date)}</td>
                                                <td className="px-4 py-4 font-title-md text-on-surface capitalize">{report.animal || '—'}</td>
                                                <td className="px-4 py-4 font-body-md text-on-surface">{report.symptom || '—'}</td>
                                                <td className="px-4 py-4 font-telemetry-num font-bold text-on-surface">{report.num_mortality || '0'}</td>
                                                <td className="px-4 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase rounded-sm border ${RISK_STYLES[report.risk_level] || RISK_STYLES.LOW}`}>
                                                        {report.risk_level || '—'}
                                                        {report.risk_score ? ` • ${report.risk_score}%` : ''}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 font-body-sm text-text-muted max-w-[280px]">{report.recommendation || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}