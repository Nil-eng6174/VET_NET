'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export default function VetDashboard() {
    const router = useRouter();
    const [currentTime, setCurrentTime] = useState('');
    
    const [alerts, setAlerts] = useState<string[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [districts, setDistricts] = useState<string[]>([]);
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Phase 1 MVP states
    const [selectedCase, setSelectedCase] = useState<any>(null);
    const [fieldWorker, setFieldWorker] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [sampleStatus, setSampleStatus] = useState('');

    const mapRef = useRef<any>(null);
    const symptomChartRef = useRef<any>(null);
    const histogramChartRef = useRef<any>(null);
    const histogramDataStore = useRef<any>({});

    const handleAssign = async () => {
        if (!selectedCase || !fieldWorker) return;
        const caseId = `${selectedCase.name}-${selectedCase.date}`; // Pseudo ID since MVP lacks DB case_id
        const res = await fetch(`/api/cases/${caseId}/assign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ field_worker: fieldWorker })
        });
        if (res.ok) alert('Assigned successfully to ' + fieldWorker);
    };

    const handleRequestSample = async () => {
        if (!selectedCase) return;
        const caseId = `${selectedCase.name}-${selectedCase.date}`;
        const res = await fetch('/api/samples', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ case_id: caseId, vet_name: 'District Vet' })
        });
        const data = await res.json();
        if (data.success) {
            setQrCodeUrl(data.sample.qr_code_url);
            setSampleStatus('Sample requested successfully. Sample ID: ' + data.sample.sample_id);
        }
    };

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST');
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const initDashboard = async () => {
            // Dynamically load leaflet and chart.js to avoid Next.js SSR window issues
            const L = (await import('leaflet')).default;
            await import('leaflet/dist/leaflet.css');
            const Chart = (await import('chart.js/auto')).default;

            try {
                const res = await fetch('/api/vet/dashboard_data');
                const data = await res.json();
                if (data.success) {
                    setAlerts(data.alerts || []);
                    setReports(data.recent_reports || []);
                    histogramDataStore.current = data.histogram_data || {};
                    const distKeys = Object.keys(data.histogram_data || {});
                    setDistricts(distKeys);
                    if (distKeys.length > 0) {
                        setSelectedDistrict(distKeys[0]);
                    }

                    // Render Map
                    if (!mapRef.current) {
                        mapRef.current = L.map('map').setView([18.5204, 73.8567], 7);
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '© OpenStreetMap contributors'
                        }).addTo(mapRef.current);
                    }

                    const coords: Record<string, [number, number]> = {
                        'Pune': [18.5204, 73.8567], 'Solapur': [17.6599, 75.9064],
                        'Satara': [17.6805, 74.0183], 'Kolhapur': [16.7050, 74.2433],
                        'Sangli': [16.8524, 74.5815], 'Ahmednagar': [19.0952, 74.7496],
                        'Nashik': [19.9975, 73.7898], 'Raigad': [18.5158, 73.1822],
                        'Ratnagiri': [16.9902, 73.3120], 'Sindhudurg': [16.1091, 73.7461]
                    };

                    if (data.localities_count) {
                        for (const [locality, count] of Object.entries(data.localities_count)) {
                            if (coords[locality]) {
                                const latlng = coords[locality];
                                const numCount = Number(count);
                                let color = numCount >= 10 ? '#D32F2F' : '#F59E0B'; // Threat Crimson / Amber
                                L.circleMarker(latlng, {
                                    color: color,
                                    fillOpacity: 0.6,
                                    radius: 8 + (numCount * 2)
                                }).addTo(mapRef.current)
                                  .bindPopup(`<b>${locality}</b><br>${numCount} Active Case(s)`);
                            }
                        }
                    }

                    // Render Symptom Pie Chart
                    const symCtx = (document.getElementById('symptomChart') as HTMLCanvasElement)?.getContext('2d');
                    if (symCtx && data.chart_labels) {
                        if (symptomChartRef.current) symptomChartRef.current.destroy();
                        symptomChartRef.current = new Chart(symCtx, {
                            type: 'pie',
                            data: {
                                labels: data.chart_labels,
                                datasets: [{
                                    data: data.chart_data,
                                    backgroundColor: ['#FE6B00', '#F59E0B', '#059669', '#3B82F6', '#8B5CF6']
                                }]
                            },
                            options: { maintainAspectRatio: false }
                        });
                    }
                }
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            } finally {
                setIsLoading(false);
            }
        };
        initDashboard();
    }, []);

    // Effect to handle histogram updates when district changes
    useEffect(() => {
        if (!selectedDistrict) return;
        const loadHistogram = async () => {
            const Chart = (await import('chart.js/auto')).default;
            const dataForDist = histogramDataStore.current[selectedDistrict];
            if (!dataForDist) return;

            const labels = Object.keys(dataForDist);
            const values = Object.values(dataForDist);

            const ctx = (document.getElementById('histogramChart') as HTMLCanvasElement)?.getContext('2d');
            if (ctx) {
                if (histogramChartRef.current) histogramChartRef.current.destroy();
                histogramChartRef.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Number of Animals Affected',
                            data: values,
                            backgroundColor: '#FE6B00'
                        }]
                    },
                    options: { maintainAspectRatio: false }
                });
            }
        };
        loadHistogram();
    }, [selectedDistrict]);


    return (
        <div className="bg-surface-base text-on-surface font-body-md flex flex-col min-h-screen selection:bg-telemetry-saffron selection:text-white">
            {/* Tactical Header */}
            <header className="fixed top-0 inset-x-0 z-50 bg-surface-panel/95 backdrop-blur-md border-b border-border-grid">
                <div className="h-16 w-full px-4 md:px-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 shrink-0">
                        <img alt="PashuShield Official Logo" className="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1XLDFrDglF2n3r1uftl6goq7UaqNywM2Y8F1AiGpEF9f2yjmaeRYSn6PlDywK2f9wJ1UUksm88RBO2IVnE0Ww_w3t1JskqMyVGZCs4ChjZiCwmC0Zv6qG8IENUxijWZ3KJXLy6oS21lwJg1Bi3e7vYCnNIWDJ96uf5OVMlXqGR4YTnqu595XvzdXTj-U_OT2TihUn11A2hBufR-4lKiCjQHOPqDL75oLHa3ZzgdWwWO4m0_jvF6QCL-MM4"/>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="font-headline-sm text-data-parchment font-bold uppercase tracking-wider">PashuShield</span>
                                <span className="px-1 py-0.5 bg-telemetry-saffron/10 border border-telemetry-saffron/30 text-telemetry-saffron font-label-sm uppercase tracking-widest rounded-sm">VET COMMAND</span>
                            </div>
                            <span className="font-body-sm text-text-muted hidden sm:inline-block">Regional Outbreak Command Center</span>
                        </div>
                    </div>
                    
                    <div className="hidden xl:flex items-center gap-4 px-4 py-1.5 bg-surface-base border border-border-grid rounded-lg">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-radar-emerald animate-pulse shadow-[0_0_8px_rgba(5,150,105,0.6)]"></span>
                            <span className="font-label-sm uppercase tracking-widest text-text-muted">Node Status:</span>
                            <span className="font-label-sm uppercase font-bold text-radar-emerald">ACTIVE</span>
                        </div>
                        <span className="h-3 w-px bg-border-grid"></span>
                        <div className="flex items-center gap-2 text-text-muted">
                            <span className="material-symbols-outlined text-[16px]">location_on</span>
                            <span className="font-label-sm text-on-surface">PUNE HQ-04</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                        <div className="hidden md:flex items-center gap-3 pl-3 border-l border-border-grid">
                            <div className="flex flex-col text-right">
                                <span className="font-title-md text-data-parchment font-semibold leading-tight">Dr. Rajesh K. Sharma</span>
                                <span className="font-label-sm text-telemetry-saffron uppercase tracking-wider">Nodal Vet Officer</span>
                            </div>
                            <img alt="Profile" className="w-9 h-9 rounded-full object-cover border-2 border-surface-panel-active" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7z4ZJCosrTYwHrC7094cleLQLzJh_RAC0-TkVnDM92oWSX7_jJzwDi12BlRZbY1Gav9PMkjZcpAprjYFZPaO-etQR7WSTFdnT_bph7S_S4BN2w0IcAITe9RZJYSSjTUcXMHXoUpwCD2_AzzKrtsSA6JE7sTW0QtI4_v1lGZpnRi_XogxLvCy_rRVqrTaAIbpDWdw3Ysrv3P-YjNTnK21uSv6Quey7RMoo1K4mVBO_w_MgDMkoSGH3"/>
                        </div>
                        <button onClick={() => router.push('/')} className="text-text-muted hover:text-on-surface bg-surface-base border border-border-grid p-2 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-[20px]">logout</span>
                        </button>
                    </div>
                </div>
                <div className="h-10 bg-surface-panel-active border-t border-border-grid px-4 md:px-6 flex items-center justify-between overflow-x-auto">
                    <div className="flex items-center gap-6 shrink-0 font-label-md text-text-muted">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">radar</span>
                            <span>SYS-TELEMETRY: CLUSTER_ENG_v4.2</span>
                        </div>
                        <span className="text-border-grid">/</span>
                        <div className="flex items-center gap-2">
                            <span>RADIUS_THRESHOLD:</span>
                            <span className="text-telemetry-saffron font-bold">10.0 KM</span>
                        </div>
                        <span className="text-border-grid">/</span>
                        <div className="flex items-center gap-2">
                            <span>TEMPORAL_WINDOW:</span>
                            <span className="text-data-parchment font-bold">48 HRS</span>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-4 font-label-sm text-text-muted shrink-0 tracking-wider">
                        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-threat-crimson"></span> HIGH RISK SURVEILLANCE</span>
                        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-telemetry-amber"></span> SUSPECTED CLUSTERS</span>
                    </div>
                </div>
            </header>

            <main className="flex-grow pt-[104px] p-4 md:p-6 overflow-y-auto">
                <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
                    
                    {alerts.length > 0 && (
                        <div className="flex flex-col gap-2">
                            {alerts.map((alert, i) => (
                                <div key={i} className="bg-threat-crimson/10 border-l-4 border-threat-crimson text-threat-crimson px-6 py-3 rounded shadow-sm flex items-center gap-3">
                                    <span className="material-symbols-outlined">warning</span>
                                    <span className="font-title-md">{alert}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="w-full flex items-center justify-center p-12 text-primary">
                            <span className="material-symbols-outlined text-[48px] animate-spin">refresh</span>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Chart Card */}
                                <div className="bg-surface-panel border border-border-grid rounded-xl p-6 lg:col-span-4 flex flex-col min-h-[380px] shadow-sm">
                                    <h3 className="text-lg font-bold font-title-md text-data-parchment uppercase tracking-wide mb-4">Cases by Symptom</h3>
                                    <div className="flex-1 relative flex items-center justify-center bg-surface-base border border-border-grid rounded-lg p-2 overflow-hidden h-64">
                                        <canvas id="symptomChart" className="w-full h-full"></canvas>
                                    </div>
                                </div>

                                {/* GIS Map Card */}
                                <div className="bg-surface-panel border border-border-grid rounded-xl p-6 lg:col-span-8 flex flex-col min-h-[380px] shadow-sm">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold font-title-md text-data-parchment uppercase tracking-wide">Regional Outbreak Map</h3>
                                        <button className="text-sm bg-surface-panel-active text-text-muted border border-border-grid px-3 py-1.5 rounded-md hover:bg-primary/20 hover:text-primary transition-colors flex items-center gap-1 font-bold uppercase">
                                            <span className="material-symbols-outlined text-[16px]">restart_alt</span> Reset Map
                                        </button>
                                    </div>
                                    <div id="map" className="flex-1 bg-surface-base border border-border-grid rounded-lg relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
                                        {/* Leaflet injects map here */}
                                    </div>
                                </div>
                            </div>

                            {/* Histogram Card */}
                            <div className="bg-surface-panel border border-border-grid rounded-xl p-6 flex flex-col min-h-[380px] shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold font-title-md text-data-parchment uppercase tracking-wide">Districtwise Animal Disease Histogram</h3>
                                    <select 
                                        id="districtSelect" 
                                        value={selectedDistrict}
                                        onChange={(e) => setSelectedDistrict(e.target.value)}
                                        className="border border-border-grid rounded-md px-3 py-1.5 text-sm bg-surface-base text-on-surface focus:border-primary outline-none"
                                    >
                                        <option value="">Select District...</option>
                                        {districts.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-1 relative flex items-center justify-center bg-surface-base border border-border-grid rounded-lg p-2 overflow-hidden h-64">
                                    <canvas id="histogramChart" className="w-full h-full"></canvas>
                                </div>
                            </div>

                            {/* Recent Reports Table Card */}
                            <div className="bg-surface-panel border border-border-grid rounded-xl overflow-hidden shadow-sm">
                                <div className="p-5 border-b border-border-grid bg-surface-panel-active flex justify-between items-center">
                                    <h3 className="text-lg font-bold font-title-md text-data-parchment uppercase tracking-wide">Recent Clinical Reports</h3>
                                </div>
                                <div className="overflow-x-auto w-full">
                                    <table className="w-full text-left border-collapse min-w-[800px]">
                                        <thead>
                                            <tr className="bg-surface-base text-text-muted text-sm font-label-md uppercase tracking-wider border-b border-border-grid">
                                                <th className="py-4 px-6 whitespace-nowrap">Date reported</th>
                                                <th className="py-4 px-6 whitespace-nowrap">Farmer Name</th>
                                                <th className="py-4 px-6 whitespace-nowrap">Locality</th>
                                                <th className="py-4 px-6 whitespace-nowrap">Animal Species</th>
                                                <th className="py-4 px-6 whitespace-nowrap">Primary Symptom</th>
                                                <th className="py-4 px-6 whitespace-nowrap text-center">Risk Level</th>
                                                <th className="py-4 px-6 whitespace-nowrap text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody id="reportTableBody" className="text-sm text-on-surface">
                                            {reports.map((r, idx) => (
                                                <tr key={idx} className={`border-b border-border-grid hover:bg-surface-container-high transition-colors ${idx % 2 === 0 ? 'bg-surface-panel' : 'bg-surface-panel-active'}`}>
                                                    <td className="py-4 px-6 font-telemetry-num text-text-muted">{r.date}</td>
                                                    <td className="py-4 px-6 font-bold text-data-parchment">{r.name}</td>
                                                    <td className="py-4 px-6 text-on-surface-variant">{r.locality}</td>
                                                    <td className="py-4 px-6 capitalize">{r.animal}</td>
                                                    <td className="py-4 px-6 capitalize font-medium">{r.symptom}</td>
                                                    <td className="py-4 px-6 text-center">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-bold uppercase tracking-wider w-24 justify-center ${r.risk === 'HIGH' ? 'bg-error-container text-threat-crimson' : r.risk === 'MEDIUM' ? 'bg-surface-base border border-border-grid text-telemetry-amber' : 'bg-surface-base border border-border-grid text-radar-emerald'}`}>
                                                            {r.risk}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-center">
                                                        <button 
                                                            onClick={() => setSelectedCase(r)}
                                                            className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors">
                                                            <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {reports.length === 0 && (
                                                <tr>
                                                    <td colSpan={7} className="py-8 text-center text-text-muted">No recent reports found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Case Management Modal */}
                {selectedCase && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="bg-surface-panel border border-border-grid rounded-xl w-full max-w-lg p-6 shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold font-title-md text-data-parchment uppercase">Case Management</h2>
                                <button onClick={() => { setSelectedCase(null); setQrCodeUrl(''); setSampleStatus(''); }} className="text-text-muted hover:text-on-surface">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            
                            <div className="mb-6 bg-surface-base p-4 rounded border border-border-grid">
                                <p className="text-sm"><span className="text-text-muted">Farmer:</span> <span className="font-bold">{selectedCase.name}</span></p>
                                <p className="text-sm"><span className="text-text-muted">Locality:</span> {selectedCase.locality}</p>
                                <p className="text-sm"><span className="text-text-muted">Animal:</span> {selectedCase.animal} ({selectedCase.symptom})</p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-label-md text-text-muted uppercase mb-2">Assign Field Worker</label>
                                    <div className="flex gap-2">
                                        <select 
                                            className="flex-1 bg-surface-base border border-border-grid rounded px-3 py-2 text-on-surface outline-none focus:border-primary"
                                            value={fieldWorker}
                                            onChange={(e) => setFieldWorker(e.target.value)}
                                        >
                                            <option value="">Select Worker...</option>
                                            <option value="FW-01 Rajesh">FW-01 Rajesh</option>
                                            <option value="FW-02 Suresh">FW-02 Suresh</option>
                                            <option value="FW-03 Amit">FW-03 Amit</option>
                                        </select>
                                        <button 
                                            onClick={handleAssign}
                                            className="bg-primary text-on-primary px-4 py-2 rounded font-bold uppercase hover:bg-primary/90 transition-colors">
                                            Assign
                                        </button>
                                    </div>
                                </div>

                                <div className="border-t border-border-grid pt-6">
                                    <label className="block text-sm font-label-md text-text-muted uppercase mb-2">Laboratory Diagnostics</label>
                                    <button 
                                        onClick={handleRequestSample}
                                        className="w-full bg-telemetry-saffron text-black px-4 py-2 rounded font-bold uppercase hover:bg-telemetry-saffron/90 transition-colors flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined">science</span> Request Lab Sample
                                    </button>
                                </div>

                                {sampleStatus && (
                                    <div className="mt-4 text-center">
                                        <p className="text-sm text-radar-emerald font-bold mb-2">{sampleStatus}</p>
                                        {qrCodeUrl && (
                                            <div className="flex flex-col items-center gap-2 mt-4 bg-white p-4 rounded-xl border-4 border-radar-emerald inline-block">
                                                <img src={`http://127.0.0.1:5000${qrCodeUrl}`} alt="QR Code" className="w-48 h-48" />
                                                <p className="text-xs text-black font-bold uppercase tracking-widest">Scan for Custody</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
