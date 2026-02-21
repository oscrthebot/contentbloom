#!/usr/bin/env python3
"""
Complete Lead Finder for ContentBloom
Finds Shopify stores using multiple methods and analyzes them
"""

import json
import re
import time
import requests
from typing import Dict, List, Optional
from datetime import datetime
from bs4 import BeautifulSoup
import os

# Known Shopify store aggregators and directories
SHOPIFY_DIRECTORIES = [
    'https://www.shopify.com/blog/best-shopify-stores',
    'https://ecommerce-platforms.com/articles/best-shopify-stores',
]

# Manual seed list of known Shopify stores across niches
SEED_STORES = {
    "organic skincare beauty": [
        "www.youthtothepeople.com",
        "www.drunkelelephant.com",
        "www.herbivore.com",
        "www.glowrecipe.com",
        "www.tatcha.com",
        "www.biossance.com",
        "www.renskincare.com",
        "www.innbeauty.com",
        "www.farmacybeauty.com",
        "www.peachandlily.com",
    ],
    "pet supplies": [
        "www.thefarmersdog.com",
        "www.chewy.com",
        "www.barkshop.com",
        "www.wildone.com",
        "www.finnthepup.com",
        "www.openfarmpet.com",
        "www.prettylitter.com",
        "www.smackpet.com",
        "www.pawstruck.com",
        "www.zipporahliving.com",
    ],
    "home decor": [
        "www.burrow.com",
        "www.article.com",
        "www.allmodern.com",
        "www.society6.com",
        "www.havenly.com",
        "www.brooklinen.com",
        "www.parachutehome.com",
        "www.citizenry.com",
        "www.westelm.com",
        "www.crateandbarrel.com",
    ],
    "fitness gym equipment": [
        "www.roguefitness.com",
        "www.repfitness.com",
        "www.titan.fitness",
        "www.bellsofsteel.com",
        "www.fringe.sport",
        "www.vulcanstrength.com",
        "www.americanbarbell.com",
        "www.againfaster.com",
        "www.prxperformance.com",
        "www.getmirror.com",
    ],
    "sustainable fashion": [
        "www.reformation.com",
        "www.everlane.com",
        "www.patagonia.com",
        "www.outerknown.com",
        "www.tentree.com",
        "www.pactapparel.com",
        "www.nisolo.com",
        "www.wearwell.com",
        "www.elizabethsuzann.com",
        "www.tradlands.com",
    ],
    "coffee tea": [
        "www.bluebottlecoffee.com",
        "www.stumptown.com",
        "www.intelligentsia.com",
        "www.artofteasus.com",
        "www.rishi-tea.com",
        "www.counter.culture",
        "www.driftaway.coffee",
        "www.tradecoffeeco.com",
        "www.angelic.coffee",
        "www.birdrockcoffee.com",
    ],
    "jewelry accessories": [
        "www.mejuri.com",
        "www.auratenewyork.com",
        "www.catbirdnyc.com",
        "www.gorjana.com",
        "www.jenniferfisher.com",
        "www.brookandyork.com",
        "www.laladesigns.com",
        "www.kinstoneco.com",
        "www.oliveyew.com",
        "www.parkavenuejewelers.com",
    ],
    "baby products": [
        "www.happiestbaby.com",
        "www.babylist.com",
        "www.solly.baby",
        "www.kyte.baby",
        "www.spearmintlove.com",
        "www.pehr.com",
        "www.birdieshoots.com",
        "www.burtsbees.baby",
        "www.newbiejams.com",
        "www.pattercakerie.com",
    ],
    "kitchen gadgets": [
        "www.madeincookware.com",
        "www.caraway.com",
        "www.greenpan.us",
        "www.hexclad.com",
        "www.fellowproducts.com",
        "www.greatjonesgoods.com",
        "www.ouroborosdesigns.com",
        "www.messermeister.com",
        "www.fusioncookware.com",
        "www.xtremausa.com",
    ],
    "outdoor camping gear": [
        "www.rei.com",
        "www.backcountry.com",
        "www.moosejaw.com",
        "www.campsaver.com",
        "www.steepandcheap.com",
        "www.sierra.com",
        "www.hyperlite.com",
        "www.enlightenedequipment.com",
        "www.zpacksgear.com",
        "www.gossamer-gear.com",
    ],
}

