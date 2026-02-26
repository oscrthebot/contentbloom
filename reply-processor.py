#!/usr/bin/env python3
"""BloomContent Reply Processor - Auto-reply for cold outreach"""
import imaplib, email, json, os, re, urllib.request, smtplib
from email.header import decode_header
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import Optional, Dict, Any, Tuple

STATE_FILE = '/root/.openclaw/workspace/contentbloom/.inbox-state.json'
REPLY_STATE_FILE = '/root/.openclaw/workspace/contentbloom/.reply-state.json'
DRY_RUN = os.getenv('DRY_RUN', 'false').lower() == 'true'

ACCOUNTS = ['matt.roberts@bloomcontent.site', 'rafa@bloomcontent.site']
PASSWORD = 'wtv4wyz_rjw0AJA6nky'
IMAP_HOST, SMTP_HOST, SMTP_PORT = 'imappro.zoho.eu', 'smtp.zoho.eu', 587
SKIP_SENDERS = ['zoho.eu', 'zohocorp.com']
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')
HUMAN_REVIEW_EMAIL = 'rafa@happyoperators.com'

class ReplyProcessor:
    def __init__(self):
        self.state = self.load_json(STATE_FILE)
        self.reply_state = self.load_json(REPLY_STATE_FILE, {'processed': {}, 'pending': []})

    def load_json(self, path: str, default=None) -> Dict:
        if os.path.exists(path):
            with open(path) as f:
                return json.load(f)
        return default or {}

    def save_reply_state(self):
        with open(REPLY_STATE_FILE, 'w') as f:
            json.dump(self.reply_state, f, indent=2)

    def get_body(self, msg) -> str:
        body = ''
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() == 'text/plain':
                    try:
                        payload = part.get_payload(decode=True)
                        if payload:
                            body = payload.decode('utf-8', errors='ignore')
                            break
                    except:
                        pass
        else:
            try:
                payload = msg.get_payload(decode=True)
                if payload:
                    body = payload.decode('utf-8', errors='ignore')
            except:
                pass
        return body.strip()

    def extract_email(self, from_header: str) -> str:
        m = re.search(r'<([^>]+)>', from_header)
        return m.group(1).lower() if m else from_header.lower().strip()

    def classify_reply(self, body: str, subject: str) -> Tuple[str, float, str]:
        prompt = f"""Analyze this email reply about AI-generated blog content.
Subject: {subject[:100]}
Body: {body[:1500]}

Classify ONE: interested|not_interested|question|meeting_request|pricing|unclear
Reason briefly.

Respond ONLY with JSON: {{"cls":"...","conf":0.0,"reason":"..."}}"""

        try:
            data = json.dumps({
                "model": "claude-3-haiku-20240307",
                "max_tokens": 200,
                "temperature": 0.1,
                "messages": [{"role": "user", "content": prompt}]
            }).encode()

            req = urllib.request.Request(
                'https://api.anthropic.com/v1/messages',
                data=data,
                headers={'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01'}
            )

            with urllib.request.urlopen(req, timeout=30) as resp:
                result = json.loads(resp.read().decode())
                content = result['content'][0]['text']
            
            m = re.search(r'\{[^}]+\}', content)
            if m:
                d = json.loads(m.group())
                return (d.get('cls', 'unclear'), d.get('conf', 0.5), d.get('reason', ''))
        except Exception as e:
            print(f"Classification error: {e}")
        return ('unclear', 0.0, str(e))

    def gen_response(self, cls: str, store: str) -> str:
        responses = {
            'interested': f"""Hi!

Thanks for your interest. I'd love to create sample articles for {store}.

What products should I focus on? I'll have them ready in 48 hours.

Best,
Rafael | BloomContent""",

            'question': f"""Hi!

Happy to clarify. Our AI writes SEO blog articles for your products.

Free trial: 2 articles, no commitment.
Paid plans: From €49/mo for daily articles.

Questions welcome!

Best,
Rafael | BloomContent""",

            'pricing': f"""Hi!

Our pricing:
• Starter: €49/mo - 30 articles
• Growth: €99/mo - 90 articles
• Scale: €149/mo - 150 articles

**50% OFF first month!**

✓ SEO optimized
✓ Unlimited revisions
✓ Cancel anytime

Best,
Rafael | BloomContent""",

            'meeting_request': f"""Hi!

Happy to chat. Suggest a time that works?

Best,
Rafael | BloomContent""",
        }
        return responses.get(cls, '')

    def send_email(self, to: str, subject: str, body: str, in_reply_to: str = None):
        if DRY_RUN:
            print(f"[DRY RUN] To: {to}, Subject: {subject}")
            return True
        try:
            msg = MIMEMultipart()
            msg['From'], msg['To'], msg['Subject'] = 'rafa@bloomcontent.site', to, subject
            if in_reply_to:
                msg['In-Reply-To'] = msg['References'] = in_reply_to
            msg.attach(MIMEText(body, 'plain'))
            
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as s:
                s.starttls()
                s.login('rafa@bloomcontent.site', PASSWORD)
                s.send_message(msg)
            print(f"Sent: {subject} -> {to}")
            return True
        except Exception as e:
            print(f"Send failed: {e}")
            return False

    def alert_human(self, lead: Dict, body: str, cls: str, conf: float, reason: str):
        if DRY_RUN:
            print(f"[DRY RUN] Alert human for unclear reply from {lead.get('email')}")
            return
        
        text = f"""Human Review Needed - BloomContent Reply

Lead: {lead.get('storeName', 'Unknown')}
Email: {lead.get('email', 'Unknown')}
AI Classification: {cls} (conf: {conf})
Reasoning: {reason}

---
Original Reply:
{body[:1000]}
---

Review at: https://bloomcontent.site/admin/replies"""

        self.send_email(HUMAN_REVIEW_EMAIL, f"Review needed: {lead.get('email', 'unknown')}", text)
        self.reply_state['pending'].append({
            'email': lead.get('email'),
            'store': lead.get('storeName'),
            'classification': cls,
            'confidence': conf,
            'body': body[:500],
            'timestamp': datetime.utcnow().isoformat()
        })

    def process_reply(self, msg_id: str, from_: str, subject: str, body: str):
        email_addr = self.extract_email(from_)
        
        # Skip if already processed
        if msg_id in self.reply_state['processed']:
            return
        
        print(f"Processing reply from {email_addr}")
        
        # Find lead
        lead = self.find_lead(email_addr)
        if not lead:
            print(f"  No lead found for {email_addr}")
            lead = {'email': email_addr, 'storeName': 'Unknown', 'status': 'contacted'}
        
        # Classify
        cls, conf, reason = self.classify_reply(body, subject)
        print(f"  Classification: {cls} (conf: {conf:.2f})")
        
        # Store processed
        self.reply_state['processed'][msg_id] = {
            'email': email_addr,
            'classification': cls,
            'confidence': conf,
            'processed_at': datetime.utcnow().isoformat()
        }
        
        # Handle based on classification
        if cls == 'unclear' or conf < 0.6:
            self.alert_human(lead, body, cls, conf, reason)
        elif cls == 'not_interested':
            print(f"  Not interested - no response sent")
            # Update lead status in Convex
        elif cls in ('interested', 'question', 'pricing', 'meeting_request'):
            response = self.gen_response(cls, lead.get('storeName', 'your store'))
            if response:
                self.send_email(email_addr, f"Re: {subject}", response, msg_id)

    def find_lead(self, email: str) -> Optional[Dict]:
        # Simplified - would query Convex
        return None

    def check_inbox(self, account: str):
        print(f"Checking {account}...")
        try:
            mail = imaplib.IMAP4_SSL(IMAP_HOST, 993)
            mail.login(account, PASSWORD)
            mail.select('INBOX')
            
            _, msgs = mail.search(None', 'UNSEEN')
            ids = msgs[0].split()
            print(f"  Found {len(ids)} unread messages")
            
            for num in ids:
                msg_id_str = num.decode()
                if msg_id_str in self.reply_state['processed']:
                    continue
                
                _, data = mail.fetch(num, '(RFC822)')
                msg = email.message_from_bytes(data[0][1])
                
                from_ = msg.get('From', '')
                if any(skip in from_.lower() for skip in SKIP_SENDERS):
                    continue
                
                subject = msg.get('Subject', '')
                body = self.get_body(msg)
                
                self.process_reply(msg_id_str, from_, subject, body)
            
            mail.close()
            mail.logout()
        except Exception as e:
            print(f"Error checking {account}: {e}")

    def run(self):
        print(f"[{datetime.utcnow().isoformat()}] Reply Processor Starting (DRY_RUN={DRY_RUN})")
        for account in ACCOUNTS:
            self.check_inbox(account)
        self.save_reply_state()
        print("Done\n")

if __name__ == '__main__':
    processor = ReplyProcessor()
    processor.run()
