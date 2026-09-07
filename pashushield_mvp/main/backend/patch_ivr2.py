import re

content = open(
    r'c:\Users\Pratiksha Ingale\my_code\.vscode\python_learnings\disease_check\pashushield_mvp\main\backend\app.py',
    'r', encoding='utf-8'
).read()

# Replace request.url_root with NGROK_URL env variable so it works behind Ngrok proxy
replacement = 'base = os.getenv("NGROK_URL", "").rstrip("/")'
content = re.sub(
    r'base = request\.url_root\.rstrip\([^\)]+\)',
    replacement,
    content
)

open(
    r'c:\Users\Pratiksha Ingale\my_code\.vscode\python_learnings\disease_check\pashushield_mvp\main\backend\app.py',
    'w', encoding='utf-8'
).write(content)

count = content.count('base = os.getenv("NGROK_URL"')
print(f"DONE - replaced {count} url_root references with NGROK_URL env variable")
