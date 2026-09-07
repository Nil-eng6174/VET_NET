"""
textbee.py - TextBee SMS integration for PashuShield MVP
Uses the TextBee REST API (https://textbee.dev) to send SMS
through a registered Android device on the farmer's own SIM.
No per-message fees — uses the farmer's own network.
"""
import os
import re
import logging
import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

TEXTBEE_API_KEY = os.getenv("TEXTBEE_API_KEY", "txb_4Z8QycbtcJ2cG4Cr4vEC7YrWE6MU4Ut9")
TEXTBEE_DEVICE_ID = os.getenv("TEXTBEE_DEVICE_ID", "")  # Set after registering device in TextBee dashboard
TEXTBEE_API_URL = "https://api.textbee.dev/api/v1/gateway/devices/{device_id}/sendSMS"


def format_phone_number(phone: str) -> str:
    """Normalise a phone number to E.164 format (+91XXXXXXXXXX for India)."""
    if not phone:
        return ""
    cleaned = re.sub(r"[^\d+]", "", str(phone))
    if not cleaned.startswith("+"):
        cleaned = "+91" + cleaned if len(cleaned) == 10 else "+" + cleaned
    return cleaned


def send_textbee_sms(phone: str, risk_score, risk_level: str, recommendation: str) -> tuple[bool, str]:
    """
    Send a recommendation SMS to the farmer using the TextBee API.

    Args:
        phone:          Farmer's registered mobile number (raw, will be normalised).
        risk_score:     AI-generated risk score (0-100).
        risk_level:     'HIGH', 'MEDIUM', or 'LOW'.
        recommendation: Full recommendation text from AI rules / chatbot.

    Returns:
        (success: bool, info: str)  — info contains message ID on success or error on failure.
    """
    recipient = format_phone_number(phone)
    if not recipient:
        logger.warning("TextBee: No valid phone number provided.")
        return False, "Invalid phone number"

    if not TEXTBEE_DEVICE_ID:
        logger.warning("TextBee: TEXTBEE_DEVICE_ID is not set in .env. Skipping SMS.")
        return False, "TextBee device not configured. Add TEXTBEE_DEVICE_ID to .env"

    # Build message body — kept short for SMS (160 chars per segment)
    risk_emoji = {"HIGH": "🔴", "MEDIUM": "🟡", "LOW": "🟢"}.get(risk_level, "⚪")
    message_body = (
        f"PashuShield Alert {risk_emoji}\n"
        f"Risk: {risk_level} ({risk_score}%)\n\n"
        f"{recommendation}\n\n"
        f"Help: 1800-XXX-XXXX (Toll Free)"
    )

    url = TEXTBEE_API_URL.format(device_id=TEXTBEE_DEVICE_ID)
    headers = {
        "x-api-key": TEXTBEE_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "recipients": [recipient],
        "message": message_body
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        msg_id = data.get("data", {}).get("messageId", "sent")
        logger.info(f"TextBee SMS sent to {recipient} | ID: {msg_id}")
        return True, msg_id
    except requests.exceptions.HTTPError as e:
        err = f"TextBee HTTP error {response.status_code}: {response.text}"
        logger.error(err)
        return False, err
    except Exception as e:
        logger.error(f"TextBee error: {e}")
        return False, str(e)
