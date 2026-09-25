'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function LabDashboard() {
    const router = useRouter();
    const [samples, setSamples] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSamples = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/samples');
            const data = await res.json();
            if (data.success) {
                setSamples(data.samples || []);
            }
        } catch (e) {
            console.error(e);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchSamples();
    }, []);

    const updateStatus = async (sampleId: string, status: string, result: string | null = null) => {
        try {
            const res = await fetch(`/api/samples/${sampleId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, result })
            });
            if (res.ok) {
                fetchSamples();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleResult = (sampleId: string) => {
        const res = prompt("Enter result for Sample " + sampleId + " (e.g. POSITIVE / NEGATIVE)");
        if (res) {
            updateStatus(sampleId, 'Resulted', res);
        }
    };

    return (
        <div className="bg-[#f0f4f8] text-gray-800 min-h-screen flex flex-col font-sans">
            <header className="w-full h-16 bg-[#004d40] flex justify-between items-center px-4 md:px-6 z-50 shadow-md">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-white">science</span>
                    <span className="text-xl md:text-2xl font-bold text-white font-['Manrope']">Central Lab Portal</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col text-right text-white">
                        <span className="text-sm font-medium">Lab Technician</span>
                        <span className="text-xs opacity-80">Diagnostics</span>
                    </div>
                    <button onClick={() => router.push('/')} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded flex items-center transition-colors">
                        <span className="material-symbols-outlined">logout</span>
                    </button>
                </div>
            </header>

            <main className="flex-grow p-4 md:p-6 overflow-y-auto">
                <div className="max-w-7xl mx-auto flex flex-col gap-6">
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                                <span className="material-symbols-outlined text-[#004d40]">biotech</span>
                                Active Sample Queue
                            </h2>
                            <button onClick={fetchSamples} className="text-sm bg-[#004d40] text-white px-4 py-2 rounded hover:bg-[#00332a] transition-colors flex items-center gap-1">
                                <span className="material-symbols-outlined text-[18px]">refresh</span> Refresh Queue
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="p-8 text-center text-gray-500">Loading samples...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-600 text-sm border-y border-gray-200 uppercase tracking-wider">
                                            <th className="p-4 font-semibold">Sample ID</th>
                                            <th className="p-4 font-semibold">Case Reference</th>
                                            <th className="p-4 font-semibold">Requested At</th>
                                            <th className="p-4 font-semibold">Status</th>
                                            <th className="p-4 font-semibold">Result</th>
                                            <th className="p-4 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {samples.map((s, idx) => (
                                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="p-4 text-sm font-bold text-gray-800">{s.sample_id}</td>
                                                <td className="p-4 text-sm text-gray-600">{s.case_id}</td>
                                                <td className="p-4 text-sm text-gray-500">{s.requested_at}</td>
                                                <td className="p-4 text-sm font-bold">
                                                    <span className={`inline-block px-3 py-1 rounded-full text-xs tracking-wide ${
                                                        s.status === 'In Transit' ? 'bg-amber-100 text-amber-800' :
                                                        s.status === 'Received' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-emerald-100 text-emerald-800'
                                                    }`}>
                                                        {s.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm font-bold text-gray-800">{s.result || '-'}</td>
                                                <td className="p-4 text-right flex justify-end gap-2">
                                                    {s.status === 'In Transit' && (
                                                        <button onClick={() => updateStatus(s.sample_id, 'Received')} className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded hover:bg-blue-700 shadow-sm transition-colors">
                                                            Mark Received
                                                        </button>
                                                    )}
                                                    {s.status === 'Received' && (
                                                        <button onClick={() => handleResult(s.sample_id)} className="bg-[#004d40] text-white text-xs px-3 py-1.5 rounded hover:bg-[#00332a] shadow-sm transition-colors">
                                                            Enter Result
                                                        </button>
                                                    )}
                                                    <a href={`http://127.0.0.1:5000${s.qr_code_url}`} target="_blank" rel="noopener noreferrer" className="bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded hover:bg-gray-300 shadow-sm transition-colors flex items-center">
                                                        QR
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                        {samples.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="py-8 text-center text-gray-500">No samples in queue.</td>
                                            </tr>
                                        )}
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
