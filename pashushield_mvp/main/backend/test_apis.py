import os
import requests
from dotenv import load_dotenv

load_dotenv()

def test_groq():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("[FAIL] GROQ_API_KEY is missing.")
        return False
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "mixtral-8x7b-32768",
        "messages": [{"role": "user", "content": "Hello"}],
        "max_tokens": 10
    }
    try:
        resp = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=5)
        if resp.status_code == 200:
            print(f"[OK] Groq API is working. (Model responded)")
            return True
        else:
            print(f"[FAIL] Groq API failed: {resp.status_code} {resp.text}")
            return False
    except Exception as e:
        print(f"[ERROR] Groq API exception: {e}")
        return False

def test_openai():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("[FAIL] OPENAI_API_KEY is missing.")
        return False
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "user", "content": "Hello"}],
        "max_tokens": 5
    }
    try:
        resp = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload, timeout=5)
        if resp.status_code == 200:
            print(f"[OK] OpenAI API is working.")
            return True
        else:
            print(f"[FAIL] OpenAI API failed: {resp.status_code} {resp.text}")
            return False
    except Exception as e:
        print(f"[ERROR] OpenAI API exception: {e}")
        return False

def test_textbee():
    api_key = os.getenv("TEXTBEE_API_KEY")
    device_id = os.getenv("TEXTBEE_DEVICE_ID")
    if not api_key or not device_id:
        print("[FAIL] TEXTBEE_API_KEY or DEVICE_ID missing.")
        return False
    
    # Just checking if the API key is valid or making a dummy call if there is an endpoint for balance/status
    # TextBee usually needs an actual SMS to test, but let's try a dummy request or check if it throws 401/403
    try:
        resp = requests.post(
            f"https://api.textbee.dev/api/v1/gateway/devices/{device_id}/send-sms",
            headers={"x-api-key": api_key},
            json={"receivers": ["+919999999999"], "smsBody": "Test"},
            timeout=5
        )
        if resp.status_code in [200, 201]:
            print(f"[OK] TextBee SMS API is working (Message queued).")
            return True
        else:
            print(f"[FAIL] TextBee SMS API failed: {resp.status_code} {resp.text}")
            return False
    except Exception as e:
        print(f"[ERROR] TextBee API exception: {e}")
        return False

if __name__ == "__main__":
    print("--- API Health Check ---")
    test_groq()
    test_openai()
    test_textbee()
    print("------------------------")