class ShopifyLeadAnalyzer:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        self.analyzed_domains = set()
        self.leads = []
        
    def is_shopify_store(self, url: str) -> bool:
        """Check if a URL is a Shopify store"""
        try:
            response = self.session.get(url, timeout=15, allow_redirects=True)
            content = response.text.lower()
            
            # Check for Shopify indicators
            indicators = [
                'cdn.shopify.com',
                'shopifycdn.com',
                'myshopify.com',
                '"shopify"'
            ]
            
            return any(indicator in content for indicator in indicators)
        except Exception as e:
            print(f"  ⚠️  Error checking {url}: {str(e)[:50]}")
            return False
    
    def get_blog_count(self, domain: str) -> int:
        """Count blog posts via Shopify JSON endpoints"""
        try:
            # Try multiple blog paths
            blog_paths = [
                '/blogs/news.json',
                '/blogs/blog.json', 
                '/blogs.json',
                '/blogs/stories.json',
                '/blogs/updates.json'
            ]
            
            for path in blog_paths:
                try:
                    url = f"https://{domain}{path}"
                    response = self.session.get(url, timeout=10)
                    
                    if response.status_code == 200:
                        try:
                            data = response.json()
                            if 'articles' in data:
                                count = len(data['articles'])
                                print(f"    📝 Found {count} blog posts via {path}")
                                return count
                        except json.JSONDecodeError:
                            continue
                except:
                    continue
            
            return 0
        except Exception as e:
            return 0
    
    def get_product_count(self, domain: str) -> int:
        """Count products via /products.json"""
        try:
            url = f"https://{domain}/products.json?limit=250"
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                count = len(data.get('products', []))
                print(f"    🛍️  Found {count} products")
                return count
            
            return 0
        except Exception as e:
            return 0
    
    def find_contact_email(self, domain: str) -> Optional[str]:
        """Find contact email"""
        try:
            urls_to_check = [
                f"https://{domain}/pages/contact",
                f"https://{domain}/pages/contact-us",
                f"https://{domain}/contact",
                f"https://{domain}/pages/about",
                f"https://{domain}"
            ]
            
            email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
            
            for url in urls_to_check:
                try:
                    response = self.session.get(url, timeout=10)
                    if response.status_code == 200:
                        # Use BeautifulSoup to parse
                        soup = BeautifulSoup(response.text, 'html.parser')
                        text = soup.get_text()
                        
                        emails = re.findall(email_pattern, text)
                        
                        # Filter out common false positives
                        blacklist = ['example.com', 'sampleemail', 'youremail', 'wixpress', 
                                   'test@', 'noreply@', 'no-reply@', '@shopify.com']
                        
                        valid_emails = [e for e in emails if not any(x in e.lower() for x in blacklist)]
                        
                        if valid_emails:
                            email = valid_emails[0]
                            print(f"    ✉️  Found email: {email}")
                            return email
                except:
                    continue
            
            return None
        except Exception as e:
            return None
    
    def detect_language_region(self, domain: str) -> tuple:
        """Detect region and language"""
        try:
            response = self.session.get(f"https://{domain}", timeout=10)
            content = response.text.lower()
            
            # TLD detection
            if domain.endswith(('.eu', '.de', '.fr', '.uk', '.nl', '.es', '.it')):
                return 'EU', 'en'
            
            # Content indicators
            eu_indicators = ['€', 'eur', 'vat', 'gdpr', 'eu delivery', 'european', 'brexit']
            usa_indicators = ['usd', '$', 'usa', 'united states', 'us shipping', 'made in usa']
            
            eu_score = sum(1 for ind in eu_indicators if ind in content)
            usa_score = sum(1 for ind in usa_indicators if ind in content)
            
            if eu_score > usa_score:
                return 'EU', 'en'
            elif usa_score > eu_score:
                return 'USA', 'en'
            else:
                # Default to USA if unclear
                return 'USA', 'en'
                
        except Exception as e:
            return 'Unknown', 'en'
    
    def score_lead(self, data: Dict) -> int:
        """Score lead quality (0-100)"""
        score = 0
        
        # Blog posts (fewer is better - they need content!)
        blog_count = data.get('blog_count', 0)
        if blog_count == 0:
            score += 40  # Perfect - no blog at all!
        elif blog_count <= 2:
            score += 35  # Excellent - almost no content
        elif blog_count <= 5:
            score += 25  # Good - needs more content
        elif blog_count <= 10:
            score += 10  # Some content, still a lead
        else:
            score += 0   # Has active blog, low priority
        
        # Product count (more is better - shows active business)
        product_count = data.get('product_count', 0)
        if product_count >= 50:
            score += 25  # Large catalog
        elif product_count >= 25:
            score += 20  # Medium catalog
        elif product_count >= 10:
            score += 15  # Small but viable
        elif product_count >= 5:
            score += 5   # Very small
        else:
            score += 0   # Too small or error
        
        # Has contact email (essential for outreach)
        if data.get('email'):
            score += 25  # Can reach them!
        else:
            score += 0   # No way to contact
        
        # Region preference (EU/USA better for quality stores)
        region = data.get('region', 'Unknown')
        if region in ['EU', 'USA']:
            score += 10
        
        return min(score, 100)
    
    def analyze_store(self, domain: str, niche: str) -> Optional[Dict]:
        """Analyze a single Shopify store"""
        
        # Clean domain
        domain = domain.replace('http://', '').replace('https://', '')
        domain = domain.replace('www.', '').split('/')[0].strip()
        
        if not domain:
            return None
        
        # Skip if already analyzed
        if domain in self.analyzed_domains:
            return None
        
        self.analyzed_domains.add(domain)
        
        print(f"\n{'─'*60}")
        print(f"🔍 Analyzing: {domain}")
        print(f"   Niche: {niche}")
        
        # Verify it's a Shopify store
        print(f"   Checking if Shopify...")
        if not self.is_shopify_store(f"https://{domain}"):
            print(f"   ❌ Not a Shopify store")
            return None
        
        print(f"   ✅ Confirmed Shopify store")
        
        # Gather data
        blog_count = self.get_blog_count(domain)
        product_count = self.get_product_count(domain)
        email = self.find_contact_email(domain)
        region, language = self.detect_language_region(domain)
        
        # Get store name
        try:
            response = self.session.get(f"https://{domain}", timeout=10)
            soup = BeautifulSoup(response.text, 'html.parser')
            title = soup.find('title')
            store_name = title.text.strip() if title else domain.split('.')[0].replace('-', ' ').title()
        except:
            store_name = domain.split('.')[0].replace('-', ' ').title()
        
        data = {
            'domain': domain,
            'storeName': store_name,
            'niche': niche,
            'email': email,
            'blog_count': blog_count,
            'product_count': product_count,
            'region': region,
            'language': language,
            'analyzed_at': datetime.utcnow().isoformat()
        }
        
        # Score the lead
        data['score'] = self.score_lead(data)
        
        print(f"\n   📊 SCORE: {data['score']}/100")
        print(f"   Region: {region}")
        
        # Only return if it's a qualified lead (score >= 40)
        if data['score'] >= 40:
            print(f"   ✅ QUALIFIED LEAD!")
            return data
        else:
            print(f"   ⚠️  Score too low, skipping")
            return None


