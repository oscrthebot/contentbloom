#!/usr/bin/env python3
"""
Test cold outreach email to rafa@happyoperators.com
V3: Using existing demo article URL
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Config
FROM_EMAIL = "matt.roberts@bloomcontent.site"
FROM_PASSWORD = "wtv4wyz_rjw0AJA6nky"
TO_EMAIL = "rafa@happyoperators.com"

# SpeakHapi context
store_name = "SpeakHapi"
niche = "language learning"
owner_name = "Rafa"

# Use existing demo article URL
preview_url = "https://bloomcontent.site/p/hapi-mac-transcription"

# Email content - SHORTER version
subject = f"Quick thing for {store_name}"

body = f"""Hi {owner_name},

I came across {store_name} — great concept for language learning.

Quick question: are you doing any content marketing? Searches like "practice speaking Spanish" get 10K+ monthly volume.

I wrote a sample article to show you what I mean:
{preview_url}

It's yours free — no pitch, no follow-up calls. Just reply "yes" if you want me to finish it and send the full version.

Best,
Matt
"""

# Build email
msg = MIMEMultipart()
msg["From"] = f"Matt Roberts <{FROM_EMAIL}>"
msg["To"] = TO_EMAIL
msg["Subject"] = subject
msg.attach(MIMEText(body, "plain"))

# Send
try:
    with smtplib.SMTP("smtp.zoho.eu", 587) as server:
        server.starttls()
        server.login(FROM_EMAIL, FROM_PASSWORD)
        server.sendmail(FROM_EMAIL, TO_EMAIL, msg.as_string())
    print(f"✅ Test email v3 sent: {FROM_EMAIL} → {TO_EMAIL}")
    print(f"Subject: {subject}")
    print(f"\n--- EMAIL BODY ---\n{body}")
except Exception as e:
    print(f"❌ Failed: {e}")
