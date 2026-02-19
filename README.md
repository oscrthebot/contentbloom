# ContentBloom

> AI-Powered Content Automation Platform for E-commerce

ContentBloom automatically generates SEO-optimized blog posts, social media content, and email campaigns for e-commerce stores. Connect your Shopify or WooCommerce store, let AI create engaging content, and watch your traffic grow.

![ContentBloom Dashboard](https://via.placeholder.com/1200x600/667eea/ffffff?text=ContentBloom+Dashboard)

## 🚀 Features

- **🤖 AI Content Generation** - Create high-quality blog posts optimized for SEO and conversions
- **🔍 Keyword Research** - Automatically discover trending keywords using DataForSEO
- **📅 Content Calendar** - Schedule and manage all your content in one place
- **🛍️ Shopify Integration** - Publish directly to your Shopify blog
- **📊 Analytics** - Track performance, views, conversions, and revenue
- **✉️ Email Campaigns** - Automated outreach and customer engagement
- **🌙 Dark Mode** - Beautiful UI with full dark mode support

## 🎯 Perfect For

- E-commerce store owners who want to increase organic traffic
- Marketing teams looking to automate content creation
- Agencies managing multiple client stores
- Anyone selling online who needs consistent, quality content

## 💰 Pricing

| Plan | Price | Features |
|------|-------|----------|
| **Starter** | $150/mo | 10 posts/month, 1 store, keyword research, email support |
| **Growth** | $250/mo | 25 posts/month, 3 stores, social content, priority support |
| **Scale** | $400/mo | Unlimited posts, unlimited stores, video content, dedicated manager |

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, TypeScript, TailwindCSS
- **Backend:** Convex (database + serverless functions)
- **AI:** OpenAI GPT-4 for content generation
- **SEO:** DataForSEO API for keyword research
- **E-commerce:** Shopify Admin API, WooCommerce REST API
- **Payments:** Stripe
- **Deployment:** Vercel

## 📦 Quick Start

### Prerequisites

- Node.js 18+
- Convex account ([free signup](https://convex.dev))
- DataForSEO API key
- Shopify Partner account (for testing)

### Installation

```bash
# Clone repository
git clone https://github.com/oscrthebot/contentbloom.git
cd contentbloom

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Initialize Convex
npx convex dev

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📖 Documentation

- **[Setup Guide](./SETUP.md)** - Detailed installation and configuration
- **[GTM Pipeline](./docs/GTM-PIPELINE.md)** - Go-to-market strategy and lead generation
- **[User Pipeline](./docs/USER-PIPELINE.md)** - Complete user journey and onboarding
- **[Shopify Integration](./docs/SHOPIFY-INTEGRATION.md)** - OAuth flow and API implementation

## 🏗️ Project Structure

```
contentbloom/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Landing page
│   ├── dashboard/         # Dashboard pages
│   └── api/               # API routes
├── components/            # React components
├── convex/                # Convex backend (database + functions)
│   └── schema.ts         # Database schema
├── docs/                  # Documentation
├── public/                # Static assets
└── SETUP.md              # Setup guide
```

## 🎨 Screenshots

### Landing Page
![Landing Page](https://via.placeholder.com/800x450/667eea/ffffff?text=Landing+Page)

### Dashboard
![Dashboard](https://via.placeholder.com/800x450/667eea/ffffff?text=Dashboard)

### Content Calendar
![Content Calendar](https://via.placeholder.com/800x450/667eea/ffffff?text=Content+Calendar)

## 🚦 Roadmap

### ✅ Phase 1: MVP (Completed)
- [x] Landing page
- [x] Dashboard UI
- [x] Convex database setup
- [x] DataForSEO integration
- [x] Documentation

### 🔄 Phase 2: Core Features (In Progress)
- [ ] Shopify OAuth flow
- [ ] AI content generation
- [ ] Publishing workflow
- [ ] Stripe integration

### 📋 Phase 3: Growth Features
- [ ] Lead scraper
- [ ] Email outreach
- [ ] WooCommerce support
- [ ] Social media content

### 🎯 Phase 4: Scale
- [ ] Video content generation
- [ ] Multi-language support
- [ ] Team collaboration
- [ ] Advanced analytics

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

Built with ❤️ by the ContentBloom team

- **Lead Developer:** [@oscrthebot](https://github.com/oscrthebot)
- **Contact:** rafa@happyoperators.com

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Convex](https://convex.dev/) - Backend platform
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [Shopify](https://shopify.dev/) - E-commerce API
- [DataForSEO](https://dataforseo.com/) - SEO data
- [OpenAI](https://openai.com/) - AI content generation

## 📧 Contact

- **Website:** [contentbloom.com](https://contentbloom.com) *(coming soon)*
- **Email:** support@contentbloom.com
- **Twitter:** [@contentbloom](https://twitter.com/contentbloom)

---

**Star ⭐ this repo if you find it helpful!**
