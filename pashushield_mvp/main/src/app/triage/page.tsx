'use client';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../i18n/i18n';

export default function TriagePage() {
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <div className="bg-surface-base text-on-surface min-h-screen flex flex-col relative font-sans">
            <header className="fixed top-0 inset-x-0 z-50 bg-surface-panel/90 backdrop-blur-xl shadow-sm h-16 px-4 md:px-6 flex items-center justify-between border-b border-border-grid">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">health_and_safety</span>
                    <span className="font-title-lg text-data-parchment font-bold">AI Health Report Triage</span>
                </div>
                <button onClick={() => router.push('/')} className="text-text-muted hover:text-on-surface p-2 flex items-center">
                    <span className="material-symbols-outlined">home</span>
                </button>
            </header>
            <main className="flex-grow flex items-center justify-center p-6 pt-24">
                <div className="glass-card p-8 rounded text-center">
                    <h2 className="font-headline-md text-on-surface mb-2">Triage Module Placeholder</h2>
                    <p className="font-body-md text-text-muted">This route will be implemented in a subsequent step.</p>
                </div>
            </main>
        </div>
    );
}
