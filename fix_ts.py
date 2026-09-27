import re

with open('pashushield_mvp/main/frontend/src/app/farmer/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("onClick={loadHistory}", "onClick={() => window.location.reload()}")

with open('pashushield_mvp/main/frontend/src/app/farmer/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed loadHistory")
