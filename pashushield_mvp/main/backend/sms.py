import os
import re
import logging
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Put your Twilio details here or in environment variables
ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_PHONE = os.getenv("TWILIO_PHONE_NUMBER", "").replace(" ", "")


def format_phone_number(phone):
    """Clean and format phone number to E.164 standard"""
    if not phone:
        return ""
    # Remove non-digit characters except '+'
    cleaned = re.sub(r"[^\d+]", "", str(phone))
    if not cleaned.startswith("+"):
        # If 10-digit Indian number, add +91
        if len(cleaned) == 10:
            cleaned = "+91" + cleaned
        else:
            cleaned = "+" + cleaned
    return cleaned


def send_sms(phone, risk_score, risk_level, recommendation):
    """
    Sends a WhatsApp alert using Twilio Sandbox to bypass Indian DLT regulations.
    Returns (success: bool, info: str)
    """
    formatted_phone = format_phone_number(phone)
    if not formatted_phone:
        logger.warning("No valid phone number provided for WhatsApp.")
        return False, "Invalid phone number"

    try:
        client = Client(
            ACCOUNT_SID,
            AUTH_TOKEN
        )

        message = client.messages.create(
            body=(
                f"🐄 *KrishiCare Animal Health Alert*\n\n"
                f"⚠️ *Risk Score:* {risk_score}%\n"
                f"🚨 *Risk Level:* {risk_level}\n\n"
                f"📋 *Advice:*\n{recommendation}\n\n"
                f"🩺 _Please consult a veterinarian for a proper diagnosis._"
            ),
            from_=f"whatsapp:{TWILIO_PHONE}",
            to=f"whatsapp:{formatted_phone}"
        )
        return True, message.sid
    except Exception as e:
        logger.error(f"Failed to send WhatsApp message to {formatted_phone}: {e}")
        return False, "Failed to send message."