def main():
    """Main execution"""
    analyzer = ShopifyLeadAnalyzer()
    qualified_leads = []
    
    print("="*60)
    print("🚀 ContentBloom Lead Generator")
    print("="*60)
    print(f"Target: 100 qualified Shopify store leads")
    print(f"Quality threshold: Score >= 40/100")
    print()
    
    # Process each niche
    for niche, stores in SEED_STORES.items():
        print(f"\n{'='*60}")
        print(f"📂 NICHE: {niche.upper()}")
        print(f"{'='*60}")
        print(f"Checking {len(stores)} stores...")
        
        for domain in stores:
            try:
                lead = analyzer.analyze_store(domain, niche)
                
                if lead:
                    qualified_leads.append(lead)
                    print(f"\n   🎯 Total qualified leads so far: {len(qualified_leads)}/100")
                
                # Rate limiting
                time.sleep(2)
                
                # Stop if we have enough
                if len(qualified_leads) >= 100:
                    print(f"\n✅ Reached target of 100 qualified leads!")
                    break
                    
            except KeyboardInterrupt:
                print("\n\n⚠️  Interrupted by user")
                break
            except Exception as e:
                print(f"   ❌ Error: {str(e)[:100]}")
                continue
        
        if len(qualified_leads) >= 100:
            break
    
    # Sort by score (highest first)
    qualified_leads.sort(key=lambda x: x['score'], reverse=True)
    
    # Save to JSON
    os.makedirs('/root/.openclaw/workspace/contentbloom/data', exist_ok=True)
    json_path = '/root/.openclaw/workspace/contentbloom/data/leads-backup.json'
    
    with open(json_path, 'w') as f:
        json.dump({
            'generated_at': datetime.utcnow().isoformat(),
            'total_leads': len(qualified_leads),
            'leads': qualified_leads
        }, f, indent=2)
    
    print(f"\n💾 Saved to {json_path}")
    
    # Print summary
    print("\n" + "="*60)
    print("📊 FINAL SUMMARY")
    print("="*60)
    print(f"Total qualified leads: {len(qualified_leads)}")
    if qualified_leads:
        print(f"Average score: {sum(l['score'] for l in qualified_leads) / len(qualified_leads):.1f}/100")
        print(f"Leads with email: {sum(1 for l in qualified_leads if l.get('email'))}")
        print(f"Leads with 0 blog posts: {sum(1 for l in qualified_leads if l.get('blog_count') == 0)}")
        print(f"Leads with 0-5 blog posts: {sum(1 for l in qualified_leads if l.get('blog_count', 0) <= 5)}")
        
        # Top 10 leads
        print(f"\n🏆 TOP 10 LEADS:")
        for i, lead in enumerate(qualified_leads[:10], 1):
            print(f"{i}. {lead['domain']} - Score: {lead['score']} - {lead['niche']}")
    
    return qualified_leads


if __name__ == '__main__':
    leads = main()
