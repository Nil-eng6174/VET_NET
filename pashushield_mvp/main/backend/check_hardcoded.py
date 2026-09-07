import sys
sys.stdout.reconfigure(encoding='utf-8')
content = open(
    r'c:\Users\Pratiksha Ingale\my_code\.vscode\python_learnings\disease_check\pashushield_mvp\main\frontend\src\app\farmer\page.tsx',
    'r', encoding='utf-8'
).read()

checks = ['Rameshwar', '98224', 'PUNE HQ', 'Baburdi', 'Parner Tehsil']
for kw in checks:
    idx = content.find(kw)
    status = "STILL FOUND at index " + str(idx) if idx >= 0 else "CLEAN"
    print(kw + ": " + status)
