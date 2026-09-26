import re

with open('pashushield_mvp/main/backend/app.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Add to very top
target = "from twilio.twiml.voice_response import VoiceResponse, Gather\n"
replacement = "from twilio.twiml.voice_response import VoiceResponse, Gather\nfrom chatbot import get_chat_response\n"
content = content.replace(target, replacement)

# Remove from inside chat()
target_chat = """    try:
        from chatbot import get_chat_response
        response = get_chat_response(query, language=language)"""
replacement_chat = """    try:
        response = get_chat_response(query, language=language)"""
content = content.replace(target_chat, replacement_chat)

with open('pashushield_mvp/main/backend/app.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Moved chatbot import to very top of app.py safely")
