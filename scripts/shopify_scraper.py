#!/usr/bin/env python3
"""
Shopify Store Scraper - BloomContent MVP
Finds Shopify stores, checks for blogs, extracts contact info
"""

import requests
import json
import re
import time
from typing import Dict, List, Optional
from datetime import datetime
from urllib.parse import urljoin, urlparse
import argparse

class ShopifyScraper:
    def __init__(self, output_file='shopify_leads.json'):
        self.output_file = output_file
        self.leads = []
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def is_shopify_store(self, url: str) -> bool:
        """Check if a URL is a Shopify store"""
        try:
            response = self.session.get(url, timeout=10)
            # Check for Shopify indicators
            indicators = [
                'cdn.shopify.com' in response.text,
                'Shopify.theme' in response.text,
                'shopify-section' in response.text,
                response.headers.get('X-ShopId') is not None
            ]
            return any(indicators)
        except:
            return False
    
    def find_blog(self, base_url: str) -> Optional[Dict]:
        """
        Try to find blog on Shopify store
        Common paths: /blogs/news, /blogs/journal, /blogs/blog, /pages/blog
        """
        blog_paths = [
            '/blogs/news',
            '/blogs/journal', 
            '/blogs/blog',
            '/blogs/stories',
            '/pages/blog'
        ]
        
        for path in blog_paths:
            blog_url = urljoin(base_url, path)
            try:
                response = self.session.get(blog_url, timeout=10)
                if response.status_code == 200:
                    # Found a blog, now count posts
                    post_count = self.count_blog_posts(blog_url, response.text)
                    return {
                        'url': blog_url,
                        'path': path,
                        'post_count': post_count
                    }
            except:
                continue
        
        return None
    
    def count_blog_posts(self, blog_url: str, html: str) -> int:
        """
        Count blog posts (rough estimate from pagination or article count)
        Shopify blogs often show 10-50 per page
        """
        # Look for article elements
        article_count = html.count('article class=') + html.count('class="article')
        
        # Look for pagination to estimate total
        # Example: "Page 1 of 5" or similar patterns
        pagination_match = re.search(r'of (\d+)', html)
        if pagination_match:
            pages = int(pagination_match.group(1))
            return pages * 10  # Rough estimate
        
        # If no pagination, return article count found on first page
        return article_count if article_count > 0 else 0
    
    def extract_contact_email(self, base_url: str) -> Optional[str]:
        """
        Try to find contact email from:
        - /pages/contact
        - Footer
        - About page
        """
        pages_to_check = ['', '/pages/contact', '/pages/about']
        
        for page in pages_to_check:
            url = urljoin(base_url, page)
            try:
                response = self.session.get(url, timeout=10)
                # Find email patterns
                emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', response.text)
                # Filter out common generic/image emails
                valid_emails = [e for e in emails if not any(x in e.lower() for x in ['sentry', 'example', 'privacy', 'noreply'])]
                if valid_emails:
                    return valid_emails[0]
            except:
                continue
        
        return None
    
    def scrape_store(self, url: str) -> Optional[Dict]:
        """Scrape a single Shopify store"""
        print(f"Scraping: {url}")
        
        # Ensure URL has protocol
        if not url.startswith('http'):
            url = 'https://' + url
        
        # Verify it's Shopify
        if not self.is_shopify_store(url):
            print(f"  ❌ Not a Shopify store")
            return None
        
        print(f"  ✓ Confirmed Shopify store")
        
        # Find blog
        blog_info = self.find_blog(url)
        if not blog_info:
            print(f"  ⚠️  No blog found")
            has_blog = False
            blog_url = None
            post_count = 0
        else:
            print(f"  ✓ Blog found: {blog_info['path']} ({blog_info['post_count']} posts)")
            has_blog = True
            blog_url = blog_info['url']
            post_count = blog_info['post_count']
        
        # Extract email
        email = self.extract_contact_email(url)
        if email:
            print(f"  ✓ Email found: {email}")
        else:
            print(f"  ⚠️  No email found")
        
        lead = {
            'url': url,
            'has_blog': has_blog,
            'blog_url': blog_url,
            'post_count': post_count,
            'email': email,
            'scraped_at': datetime.now().isoformat(),
            'status': 'new',
            'priority': 'high' if (has_blog and post_count < 10) else 'medium' if has_blog else 'low'
        }
        
        return lead
    
    def scrape_from_list(self, urls: List[str]):
        """Scrape multiple stores from a list"""
        for url in urls:
            try:
                lead = self.scrape_store(url)
                if lead:
                    self.leads.append(lead)
                time.sleep(2)  # Be respectful, don't hammer
            except Exception as e:
                print(f"Error scraping {url}: {e}")
        
        self.save_leads()
    
    def scrape_from_builtwith(self, country: str = 'US', limit: int = 100):
        """
        Placeholder for BuiltWith API integration
        You'll need a BuiltWith API key for this
        """
        print("⚠️  BuiltWith API integration requires API key")
        print("Manual alternative: Download CSV from https://builtwith.com/shopify")
        pass
    
    def scrape_from_google_dork(self, country: str = 'US', limit: int = 50):
        """
        Placeholder for Google search scraping
        Note: Direct Google scraping may violate ToS, use official Search API or manual export
        """
        print("⚠️  Google scraping requires Search API or manual export")
        print(f'Search manually: "powered by Shopify" site:{country.lower()}')
        pass
    
    def save_leads(self):
        """Save leads to JSON file"""
        with open(self.output_file, 'w') as f:
            json.dump(self.leads, f, indent=2)
        print(f"\n✓ Saved {len(self.leads)} leads to {self.output_file}")
    
    def load_leads(self):
        """Load existing leads"""
        try:
            with open(self.output_file, 'r') as f:
                self.leads = json.load(f)
            print(f"Loaded {len(self.leads)} existing leads")
        except FileNotFoundError:
            print("No existing leads file found")


def main():
    parser = argparse.ArgumentParser(description='Scrape Shopify stores for BloomContent')
    parser.add_argument('--file', help='File with list of URLs to scrape')
    parser.add_argument('--url', help='Single URL to scrape')
    parser.add_argument('--output', default='shopify_leads.json', help='Output JSON file')
    
    args = parser.parse_args()
    
    scraper = ShopifyScraper(output_file=args.output)
    
    if args.url:
        lead = scraper.scrape_store(args.url)
        if lead:
            scraper.leads.append(lead)
            scraper.save_leads()
    
    elif args.file:
        with open(args.file, 'r') as f:
            urls = [line.strip() for line in f if line.strip()]
        scraper.scrape_from_list(urls)
    
    else:
        print("Usage:")
        print("  Single store: python shopify_scraper.py --url https://example.myshopify.com")
        print("  From file:    python shopify_scraper.py --file urls.txt")
        print("\nExample URLs file format (one per line):")
        print("  https://store1.com")
        print("  https://store2.myshopify.com")


if __name__ == '__main__':
    main()
