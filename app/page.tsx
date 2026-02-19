import Link from "next/link";
import { ArrowRight, Zap, TrendingUp, Mail, Calendar } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-black">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ContentBloom
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
                Log in
              </Link>
              <Link href="/signup" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
            AI-Powered Content <br />for E-commerce
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Automatically generate SEO-optimized blog posts, social media content, and email campaigns for your online store. Convert traffic into revenue while you sleep.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-xl transition inline-flex items-center justify-center gap-2">
              Start Free Trial
              <ArrowRight size={20} />
            </Link>
            <Link href="#demo" className="px-8 py-4 border border-gray-300 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition">
              See Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything You Need to Scale Content</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Zap className="w-6 h-6" />}
            title="AI Content Generation"
            description="Generate high-quality blog posts optimized for SEO and conversions in minutes."
          />
          <FeatureCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Keyword Research"
            description="Automatically discover trending keywords in your niche using DataForSEO."
          />
          <FeatureCard
            icon={<Calendar className="w-6 h-6" />}
            title="Auto-Publishing"
            description="Schedule and publish content directly to your Shopify or WooCommerce blog."
          />
          <FeatureCard
            icon={<Mail className="w-6 h-6" />}
            title="Email Outreach"
            description="Run automated email campaigns to engage customers and drive sales."
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <StepCard
            number="1"
            title="Connect Your Store"
            description="Link your Shopify or WooCommerce store in seconds."
          />
          <StepCard
            number="2"
            title="AI Generates Content"
            description="Our AI analyzes your products and creates SEO-optimized content."
          />
          <StepCard
            number="3"
            title="Auto-Publish & Grow"
            description="Content publishes automatically. Watch your traffic and sales grow."
          />
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12">Choose the plan that fits your business</p>
        <div className="grid md:grid-cols-3 gap-8">
          <PricingCard
            name="Starter"
            price="$150"
            features={[
              "10 blog posts/month",
              "Basic keyword research",
              "1 store connection",
              "Email support"
            ]}
          />
          <PricingCard
            name="Growth"
            price="$250"
            features={[
              "25 blog posts/month",
              "Advanced keyword research",
              "3 store connections",
              "Social media content",
              "Priority support"
            ]}
            highlighted
          />
          <PricingCard
            name="Scale"
            price="$400"
            features={[
              "Unlimited blog posts",
              "Full keyword suite",
              "Unlimited stores",
              "Video content",
              "Email campaigns",
              "Dedicated account manager"
            ]}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-bold mb-4">Ready to Scale Your Content?</h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Join hundreds of e-commerce stores automating their content strategy
        </p>
        <Link href="/signup" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-xl transition inline-flex items-center gap-2">
          Start Your Free Trial
          <ArrowRight size={20} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded" />
                <span className="font-bold">ContentBloom</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-powered content automation for e-commerce
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="#features">Features</Link></li>
                <li><Link href="#pricing">Pricing</Link></li>
                <li><Link href="#demo">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/privacy">Privacy</Link></li>
                <li><Link href="/terms">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            © 2026 ContentBloom. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-lg transition bg-white dark:bg-gray-950">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-lg flex items-center justify-center mb-4 text-blue-600">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

function PricingCard({ name, price, features, highlighted }: { name: string; price: string; features: string[]; highlighted?: boolean }) {
  return (
    <div className={`p-8 rounded-2xl border ${highlighted ? 'border-blue-600 shadow-xl scale-105' : 'border-gray-200 dark:border-gray-800'} bg-white dark:bg-gray-950`}>
      {highlighted && (
        <div className="text-xs font-semibold text-blue-600 mb-2">MOST POPULAR</div>
      )}
      <h3 className="text-2xl font-bold mb-2">{name}</h3>
      <div className="mb-6">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-gray-600 dark:text-gray-400">/month</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <Link 
        href="/signup" 
        className={`block w-full py-3 rounded-lg text-center font-medium transition ${
          highlighted 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg' 
            : 'border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900'
        }`}
      >
        Get Started
      </Link>
    </div>
  );
}
