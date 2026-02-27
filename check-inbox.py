#!/usr/bin/env python3
"""
BloomContent inbox monitor
Checks matt.roberts & rafa @bloomcontent.site for new replies
Sends Telegram notification when a prospect replies
"""

import imaplib
import email
from email.header import decode_header
import json
import os
import subprocess
from datetime import datetime

STATE_FILE = '/root/.openclaw/workspace/contentbloom/.inbox-state.json'
ACCOUNTS = [
    'matt.roberts@bloomcontent.site',
    'rafa@bloomcontent.site',
]
PASSWORD = 'wtv4wyz_rjw0AJA6nky'
IMAP_HOST = 'imappro.zoho.eu'
SKIP_SENDERS = ['zoho.eu', 'zohocorp.com', 'zohostore.eu', 'zohomail.com']

def load_state():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE) as f:
            return json.load(f)
    return {}

def save_state(state):
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2)

def decode_str(s):
    if s is None:
        return ''
    decoded, enc = decode_header(s)[0]
    if isinstance(decoded, bytes):
        return decoded.decode(enc or 'utf-8', errors='ignore')
    return decoded

def get_body(msg):
    body = ''
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == 'text/plain':
                try:
                    body = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                    break
                except:
                    pass
    else:
        try:
            body = msg.get_payload(decode=True).decode('utf-8', errors='ignore')
        except:
            pass
    return body.strip()[:800]

def notify_telegram(account, from_, subject, body):
    import urllib.request
    import urllib.parse

    token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID', '1796388904')
    text = (
        f"📬 *Nueva respuesta en BloomContent*\n\n"
        f"*Cuenta:* `{account}`\n"
        f"*De:* {from_}\n"
        f"*Asunto:* {subject}\n\n"
        f"```\n{body[:500]}\n```"
    )
    url = f'https://api.telegram.org/bot{token}/sendMessage'
    data = urllib.parse.urlencode({
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'Markdown'
    }).encode()
    try:
        req = urllib.request.Request(url, data=data)
        urllib.request.urlopen(req, timeout=10)
        print(f"Telegram notified: {from_}")
    except Exception as e:
        print(f"Notify error: {e}")

def check_account(account, state):
    seen = set(state.get(account, []))
    new_seen = set(seen)
    new_emails = []

    try:
        mail = imaplib.IMAP4_SSL(IMAP_HOST, 993)
        mail.login(account, PASSWORD)
        mail.select('INBOX')
        _, messages = mail.search(None, 'ALL')
        ids = messages[0].split()

        for num in ids:
            msg_id_str = num.decode()
            if msg_id_str in seen:
                continue

            _, data = mail.fetch(num, '(RFC822)')
            msg = email.message_from_bytes(data[0][1])

            from_ = msg.get('From', '')
            # Skip Zoho system emails
            if any(skip in from_ for skip in SKIP_SENDERS):
                new_seen.add(msg_id_str)
                continue

            subject = decode_str(msg.get('Subject', ''))
            body = get_body(msg)
            date_ = msg.get('Date', '')

            new_emails.append({
                'account': account,
                'from': from_,
                'subject': subject,
                'body': body,
                'date': date_,
            })
            new_seen.add(msg_id_str)

        mail.logout()
    except Exception as e:
        print(f"Error checking {account}: {e}")

    state[account] = list(new_seen)
    return new_emails

def main():
    state = load_state()
    all_new = []

    for account in ACCOUNTS:
        new = check_account(account, state)
        all_new.extend(new)

    save_state(state)

    if all_new:
        for e in all_new:
            print(f"NEW EMAIL: {e['from']} → {e['account']} | {e['subject']}")
            notify_telegram(e['account'], e['from'], e['subject'], e['body'])
    else:
        print(f"[{datetime.utcnow().strftime('%H:%M UTC')}] No new emails")

if __name__ == '__main__':
    main()
