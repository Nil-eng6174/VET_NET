import os
import sys
from dotenv import load_dotenv

load_dotenv()
try:
    from chatbot import get_chat_response
    print("Response:", get_chat_response("What are the symptoms of foot and mouth disease?", language="en"))
except Exception as e:
    import traceback
    traceback.print_exc()
