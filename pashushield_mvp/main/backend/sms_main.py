import os
from twilio.rest import Client

# 1. Twilio credentials
account_sid = os.getenv('TWILIO_ACCOUNT_SID', '')
auth_token = os.getenv('TWILIO_AUTH_TOKEN', '')
client = Client(account_sid, auth_token)

# 2. Your current Ngrok URL — update this if Ngrok restarts and gives a new URL
NGROK_URL = 'https://undertook-dipper-caucasian.ngrok-free.dev'

# 3. Trigger the call
call = client.calls.create(
    to='+919834457464',
    from_='+17372508034',
    url=NGROK_URL + '/ivr/incoming'
)

print("Call initiated! Your phone should ring in a few seconds...")
print("Call SID:", call.sid)
