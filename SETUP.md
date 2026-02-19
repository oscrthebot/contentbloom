# ContentBloom Setup Guide

## Project Overview

**ContentBloom** is an AI-powered content automation platform for e-commerce stores. It automatically generates SEO-optimized blog posts, manages content calendars, and publishes directly to Shopify/WooCommerce.

**Tech Stack:**
- Next.js 15 (App Router)
- TypeScript
- TailwindCSS
- Convex (Database + Backend)
- DataForSEO (Keyword Research)
- Shopify Admin API
- Stripe (Payments)

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Convex account (free tier available)
- DataForSEO account (for keyword research)
- Shopify Partner account (for testing)
- Stripe account (for payments)

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/oscrthebot/contentbloom.git
cd contentbloom
npm install
```

### 2. Environment Variables

Create `.env.local` file in the root directory:

```bash
# Convex
CONVEX_DEPLOYMENT=dev:xxxxx  # Get from `npx convex dev`
NEXT_PUBLIC_CONVEX_URL=https://xxxxx.convex.cloud

# DataForSEO API
DATAFORSEO_LOGIN=your_email@example.com
DATAFORSEO_PASSWORD=your_password

# Shopify App Credentials
SHOPIFY_CLIENT_ID=your_client_id
SHOPIFY_CLIENT_SECRET=your_client_secret
SHOPIFY_REDIRECT_URI=http://localhost:3000/api/shopify/callback

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# App URL
APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OpenAI (for content generation)
OPENAI_API_KEY=sk-xxxxx
```

### 3. Initialize Convex

```bash
# Install Convex CLI globally
npm install -g convex

# Initialize Convex project
npx convex dev

# This will:
# 1. Create a Convex account (if needed)
# 2. Set up a development deployment
# 3. Sync your schema to the cloud
# 4. Provide CONVEX_DEPLOYMENT and NEXT_PUBLIC_CONVEX_URL for .env.local
```

### 4. Run Development Server

```bash
# Terminal 1: Run Convex (watches for schema/function changes)
npx convex dev

# Terminal 2: Run Next.js
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

Convex schemas are defined in `convex/schema.ts`:

- **users** - User accounts, plans, Stripe data
- **stores** - Connected e-commerce stores
- **leads** - Potential customers (for outreach)
- **content** - Generated blog posts, social media content
- **campaigns** - Email outreach campaigns

Schema is automatically synced when running `npx convex dev`.

## API Endpoints

### DataForSEO Keywords
**Endpoint:** `POST /api/dataforseo/keywords`

**Request:**
```json
{
  "niche": "running shoes",
  "location": "United States",
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "keywords": [
    {
      "keyword": "best running shoes",
      "searchVolume": 12000,
      "competition": 0.65,
      "cpc": 1.45,
      "difficulty": 42
    }
  ]
}
```

**Test:**
```bash
curl -X POST http://localhost:3000/api/dataforseo/keywords \
  -H "Content-Type: application/json" \
  -d '{"niche": "yoga mat"}'
```

## Shopify Integration

### Create Shopify App

1. Go to [Shopify Partners](https://partners.shopify.com/)
2. Create new app
3. App setup:
   - **App URL:** `http://localhost:3000`
   - **Redirect URLs:** `http://localhost:3000/api/shopify/callback`
   - **Scopes:** `write_content`, `read_products`, `read_themes`

4. Get Client ID and Secret → Add to `.env.local`

### Test OAuth Flow

1. Create development store in Shopify Partners
2. Navigate to `/dashboard/store` in ContentBloom
3. Click "Connect Shopify Store"
4. Complete OAuth flow
5. Test publishing a blog post

## Stripe Integration

### Setup

1. Get API keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Create products and prices:
   - **Starter:** $150/month
   - **Growth:** $250/month
   - **Scale:** $400/month

3. Enable billing portal (for subscription management)

### Test Payment Flow

1. Use test card: `4242 4242 4242 4242`
2. Any future expiry date
3. Any CVC

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# (same as .env.local but use production values)
```

### Deploy Convex to Production

```bash
# Create production deployment
npx convex deploy

# Update CONVEX_DEPLOYMENT and NEXT_PUBLIC_CONVEX_URL in Vercel
```

### Update Shopify App URLs

After deployment, update in Shopify Partners:
- **App URL:** `https://contentbloom.vercel.app`
- **Redirect URI:** `https://contentbloom.vercel.app/api/shopify/callback`

## Testing

### Run Type Checking
```bash
npm run build
```

### Test API Endpoints
```bash
# Test DataForSEO
curl http://localhost:3000/api/dataforseo/keywords

# Should return config status
```

## Common Issues

### Convex Not Syncing

**Problem:** Schema changes not appearing

**Solution:**
```bash
# Stop convex dev
# Delete .convex/ directory
rm -rf .convex/
# Restart
npx convex dev
```

### Shopify OAuth Fails

**Problem:** Redirect URI mismatch

**Solution:**
- Verify exact URL match in Shopify Partners (including http/https)
- Check for trailing slashes

### DataForSEO 401 Error

**Problem:** Invalid credentials

**Solution:**
- Verify email/password in `.env.local`
- Test credentials at [DataForSEO API Sandbox](https://app.dataforseo.com/)

## Project Structure

```
contentbloom/
├── app/
│   ├── page.tsx              # Landing page
│   ├── dashboard/            # Dashboard pages
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Overview
│   │   ├── content/
│   │   ├── store/
│   │   ├── analytics/
│   │   └── settings/
│   └── api/
│       └── dataforseo/
│           └── keywords/route.ts
├── components/
│   └── theme-provider.tsx    # Dark mode support
├── convex/
│   └── schema.ts             # Database schema
├── docs/
│   ├── GTM-PIPELINE.md       # Go-to-market strategy
│   ├── USER-PIPELINE.md      # User journey
│   └── SHOPIFY-INTEGRATION.md
├── public/
├── .env.local                # Environment variables (create this)
├── convex.json
├── next.config.ts
├── package.json
├── README.md
├── SETUP.md                  # This file
└── tsconfig.json
```

## Next Steps

### Phase 1: Core Features (Week 1-2)
- [ ] Implement Shopify OAuth flow
- [ ] Build content generation (OpenAI integration)
- [ ] Create publishing workflow
- [ ] Add Stripe checkout

### Phase 2: User Experience (Week 3-4)
- [ ] Build onboarding flow
- [ ] Add content calendar view
- [ ] Implement scheduling
- [ ] Create analytics dashboard

### Phase 3: Growth Features (Month 2)
- [ ] Lead scraper (Apify integration)
- [ ] Email outreach system
- [ ] WooCommerce support
- [ ] Social media content generation

### Phase 4: Scale (Month 3+)
- [ ] Video content generation
- [ ] Multi-language support
- [ ] Team collaboration features
- [ ] Advanced analytics

## Support

For questions or issues:
- Email: support@contentbloom.com
- Docs: [docs.contentbloom.com](https://docs.contentbloom.com)
- GitHub Issues: [github.com/oscrthebot/contentbloom/issues](https://github.com/oscrthebot/contentbloom/issues)

## License

MIT License - See LICENSE file for details
