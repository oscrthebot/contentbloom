/**
 * ContentBloom - Shopify Store Finder
 * 
 * Finds Shopify stores that need content help:
 * - No blog or very few posts
 * - Active store (recent products)
 * - EU/USA based
 * 
 * Data sources:
 * - BuiltWith API (Shopify detection)
 * - Google Search (site:myshopify.com + niche keywords)
 * - Store inspection (check /blogs, /collections)
 */

import * as fs from 'fs';
import * as path from 'path';

interface ShopifyLead {
  domain: string;
  storeName: string;
  hasBlogs: boolean;
  blogPostCount: number;
  productCount: number;
  niche: string;
  country: string;
  contactEmail: string | null;
  contactForm: string | null;
  lastChecked: string;
  score: number; // 0-100, higher = better lead
  status: 'new' | 'contacted' | 'demo_sent' | 'replied' | 'converted' | 'rejected';
}

interface ScraperConfig {
  niches: string[];
  countries: string[];
  maxBlogPosts: number; // Stores with more posts are not good leads
  minProducts: number;  // Stores with fewer products are too small
}

const DEFAULT_CONFIG: ScraperConfig = {
  niches: [
    'sustainable fashion',
    'pet supplies',
    'home decor',
    'fitness equipment',
    'organic skincare',
    'coffee beans',
    'handmade jewelry',
    'outdoor gear',
    'baby products',
    'kitchen gadgets'
  ],
  countries: ['ES', 'DE', 'FR', 'IT', 'UK', 'US', 'NL', 'BE', 'AT', 'PT'],
  maxBlogPosts: 5,  // Stores with 0-5 posts need content help
  minProducts: 10   // Active stores have at least 10 products
};

/**
 * Check if a domain is a Shopify store
 */
async function isShopifyStore(domain: string): Promise<boolean> {
  try {
    const response = await fetch(`https://${domain}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ContentBloom/1.0)' }
    });
    const html = await response.text();
    
    // Shopify indicators
    const indicators = [
      'cdn.shopify.com',
      'Shopify.theme',
      'shopify-section',
      '/checkouts/internal'
    ];
    
    return indicators.some(ind => html.includes(ind));
  } catch {
    return false;
  }
}

/**
 * Analyze a Shopify store for content gaps
 */
async function analyzeStore(domain: string): Promise<Partial<ShopifyLead> | null> {
  try {
    // Check blog
    let blogPostCount = 0;
    let hasBlogs = false;
    
    try {
      const blogResponse = await fetch(`https://${domain}/blogs/news.json`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ContentBloom/1.0)' }
      });
      if (blogResponse.ok) {
        const blogData = await blogResponse.json();
        hasBlogs = true;
        blogPostCount = blogData.articles?.length || 0;
      }
    } catch {
      // No blog or different blog path
    }
    
    // Check products count
    let productCount = 0;
    try {
      const productsResponse = await fetch(`https://${domain}/products.json?limit=250`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ContentBloom/1.0)' }
      });
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        productCount = productsData.products?.length || 0;
      }
    } catch {
      // Products endpoint not accessible
    }
    
    // Try to find contact email
    let contactEmail: string | null = null;
    let contactForm: string | null = null;
    
    try {
      const contactResponse = await fetch(`https://${domain}/pages/contact`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ContentBloom/1.0)' }
      });
      const contactHtml = await contactResponse.text();
      
      // Extract email
      const emailMatch = contactHtml.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) {
        contactEmail = emailMatch[0];
      }
      
      // Check for contact form
      if (contactHtml.includes('form') && contactHtml.includes('contact')) {
        contactForm = `https://${domain}/pages/contact`;
      }
    } catch {
      // No contact page
    }
    
    // Calculate lead score
    let score = 50; // Base score
    
    // No blog = great lead
    if (!hasBlogs) score += 30;
    else if (blogPostCount < 3) score += 20;
    else if (blogPostCount < 10) score += 10;
    else score -= 20; // Too much content already
    
    // Active store bonus
    if (productCount >= 50) score += 15;
    else if (productCount >= 20) score += 10;
    else if (productCount < 10) score -= 20; // Too small
    
    // Contact info bonus
    if (contactEmail) score += 10;
    
    return {
      domain,
      hasBlogs,
      blogPostCount,
      productCount,
      contactEmail,
      contactForm,
      score: Math.max(0, Math.min(100, score)),
      lastChecked: new Date().toISOString(),
      status: 'new'
    };
  } catch (error) {
    console.error(`Error analyzing ${domain}:`, error);
    return null;
  }
}

/**
 * Search Google for Shopify stores in a niche
 */
async function searchNiche(niche: string, country: string): Promise<string[]> {
  // This would use a search API in production
  // For now, return some known patterns to search manually
  const searchQueries = [
    `site:myshopify.com "${niche}"`,
    `"powered by shopify" "${niche}" ${country}`,
    `inurl:collections "${niche}" shopify`
  ];
  
  console.log(`Search queries for ${niche} (${country}):`);
  searchQueries.forEach(q => console.log(`  - ${q}`));
  
  return []; // Would return domains from actual search
}

/**
 * Main scraper function
 */
async function findLeads(config: ScraperConfig = DEFAULT_CONFIG): Promise<ShopifyLead[]> {
  const leads: ShopifyLead[] = [];
  
  console.log('🔍 ContentBloom Lead Finder');
  console.log('===========================');
  console.log(`Niches: ${config.niches.join(', ')}`);
  console.log(`Countries: ${config.countries.join(', ')}`);
  console.log(`Max blog posts: ${config.maxBlogPosts}`);
  console.log(`Min products: ${config.minProducts}`);
  console.log('');
  
  // For each niche and country combination
  for (const niche of config.niches) {
    for (const country of config.countries) {
      console.log(`\n📦 Searching: ${niche} in ${country}...`);
      
      const domains = await searchNiche(niche, country);
      
      for (const domain of domains) {
        if (await isShopifyStore(domain)) {
          const analysis = await analyzeStore(domain);
          if (analysis && analysis.score! >= 50) {
            leads.push({
              storeName: domain.split('.')[0],
              niche,
              country,
              ...analysis
            } as ShopifyLead);
            console.log(`  ✅ Found: ${domain} (score: ${analysis.score})`);
          }
        }
      }
    }
  }
  
  return leads.sort((a, b) => b.score - a.score);
}

/**
 * Save leads to file
 */
function saveLeads(leads: ShopifyLead[], filename: string = 'leads.json'): void {
  const filepath = path.join(__dirname, '..', 'data', filename);
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, JSON.stringify(leads, null, 2));
  console.log(`\n💾 Saved ${leads.length} leads to ${filepath}`);
}

// Export for use in other scripts
export { findLeads, analyzeStore, isShopifyStore, saveLeads, ShopifyLead, ScraperConfig };

// CLI usage
if (require.main === module) {
  findLeads().then(leads => {
    saveLeads(leads);
    console.log('\n📊 Summary:');
    console.log(`  Total leads: ${leads.length}`);
    console.log(`  High quality (80+): ${leads.filter(l => l.score >= 80).length}`);
    console.log(`  With email: ${leads.filter(l => l.contactEmail).length}`);
  });
}
