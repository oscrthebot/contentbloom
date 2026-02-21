import Link from "next/link";
import { ArrowRight, Check, Star, Sparkles, ChevronRight, TrendingUp, Zap, Globe } from "lucide-react";
import { FeaturesSection } from "./features-section";

// ─── NAV ─────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20">
            <Sparkles size={13} className="text-black" />
          </div>
          <span className="font-bold text-[15px] tracking-tight">ContentBloom</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-[13px] text-zinc-400">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden md:block text-[13px] text-zinc-400 hover:text-white transition-colors">
            Log in
          </Link>
          <Link href="/signup" className="btn-primary text-[13px] px-4 py-2.5">
            Get 2 Free Articles
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative pt-40 pb-20 px-6 text-center overflow-hidden">
      {/* Glows */}
      <div className="hero-glow" />
      <div className="hero-glow-2" />
      {/* Subtle grid bg */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "48px 48px" }}
      />

      <div className="relative max-w-4xl mx-auto">
        <div className="anim-0">
          <span className="badge mb-6">
            <Sparkles size={11} />
            AI-Powered Content for E-commerce
          </span>
        </div>

        <h1 className="anim-1 text-5xl sm:text-6xl md:text-[80px] font-bold tracking-[-0.03em] leading-[1.02] mb-6">
          Your Shopify store<br />
          deserves a blog that<br />
          <span className="text-green-500">actually ranks</span>
        </h1>

        <p className="anim-2 text-lg text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed">
          We write daily SEO blog posts for your Shopify store — fully automated,
          Google-optimized, and published for you. While you focus on the business,
          we grow your organic traffic.
        </p>

        <div className="anim-3 flex flex-col sm:flex-row items-center justify-center gap-3 mb-5">
          <Link href="/signup" className="btn-primary text-[15px] px-6 py-3.5 w-full sm:w-auto justify-center">
            Get 2 Free Articles
            <ArrowRight size={16} />
          </Link>
          <Link href="#how-it-works" className="btn-ghost text-[15px] px-6 py-3.5 w-full sm:w-auto justify-center">
            See How It Works
            <ChevronRight size={15} className="text-zinc-500" />
          </Link>
        </div>
        <p className="text-xs text-zinc-600">No credit card required · 2 articles, zero strings attached</p>
      </div>

      {/* Hero mockup */}
      <div className="relative max-w-3xl mx-auto mt-16 anim-3">
        <div className="card float" style={{ padding: "28px" }}>
          {/* Browser chrome */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
            </div>
            <div className="flex-1 bg-zinc-900 rounded-md h-6 mx-3 flex items-center px-3">
              <span className="text-[11px] text-zinc-600">contentbloom.vercel.app/dashboard</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            {/* Article preview */}
            <div className="md:col-span-2 bg-zinc-900/50 rounded-xl p-5 border border-white/[0.05]">
              <div className="text-[11px] font-semibold text-green-500 uppercase tracking-widest mb-2">Published today</div>
              <div className="text-sm font-semibold leading-snug mb-2">
                10 Best Yoga Mats for Home Practice in 2026 (Tested & Ranked)
              </div>
              <div className="text-xs text-zinc-500 leading-relaxed mb-4">
                Looking for the perfect yoga mat? We tested 47 options so you don&apos;t have to. Here&apos;s what actually works for your practice...
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[11px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-medium">SEO Score: 94</span>
                <span className="text-[11px] text-zinc-600">1,240 words</span>
                <span className="text-[11px] text-zinc-600">↗ Ranking: #3</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-row md:flex-col gap-3">
              <div className="flex-1 bg-zinc-900/50 rounded-xl p-4 border border-white/[0.05]">
                <div className="text-[11px] text-zinc-600 mb-1">Organic traffic</div>
                <div className="text-2xl font-bold text-green-500">+340%</div>
                <div className="text-[11px] text-zinc-600">vs last month</div>
              </div>
              <div className="flex-1 bg-zinc-900/50 rounded-xl p-4 border border-white/[0.05]">
                <div className="text-[11px] text-zinc-600 mb-1">Articles live</div>
                <div className="text-2xl font-bold text-white">87</div>
                <div className="text-[11px] text-zinc-600">this quarter</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── LOGO BAR ─────────────────────────────────────────────────────────────────

function LogoBar() {
  const items = ["Shopify", "WooCommerce", "BigCommerce", "Wix", "Squarespace", "Shopify Plus", "Etsy", "PrestaShop",
    "Shopify", "WooCommerce", "BigCommerce", "Wix", "Squarespace", "Shopify Plus", "Etsy", "PrestaShop"];
  return (
    <section className="border-y border-white/[0.06] py-7 overflow-hidden">
      <p className="text-center text-[11px] text-zinc-600 mb-5 tracking-[0.12em] uppercase">
        Works with every major e-commerce platform
      </p>
      <div className="flex scroll-l w-max gap-14">
        {items.map((p, i) => (
          <span key={i} className="text-zinc-600 font-semibold text-sm whitespace-nowrap hover:text-zinc-400 transition-colors">
            {p}
          </span>
        ))}
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    { icon: <Globe size={18} />, n: "01", title: "Connect your store", desc: "Link your Shopify store in 30 seconds. We scan your products and niche to build a content strategy tailored to your audience." },
    { icon: <Zap size={18} />, n: "02", title: "AI writes daily", desc: "Every day, our AI researches trending keywords, writes a long-form SEO article, and publishes it automatically to your blog." },
    { icon: <TrendingUp size={18} />, n: "03", title: "Organic traffic grows", desc: "Articles start ranking in 4–8 weeks. Content accumulates into compounding traffic that brings customers for years." },
  ];

  return (
    <section id="how-it-works" className="py-28 px-6 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="badge mb-4">How it works</div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Set it up once,<br />watch traffic grow
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {steps.map((s, i) => (
            <div key={i} className="card card-hover p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
                  {s.icon}
                </div>
                <span className="text-4xl font-bold text-zinc-800 tabular-nums">{s.n}</span>
              </div>
              <h3 className="text-lg font-bold mb-3">{s.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── STATS ────────────────────────────────────────────────────────────────────

function Stats() {
  const s = [
    { v: "340%", l: "Average traffic increase\nin 90 days" },
    { v: "€0.08", l: "Cost per article vs\n€300+ with agencies" },
    { v: "500+", l: "Shopify stores already\ngrowing with us" },
    { v: "4–8 wks", l: "Average time to\nfirst Google ranking" },
  ];
  return (
    <section className="py-20 px-6 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {s.map((x, i) => (
          <div key={i} className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">{x.v}</div>
            <div className="text-[13px] text-zinc-500 leading-relaxed whitespace-pre-line">{x.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── PRICING ──────────────────────────────────────────────────────────────────

function Pricing() {
  const plans = [
    {
      name: "Starter", price: "€49", freq: "1 article / day",
      desc: "Perfect for new stores starting content marketing",
      features: ["30 SEO articles per month", "Shopify auto-publish", "Keyword research included", "Meta descriptions & tags", "1 revision per article", "Email support"],
      popular: false,
    },
    {
      name: "Growth", price: "€99", freq: "3 articles / day",
      desc: "For established stores ready to dominate search",
      features: ["90 SEO articles per month", "Shopify auto-publish", "Advanced keyword clustering", "Internal linking strategy", "Unlimited revisions", "Priority support", "Monthly performance report"],
      popular: true,
    },
    {
      name: "Scale", price: "€149", freq: "5 articles / day",
      desc: "Maximum velocity for high-growth brands",
      features: ["150 SEO articles per month", "Shopify auto-publish", "Competitor gap analysis", "Topic cluster strategy", "Unlimited revisions", "Dedicated account manager", "Weekly performance calls"],
      popular: false,
    },
  ];
  return (
    <section id="pricing" className="py-28 px-6 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="badge mb-4">Pricing</div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Simple plans<br />for serious growth
          </h2>
          <p className="text-zinc-400 text-lg">Cancel anytime. Start with 2 free articles.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((p, i) => (
            <div key={i} className={`card card-hover flex flex-col p-8 ${p.popular ? "plan-popular" : ""}`}>
              {p.popular && (
                <div className="text-[11px] font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full inline-block w-fit mb-5 tracking-wide uppercase">
                  Most popular
                </div>
              )}
              <div className="text-sm font-medium text-zinc-500 mb-1">{p.name}</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold">{p.price}</span>
                <span className="text-zinc-600 text-sm">/mo</span>
              </div>
              <div className="text-[12px] text-green-500 font-medium mb-3">{p.freq}</div>
              <p className="text-[13px] text-zinc-500 mb-7 leading-relaxed">{p.desc}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-[13px] text-zinc-300">
                    <Check size={13} className="text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className={p.popular ? "btn-primary justify-center" : "btn-ghost justify-center"}>
                Start Free Trial
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-zinc-700 mt-7">All plans start with 2 free articles. No credit card required.</p>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────

function Testimonials() {
  const t = [
    { q: "We went from zero blog posts to ranking page 1 for 12 keywords in 3 months. ContentBloom is the best €99 we spend every month.", n: "Maria T.", r: "Founder, FitnessPro Store", i: "M" },
    { q: "I was skeptical about AI content but the articles are genuinely good. Our organic traffic is up 280% and we haven't touched the blog ourselves.", n: "James K.", r: "Owner, The Outdoor Co.", i: "J" },
    { q: "The free articles they sent blew me away. Signed up immediately. It's like having a full-time SEO writer for less than €2 a day.", n: "Sophie L.", r: "Director, Luxe Beauty", i: "S" },
  ];
  return (
    <section className="py-28 px-6 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="badge mb-4">Testimonials</div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Stores growing with<br />ContentBloom
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {t.map((x, i) => (
            <div key={i} className="card card-hover flex flex-col p-8">
              <div className="flex gap-0.5 mb-6">
                {[...Array(5)].map((_, j) => <Star key={j} size={13} className="text-green-500 fill-green-500" />)}
              </div>
              <p className="text-[14px] text-zinc-300 leading-relaxed flex-1 mb-8">&ldquo;{x.q}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-500/15 text-green-500 flex items-center justify-center text-sm font-bold shrink-0">
                  {x.i}
                </div>
                <div>
                  <div className="text-sm font-semibold">{x.n}</div>
                  <div className="text-[12px] text-zinc-500">{x.r}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="px-6 pb-28">
      <div className="max-w-6xl mx-auto">
        <div className="card relative overflow-hidden p-14 text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(34,197,94,.07) 0%, transparent 65%)" }} />
          </div>
          <div className="relative">
            <div className="badge mb-5 mx-auto w-fit">Get started today</div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Ready to grow your store&apos;s<br className="hidden md:block" /> organic traffic?
            </h2>
            <p className="text-zinc-400 text-lg max-w-md mx-auto mb-10">
              Join 500+ Shopify stores getting daily SEO content. Start with 2 free articles.
            </p>
            <Link href="/signup" className="btn-primary text-[15px] px-7 py-3.5 mx-auto">
              Get 2 Free Articles
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-green-500 flex items-center justify-center">
            <Sparkles size={11} className="text-black" />
          </div>
          <span className="font-bold text-sm">ContentBloom</span>
        </div>
        <div className="flex items-center gap-7 text-[13px] text-zinc-600">
          <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          <Link href="mailto:hello@bloomcontent.site" className="hover:text-white transition-colors">Contact</Link>
        </div>
        <p className="text-[12px] text-zinc-700">© 2026 ContentBloom. All rights reserved.</p>
      </div>
    </footer>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Nav />
      <Hero />
      <LogoBar />
      <FeaturesSection />
      <HowItWorks />
      <Stats />
      <Pricing />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
