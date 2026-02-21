import Link from "next/link";
import {
  ArrowRight,
  Check,
  Zap,
  TrendingUp,
  Mail,
  FileText,
  Star,
  ChevronRight,
  Sparkles,
  BarChart3,
  Globe,
  Clock,
} from "lucide-react";

// ─── NAV ────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1a1a1a] bg-[#080808]/90 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#16C784] flex items-center justify-center">
            <Sparkles size={14} className="text-black" />
          </div>
          <span className="font-bold text-white tracking-tight">ContentBloom</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-[#888]">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-[#888] hover:text-white transition-colors hidden md:block">
            Log in
          </Link>
          <Link href="/signup" className="btn-green px-4 py-2 text-sm">
            Get 2 Free Articles
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ─── HERO ────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="hero-bg pt-36 pb-24 px-6 text-center">
      <div className="max-w-4xl mx-auto">
        <div className="animate-fade-up">
          <span className="pill-badge mb-6 inline-flex">
            <Sparkles size={12} />
            AI-Powered Content for E-commerce
          </span>
        </div>

        <h1 className="animate-fade-up-delay-1 text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
          Your Shopify store{" "}
          <br className="hidden md:block" />
          deserves a blog that{" "}
          <br className="hidden md:block" />
          <span className="gradient-text">actually ranks</span>
        </h1>

        <p className="animate-fade-up-delay-2 text-lg text-[#888] max-w-xl mx-auto mb-10 leading-relaxed">
          We write daily SEO blog posts for your Shopify store — fully automated,
          Google-optimized, and published for you. While you focus on the business,
          we grow your organic traffic.
        </p>

        <div className="animate-fade-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="btn-green px-7 py-3.5 text-base flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            Get 2 Free Articles
            <ArrowRight size={18} />
          </Link>
          <Link
            href="#how-it-works"
            className="btn-ghost px-7 py-3.5 text-base flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            See How It Works
            <ChevronRight size={16} className="text-[#888]" />
          </Link>
        </div>

        <p className="text-xs text-[#555] mt-5">
          No credit card required · 2 articles, zero strings attached
        </p>
      </div>

      {/* Hero visual */}
      <div className="max-w-3xl mx-auto mt-16 animate-fade-up-delay-3">
        <div className="mockup-card animate-float">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-[#333]" />
            <div className="w-3 h-3 rounded-full bg-[#333]" />
            <div className="w-3 h-3 rounded-full bg-[#333]" />
            <div className="flex-1 bg-[#1a1a1a] rounded h-5 mx-4" />
          </div>
          <div className="grid grid-cols-3 gap-4 text-left">
            <div className="col-span-2 space-y-3">
              <div className="text-xs text-[#16C784] font-medium">PUBLISHED TODAY</div>
              <div className="text-sm font-semibold">10 Best Yoga Mats for Home Practice in 2026 (Tested & Ranked)</div>
              <div className="text-xs text-[#555] leading-relaxed">
                Looking for the perfect yoga mat? We tested 47 options so you don&apos;t have to. Here&apos;s what actually works for your practice...
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs bg-[#16C784]/10 text-[#16C784] px-2 py-0.5 rounded-full">SEO Score: 94</span>
                <span className="text-xs text-[#555]">1,240 words</span>
                <span className="text-xs text-[#555]">↗ Ranking: #3</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="bg-[#1a1a1a] rounded-lg p-3">
                <div className="text-xs text-[#555] mb-1">Organic traffic</div>
                <div className="text-lg font-bold text-[#16C784]">+340%</div>
                <div className="text-xs text-[#555]">vs last month</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-3">
                <div className="text-xs text-[#555] mb-1">Articles live</div>
                <div className="text-lg font-bold">87</div>
                <div className="text-xs text-[#555]">this quarter</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SOCIAL PROOF BAR ─────────────────────────────────────────────────────

function SocialProof() {
  const platforms = [
    "Shopify", "WooCommerce", "BigCommerce", "Wix", "Squarespace",
    "Shopify Plus", "Etsy", "PrestaShop", "Shopify", "WooCommerce",
    "BigCommerce", "Wix", "Squarespace", "Shopify Plus", "Etsy", "PrestaShop",
  ];

  return (
    <section className="border-y border-[#1a1a1a] py-8 overflow-hidden">
      <p className="text-center text-xs text-[#444] mb-6 tracking-wider uppercase">
        Works with every major e-commerce platform
      </p>
      <div className="relative">
        <div className="flex animate-scroll-left gap-12 w-max">
          {platforms.map((p, i) => (
            <div key={i} className="text-[#444] font-semibold text-sm whitespace-nowrap hover:text-[#666] transition-colors">
              {p}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FEATURES ────────────────────────────────────────────────────────────────

function FeatureRow({
  label,
  title,
  description,
  bullets,
  visual,
  reverse = false,
}: {
  label: string;
  title: string;
  description: string;
  bullets: string[];
  visual: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <div
      className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-12 md:gap-20`}
    >
      <div className="flex-1">
        <div className="text-xs font-semibold text-[#16C784] uppercase tracking-widest mb-4">{label}</div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{title}</h2>
        <p className="text-[#888] leading-relaxed mb-8">{description}</p>
        <ul className="space-y-3">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-[#aaa]">
              <Check size={16} className="text-[#16C784] mt-0.5 shrink-0" />
              {b}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 w-full">{visual}</div>
    </div>
  );
}

function ArticleMockup() {
  return (
    <div className="mockup-card card-hover">
      <div className="text-xs text-[#16C784] font-medium mb-3">✦ Today&apos;s article</div>
      <div className="text-sm font-semibold mb-2">How to Choose the Right Running Shoes for Marathon Training</div>
      <div className="text-xs text-[#555] mb-4">Published to your Shopify blog · 3 min ago</div>
      <div className="space-y-2">
        {["Introduction & hook", "Section 1: Foot type analysis", "Section 2: Cushioning guide", "Section 3: Top 5 picks", "Buying guide & CTA"].map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-[#666]">
            <Check size={10} className="text-[#16C784]" />
            {s}
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-[#222] flex items-center justify-between text-xs text-[#555]">
        <span>1,340 words</span>
        <span className="text-[#16C784]">SEO Score: 97</span>
        <span>Keyword density: 1.8%</span>
      </div>
    </div>
  );
}

function ShopifyMockup() {
  return (
    <div className="mockup-card card-hover">
      <div className="text-xs text-[#555] mb-3">Shopify Admin → Blog posts</div>
      <div className="space-y-2">
        {[
          { title: "Best yoga mats 2026", date: "Today", status: "Published" },
          { title: "Home gym setup guide", date: "Yesterday", status: "Published" },
          { title: "Protein powder comparison", date: "2 days ago", status: "Published" },
          { title: "Recovery tools review", date: "3 days ago", status: "Published" },
        ].map((post, i) => (
          <div key={i} className="flex items-center justify-between p-2.5 bg-[#1a1a1a] rounded-lg">
            <div>
              <div className="text-xs font-medium">{post.title}</div>
              <div className="text-xs text-[#555] mt-0.5">{post.date}</div>
            </div>
            <span className="text-xs text-[#16C784] bg-[#16C784]/10 px-2 py-0.5 rounded-full">{post.status}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-[#555] text-center">+ 83 more articles published this quarter</div>
    </div>
  );
}

function EmailMockup() {
  return (
    <div className="mockup-card card-hover">
      <div className="text-xs text-[#555] mb-3">Outreach email — sent by ContentBloom</div>
      <div className="bg-[#1a1a1a] rounded-lg p-4 text-xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[#555]">To:</span>
          <span>hello@yourbrand.com</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#555]">Subject:</span>
          <span className="font-medium">Your store + 2 free articles (no catch)</span>
        </div>
        <hr className="border-[#222]" />
        <p className="text-[#888] leading-relaxed">
          Hi Sarah,<br /><br />
          I noticed your Shopify store has a great product selection but no blog. That&apos;s leaving serious organic traffic on the table.<br /><br />
          We&apos;d love to write 2 free SEO articles for your store — no strings attached...
        </p>
        <div className="flex gap-2 mt-2">
          <span className="bg-[#16C784]/10 text-[#16C784] px-2 py-0.5 rounded-full text-xs">Sent ✓</span>
          <span className="text-[#555]">Opened 3 hours ago</span>
        </div>
      </div>
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-24 space-y-24">
      <FeatureRow
        label="Content automation"
        title="AI articles on autopilot"
        description="Every morning, a new SEO-optimized article lands on your Shopify blog. Written by AI trained on high-ranking e-commerce content — no fluff, no filler."
        bullets={[
          "Keyword research done automatically with DataForSEO",
          "Articles optimized for Google's E-E-A-T guidelines",
          "Published directly to your Shopify blog via API",
          "Revisions included — send it back if you want changes",
        ]}
        visual={<ArticleMockup />}
      />
      <FeatureRow
        label="Shopify integration"
        title="Built for Shopify stores"
        description="Connect once, publish forever. ContentBloom integrates directly with your Shopify blog so every article goes live without you lifting a finger."
        bullets={[
          "One-click Shopify store connection",
          "Auto-publishes with tags, categories & meta descriptions",
          "Works with every Shopify theme and plan",
          "Dashboard to review all published content",
        ]}
        visual={<ShopifyMockup />}
        reverse
      />
      <FeatureRow
        label="Done-for-you outreach"
        title="We do the outreach too"
        description="Not a ContentBloom customer yet? We find your store, write 2 free sample articles, and send them to you. No strings attached — just proof it works."
        bullets={[
          "We identify stores with little or no blog content",
          "2 custom articles written for your specific niche",
          "Sent directly to your email — yours to keep",
          "Subscribe only if you love the results",
        ]}
        visual={<EmailMockup />}
      />
    </section>
  );
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      icon: <Globe size={20} />,
      step: "01",
      title: "Connect your store",
      desc: "Link your Shopify store in 30 seconds. We scan your products and niche to create a content strategy tailored to your audience.",
    },
    {
      icon: <Zap size={20} />,
      step: "02",
      title: "AI writes daily",
      desc: "Every day, our AI researches trending keywords, writes a long-form SEO article, and publishes it to your blog — automatically.",
    },
    {
      icon: <TrendingUp size={20} />,
      step: "03",
      title: "Organic traffic grows",
      desc: "Articles start ranking in 4–8 weeks. As content accumulates, you build compounding traffic that brings customers for years.",
    },
  ];

  return (
    <section id="how-it-works" className="border-t border-[#1a1a1a] py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-semibold text-[#16C784] uppercase tracking-widest mb-4">How it works</div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Set it up once,<br />watch traffic grow
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="bg-[#111] border border-[#222] rounded-2xl p-8 card-hover">
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#16C784]/10 text-[#16C784] flex items-center justify-center">
                  {s.icon}
                </div>
                <span className="text-3xl font-bold text-[#222]">{s.step}</span>
              </div>
              <h3 className="text-lg font-bold mb-3">{s.title}</h3>
              <p className="text-sm text-[#888] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── STATS ───────────────────────────────────────────────────────────────────

function Stats() {
  const stats = [
    { value: "340%", label: "Average traffic increase in 90 days" },
    { value: "€0.08", label: "Cost per article vs €300+ with agencies" },
    { value: "500+", label: "Shopify stores already growing with us" },
    { value: "4–8 wks", label: "Average time to first Google ranking" },
  ];

  return (
    <section className="border-t border-[#1a1a1a] py-20 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <div key={i} className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-[#16C784] mb-2">{s.value}</div>
            <div className="text-xs text-[#555] leading-relaxed">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── PRICING ─────────────────────────────────────────────────────────────────

function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "€49",
      period: "/month",
      desc: "Perfect for new stores starting content marketing",
      articles: "1 article per day",
      features: [
        "30 SEO articles per month",
        "Shopify auto-publish",
        "Keyword research included",
        "Meta descriptions & tags",
        "1 revision per article",
        "Email support",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Growth",
      price: "€99",
      period: "/month",
      desc: "For established stores ready to dominate search",
      articles: "3 articles per day",
      features: [
        "90 SEO articles per month",
        "Shopify auto-publish",
        "Advanced keyword clustering",
        "Internal linking strategy",
        "Unlimited revisions",
        "Priority support",
        "Monthly performance report",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Scale",
      price: "€149",
      period: "/month",
      desc: "Maximum content velocity for high-growth brands",
      articles: "5 articles per day",
      features: [
        "150 SEO articles per month",
        "Shopify auto-publish",
        "Competitor gap analysis",
        "Topic cluster strategy",
        "Unlimited revisions",
        "Dedicated account manager",
        "Weekly performance calls",
        "Custom content calendar",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="border-t border-[#1a1a1a] py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-semibold text-[#16C784] uppercase tracking-widest mb-4">Pricing</div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-[#888] text-lg">Cancel anytime. Start with 2 free articles.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`bg-[#111] border rounded-2xl p-8 flex flex-col card-hover ${
                plan.popular ? "pricing-popular border-[#16C784]" : "border-[#222]"
              }`}
            >
              {plan.popular && (
                <div className="text-xs font-semibold text-[#16C784] bg-[#16C784]/10 px-3 py-1 rounded-full inline-block mb-4 w-fit">
                  Most popular
                </div>
              )}
              <div className="text-sm font-semibold text-[#888] mb-1">{plan.name}</div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-[#555]">{plan.period}</span>
              </div>
              <div className="text-xs text-[#16C784] font-medium mb-3">{plan.articles}</div>
              <p className="text-sm text-[#666] mb-8 leading-relaxed">{plan.desc}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2.5 text-sm text-[#aaa]">
                    <Check size={14} className="text-[#16C784] mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`py-3 rounded-lg text-sm font-semibold text-center transition-all ${
                  plan.popular
                    ? "btn-green"
                    : "btn-ghost"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-[#444] mt-8">
          All plans include 2 free articles to start. No credit card required.
        </p>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS ────────────────────────────────────────────────────────────

function Testimonials() {
  const testimonials = [
    {
      quote: "We went from zero blog posts to ranking on page 1 for 12 keywords in just 3 months. ContentBloom is the best €99 we spend every month.",
      name: "Maria T.",
      role: "Founder, FitnessPro Store",
      initial: "M",
    },
    {
      quote: "I was skeptical about AI content but the articles are genuinely good. Our organic traffic is up 280% and we haven't touched the blog ourselves.",
      name: "James K.",
      role: "Owner, The Outdoor Co.",
      initial: "J",
    },
    {
      quote: "The free articles they sent blew me away. Signed up immediately. It's like having a full-time SEO writer for less than €2 a day.",
      name: "Sophie L.",
      role: "E-commerce Director, Luxe Beauty",
      initial: "S",
    },
  ];

  return (
    <section className="border-t border-[#1a1a1a] py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-semibold text-[#16C784] uppercase tracking-widest mb-4">Testimonials</div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Stores growing with ContentBloom
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-[#111] border border-[#222] rounded-2xl p-8 card-hover flex flex-col">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, si) => (
                  <Star key={si} size={14} className="text-[#16C784] fill-[#16C784]" />
                ))}
              </div>
              <p className="text-sm text-[#aaa] leading-relaxed flex-1 mb-8">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#16C784]/20 text-[#16C784] flex items-center justify-center text-sm font-bold">
                  {t.initial}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-[#555]">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA BANNER ──────────────────────────────────────────────────────────────

function CTABanner() {
  return (
    <section className="px-6 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="bg-[#111] border border-[#222] rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#16C784]/5 rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <div className="text-xs font-semibold text-[#16C784] uppercase tracking-widest mb-4">Get started today</div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Ready to grow your store&apos;s<br className="hidden md:block" /> organic traffic?
            </h2>
            <p className="text-[#888] mb-10 text-lg max-w-lg mx-auto">
              Join 500+ Shopify stores getting daily SEO content. Start with 2 free articles — no credit card needed.
            </p>
            <Link
              href="/signup"
              className="btn-green px-8 py-4 text-base flex items-center gap-2 w-fit mx-auto"
            >
              Get 2 Free Articles
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-[#1a1a1a] py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#16C784] flex items-center justify-center">
            <Sparkles size={12} className="text-black" />
          </div>
          <span className="font-bold text-sm">ContentBloom</span>
        </div>
        <div className="flex items-center gap-8 text-xs text-[#555]">
          <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          <Link href="mailto:hello@bloomcontent.site" className="hover:text-white transition-colors">Contact</Link>
        </div>
        <p className="text-xs text-[#444]">© 2026 ContentBloom. All rights reserved.</p>
      </div>
    </footer>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#080808]">
      <Nav />
      <Hero />
      <SocialProof />
      <Features />
      <HowItWorks />
      <Stats />
      <Pricing />
      <Testimonials />
      <CTABanner />
      <Footer />
    </main>
  );
}
