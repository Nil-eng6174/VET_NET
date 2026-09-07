'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CommandCenter() {
    const router = useRouter();
    const [alerts] = useState(['Pune has crossed the threshold! (12 cases)']);
    const [reports] = useState([
        { date: '2026-09-06', name: 'Ramesh', locality: 'Pune', animal: 'Cow', symptom: 'Fever', risk: 'HIGH' },
        { date: '2026-09-06', name: 'Suresh', locality: 'Satara', animal: 'Buffalo', symptom: 'Diarrhea', risk: 'MEDIUM' }
    ]);

    return (
        <div className="bg-surface text-on-surface min-h-screen flex flex-col font-sans">
            <header className="w-full h-16 bg-primary flex justify-between items-center px-4 md:px-6 z-50 shadow-md">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-primary">medical_services</span>
                    <span className="text-xl md:text-2xl font-bold text-on-primary font-['Manrope']">Command Center</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col text-right text-on-primary">
                        <span className="text-sm font-medium">Director</span>
                        <span className="text-xs opacity-80">HQ</span>
                    </div>
                    <button onClick={() => router.push('/')} className="bg-white/10 hover:bg-white/20 text-on-primary p-2 rounded flex items-center transition-colors">
                        <span className="material-symbols-outlined">logout</span>
                    </button>
                </div>
            </header>

            <main className="flex-grow p-4 md:p-6 overflow-y-auto">
                <div className="max-w-7xl mx-auto flex flex-col gap-6">
                    
                    {/* Alerts */}
                    {alerts.length > 0 && (
                        <div className="bg-red-50 border border-red-300 rounded-xl p-4 shadow-sm animate-pulse">
                            <h3 className="text-red-800 font-bold flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined">warning</span> Active Outbreak Alerts
                            </h3>
                            <ul className="list-disc pl-8 text-red-700 text-sm">
                                {alerts.map((alert, idx) => (
                                    <li key={idx}>{alert}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Map Area */}
                        <div className="lg:col-span-2 glass-card rounded-xl p-5 flex flex-col min-h-[400px]">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">map</span>
                                Geospatial Outbreak Monitoring
                            </h2>
                            <div className="flex-grow bg-surface-container rounded-lg border border-border-subtle relative flex items-center justify-center">
                                <span className="text-on-surface-variant font-medium">Map Component Placeholder</span>
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div className="glass-card rounded-xl p-5 flex flex-col">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">analytics</span>
                                Case Demographics
                            </h2>
                            <div className="flex-grow flex items-center justify-center">
                                <span className="text-on-surface-variant font-medium">Chart Component Placeholder</span>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="glass-card rounded-xl p-5 overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">list_alt</span>
                                Recent High-Risk Cases
                            </h2>
                            <button className="text-sm bg-primary text-white px-4 py-2 rounded hover:bg-primary-container">
                                Refresh Data
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-container-low text-on-surface-variant text-sm border-y border-border-subtle">
                                        <th className="p-3 font-semibold">Date</th>
                                        <th className="p-3 font-semibold">Farmer</th>
                                        <th className="p-3 font-semibold">Locality</th>
                                        <th className="p-3 font-semibold">Animal</th>
                                        <th className="p-3 font-semibold">Symptom</th>
                                        <th className="p-3 font-semibold">Risk Level</th>
                                        <th className="p-3 font-semibold text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((r, idx) => (
                                        <tr key={idx} className="border-b border-border-subtle hover:bg-surface-container-low/50">
                                            <td className="p-3 text-sm">{r.date}</td>
                                            <td className="p-3 text-sm">{r.name}</td>
                                            <td className="p-3 text-sm">{r.locality}</td>
                                            <td className="p-3 text-sm">{r.animal}</td>
                                            <td className="p-3 text-sm">{r.symptom}</td>
                                            <td className="p-3 text-sm font-bold">
                                                <span className={r.risk === 'HIGH' ? 'text-red-600' : 'text-orange-500'}>
                                                    {r.risk}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <button className="text-primary hover:bg-primary/10 p-1 rounded">
                                                    <span className="material-symbols-outlined text-[20px]">assignment</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
