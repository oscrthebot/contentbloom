#!/usr/bin/env python3
"""
Upload leads to Convex database
"""

import json
import os
import requests
from typing import List, Dict
from datetime import datetime

def load_env():
    """Load environment variables"""
    env_path = '/root/.openclaw/workspace/contentbloom/.env'
    env_vars = {}
    
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env_vars[key] = value
    
    return env_vars

def upload_lead_to_convex(lead: Dict, convex_url: str, deploy_key: str) -> bool:
    """Upload a single lead to Convex"""
    
    # Prepare the mutation request
    url = f"{convex_url}/api/mutation"
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Convex {deploy_key}'
    }
    
    # Map our lead data to Convex schema
    # Skip leads without email (required by schema)
    if not lead.get('email'):
        print(f"  ⚠️  Skipping {lead['domain']} - no email found")
        return False
    
    payload = {
        "path": "leads:add",
        "args": {
            "domain": lead['domain'],
            "storeName": lead['storeName'],
            "niche": lead['niche'],
            "email": lead.get('email'),
            "language": lead.get('language', 'en'),
            "score": lead['score'],
            "productCount": lead.get('product_count', 0),
            "blogPostCount": lead.get('blog_count', 0),
            "notes": [
                f"Auto-generated on {lead.get('analyzed_at', datetime.now().isoformat())}",
                f"Region: {lead.get('region', 'Unknown')}"
            ]
        }
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=15)
        
        if response.status_code == 200:
            print(f"  ✅ Uploaded: {lead['domain']}")
            return True
        else:
            print(f"  ❌ Failed: {lead['domain']} - {response.status_code} - {response.text[:100]}")
            return False
            
    except Exception as e:
        print(f"  ❌ Error uploading {lead['domain']}: {str(e)[:100]}")
        return False

def main():
    """Main upload function"""
    
    # Load environment
    env = load_env()
    convex_url = env.get('NEXT_PUBLIC_CONVEX_URL')
    deploy_key = env.get('CONVEX_DEPLOY_KEY')
    
    if not convex_url or not deploy_key:
        print("❌ Missing Convex credentials in .env")
        return
    
    print(f"🔗 Convex URL: {convex_url}")
    
    # Load leads from JSON
    json_path = '/root/.openclaw/workspace/contentbloom/data/leads-backup.json'
    
    if not os.path.exists(json_path):
        print(f"❌ Leads file not found: {json_path}")
        return
    
    with open(json_path) as f:
        data = json.load(f)
    
    leads = data.get('leads', [])
    
    print(f"\n📦 Found {len(leads)} leads to upload")
    print("="*60)
    
    # Upload each lead
    success_count = 0
    failed_count = 0
    
    for i, lead in enumerate(leads, 1):
        print(f"\n[{i}/{len(leads)}] Uploading {lead['domain']}...")
        
        if upload_lead_to_convex(lead, convex_url, deploy_key):
            success_count += 1
        else:
            failed_count += 1
    
    # Summary
    print("\n" + "="*60)
    print("📊 UPLOAD SUMMARY")
    print("="*60)
    print(f"✅ Successful: {success_count}")
    print(f"❌ Failed: {failed_count}")
    print(f"📊 Total: {len(leads)}")
    
    if success_count > 0:
        print(f"\n✨ Successfully uploaded {success_count} leads to Convex!")

if __name__ == '__main__':
    main()
