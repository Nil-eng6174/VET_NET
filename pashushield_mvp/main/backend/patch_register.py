import re

content = open(
    r'c:\Users\Pratiksha Ingale\my_code\.vscode\python_learnings\disease_check\pashushield_mvp\main\frontend\src\app\page.tsx',
    'r', encoding='utf-8'
).read()

# Find the old register form using a distinctive anchor
OLD_ANCHOR = 'className="flex flex-col gap-6 transition-opacity duration-300">'
NEW_FORM = '''className="flex flex-col gap-5 transition-opacity duration-300" onSubmit={async (e) => {
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
                                        </div>'''

# Also add ref to the form tag
OLD_FORM_TAG = '<form className="flex flex-col gap-6 transition-opacity duration-300">'
NEW_FORM_TAG = f'<form ref={{registerFormRef}} {NEW_FORM}'

# Replace the sparse form with the full form
# First locate the old form start to end
start = content.find(OLD_FORM_TAG)
if start == -1:
    print("ERROR: Could not find old form tag")
else:
    end = content.find('</form>', start) + len('</form>')
    content = content[:start] + NEW_FORM_TAG + '\n                                    </form>' + content[end:]
    print(f"SUCCESS: Replaced form from position {start} to {end}")

open(
    r'c:\Users\Pratiksha Ingale\my_code\.vscode\python_learnings\disease_check\pashushield_mvp\main\frontend\src\app\page.tsx',
    'w', encoding='utf-8'
).write(content)
