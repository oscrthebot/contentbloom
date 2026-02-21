import Link from "next/link";
import { ArrowRight, Check, Star, Sparkles, ChevronRight, TrendingUp, Zap, Globe } from "lucide-react";
import { FeaturesSection } from "./features-section";

// ─── NAV ──────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav className="nav-wrap">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:"var(--text-1)"}}>
            <Sparkles size={13} className="text-white" />
          </div>
          <span className="font-bold text-[15px] tracking-tight" style={{color:"var(--text-1)"}}>ContentBloom</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-[13px]" style={{color:"var(--text-2)"}}>
          <Link href="#features" className="hover:opacity-70 transition-opacity">Features</Link>
          <Link href="#how-it-works" className="hover:opacity-70 transition-opacity">How it works</Link>
          <Link href="#pricing" className="hover:opacity-70 transition-opacity">Pricing</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden md:block text-[13px] hover:opacity-70 transition-opacity" style={{color:"var(--text-2)"}}>
            Log in
          </Link>
          <Link href="/signup" className="btn-primary text-[13px]">
            Get 2 Free Articles
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ─── HERO ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="pt-36 pb-16 px-6 text-center" style={{background:"var(--bg)"}}>
      <div className="max-w-4xl mx-auto">

        <div className="au0">
          <span className="pill mb-6">
            <Sparkles size={10} style={{color:"var(--accent)"}} />
            AI-Powered Content for E-commerce
          </span>
        </div>

        <h1 className="au1 font-bold tracking-tight mb-6" style={{
          fontSize: "clamp(44px, 7vw, 80px)",
          lineHeight: 1.02,
          letterSpacing: "-0.03em",
          color: "var(--text-1)",
        }}>
          Your Shopify store<br />
          deserves a blog that<br />
          <span style={{color:"var(--accent)"}}>actually ranks</span>
        </h1>

        <p className="au2 text-lg leading-relaxed max-w-xl mx-auto mb-10" style={{color:"var(--text-2)"}}>
          We write daily SEO blog posts for your Shopify store — fully automated,
          Google-optimized, and published for you. While you focus on the business,
          we grow your organic traffic.
        </p>

        <div className="au3 flex flex-col sm:flex-row items-center justify-center gap-3 mb-5">
          <Link href="/signup" className="btn-primary text-[14px] w-full sm:w-auto justify-center">
            Get 2 Free Articles <ArrowRight size={15} />
          </Link>
          <Link href="#how-it-works" className="btn-outline text-[14px] w-full sm:w-auto justify-center">
            See How It Works <ChevronRight size={14} style={{color:"var(--text-3)"}} />
          </Link>
        </div>

        <p className="text-[12px]" style={{color:"var(--text-3)"}}>
          Trusted by 500+ e-commerce stores · No credit card required
        </p>
      </div>

      {/* Hero card mockup */}
      <div className="max-w-3xl mx-auto mt-14 au3">
        <div className="card float" style={{padding:28, boxShadow:"0 8px 40px rgba(0,0,0,.10)"}}>
          {/* Browser bar */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex gap-1.5">
              {["#fca5a5","#fcd34d","#86efac"].map((c,i)=>(
                <div key={i} className="w-3 h-3 rounded-full" style={{background:c}}/>
              ))}
            </div>
            <div className="flex-1 rounded-md h-6 flex items-center px-3 mx-3" style={{background:"var(--bg)", border:"1px solid var(--border)"}}>
              <span className="text-[11px]" style={{color:"var(--text-3)"}}>contentbloom.vercel.app/dashboard</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="md:col-span-2 rounded-xl p-5" style={{background:"var(--bg)", border:"1px solid var(--border)"}}>
              <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{color:"var(--accent)"}}>
                Published today
              </div>
              <div className="text-sm font-semibold leading-snug mb-2" style={{color:"var(--text-1)"}}>
                10 Best Yoga Mats for Home Practice in 2026 (Tested & Ranked)
              </div>
              <div className="text-xs leading-relaxed mb-4" style={{color:"var(--text-2)"}}>
                Looking for the perfect yoga mat? We tested 47 options so you don&apos;t have to. Here&apos;s what actually works...
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full" style={{color:"var(--accent)", background:"var(--accent-lt)"}}>SEO Score: 94</span>
                <span className="text-[11px]" style={{color:"var(--text-3)"}}>1,240 words</span>
                <span className="text-[11px]" style={{color:"var(--text-3)"}}>↗ Ranking: #3</span>
              </div>
            </div>
            <div className="flex flex-row md:flex-col gap-3">
              {[{l:"Organic traffic", v:"+340%", s:"vs last month"},{l:"Articles live", v:"87", s:"this quarter"}].map((x,i)=>(
                <div key={i} className="flex-1 rounded-xl p-4" style={{background:"var(--bg)", border:"1px solid var(--border)"}}>
                  <div className="text-[11px] mb-1" style={{color:"var(--text-3)"}}>{x.l}</div>
                  <div className="text-xl font-bold" style={{color: i===0 ? "var(--accent)" : "var(--text-1)"}}>{x.v}</div>
                  <div className="text-[11px]" style={{color:"var(--text-3)"}}>{x.s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── LOGO BAR ──────────────────────────────────────────────────────────────────

function LogoBar() {
  const items = ["Shopify","WooCommerce","BigCommerce","Wix","Squarespace","Shopify Plus","Etsy","PrestaShop",
                 "Shopify","WooCommerce","BigCommerce","Wix","Squarespace","Shopify Plus","Etsy","PrestaShop"];
  return (
    <section className="py-6 overflow-hidden divider">
      <p className="text-center text-[11px] tracking-[.12em] uppercase mb-5" style={{color:"var(--text-3)"}}>
        Works with every major e-commerce platform
      </p>
      <div className="flex scroll-l w-max gap-14">
        {items.map((p,i)=>(
          <span key={i} className="text-sm font-semibold whitespace-nowrap" style={{color:"var(--text-3)"}}>
            {p}
          </span>
        ))}
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ──────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {icon:<Globe size={18}/>, n:"01", title:"Connect your store", desc:"Link your Shopify store in 30 seconds. We scan your products and niche to build a content strategy tailored to your audience."},
    {icon:<Zap size={18}/>, n:"02", title:"AI writes daily", desc:"Every day our AI researches trending keywords, writes a long-form SEO article, and publishes it automatically."},
    {icon:<TrendingUp size={18}/>, n:"03", title:"Organic traffic grows", desc:"Articles start ranking in 4–8 weeks. Content accumulates into compounding traffic that brings customers for years."},
  ];
  return (
    <section id="how-it-works" className="py-28 px-6 divider" style={{background:"var(--bg)"}}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="sec-label mb-3">How it works</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{color:"var(--text-1)", lineHeight:1.1}}>
            Set it up once,<br />watch traffic grow
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {steps.map((s,i)=>(
            <div key={i} className="card-sm card-lift p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:"var(--accent-lt)", color:"var(--accent)"}}>
                  {s.icon}
                </div>
                <span className="text-4xl font-bold tabular-nums" style={{color:"var(--border-md)"}}>{s.n}</span>
              </div>
              <h3 className="text-lg font-bold mb-3" style={{color:"var(--text-1)"}}>{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{color:"var(--text-2)"}}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── STATS ─────────────────────────────────────────────────────────────────────

function Stats() {
  const s=[
    {v:"340%", l:"Average traffic\nincrease in 90 days"},
    {v:"€0.08", l:"Cost per article vs\n€300+ with agencies"},
    {v:"500+", l:"Shopify stores already\ngrowing with us"},
    {v:"4–8 wks", l:"Average time to\nfirst Google ranking"},
  ];
  return (
    <section className="py-20 px-6 divider" style={{background:"var(--bg-warm)"}}>
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
        {s.map((x,i)=>(
          <div key={i} className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-2" style={{color:"var(--text-1)"}}>{x.v}</div>
            <div className="text-[13px] leading-relaxed whitespace-pre-line" style={{color:"var(--text-2)"}}>{x.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── PRICING ───────────────────────────────────────────────────────────────────

function Pricing() {
  const plans = [
    {name:"Starter", price:"€49", freq:"1 article / day", desc:"Perfect for new stores starting content marketing",
      features:["30 SEO articles per month","Shopify auto-publish","Keyword research included","Meta descriptions & tags","1 revision per article","Email support"], pop:false},
    {name:"Growth",  price:"€99", freq:"3 articles / day", desc:"For established stores ready to dominate search",
      features:["90 SEO articles per month","Shopify auto-publish","Advanced keyword clustering","Internal linking strategy","Unlimited revisions","Priority support","Monthly performance report"], pop:true},
    {name:"Scale",   price:"€149", freq:"5 articles / day", desc:"Maximum velocity for high-growth brands",
      features:["150 SEO articles per month","Shopify auto-publish","Competitor gap analysis","Topic cluster strategy","Unlimited revisions","Dedicated account manager","Weekly performance calls"], pop:false},
  ];
  return (
    <section id="pricing" className="py-28 px-6 divider" style={{background:"var(--bg)"}}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="sec-label mb-3">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{color:"var(--text-1)", lineHeight:1.1}}>
            Simple plans<br />for serious growth
          </h2>
          <p className="text-lg" style={{color:"var(--text-2)"}}>Cancel anytime. Start with 2 free articles.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((p,i)=>(
            <div key={i} className={`card card-lift flex flex-col p-8 ${p.pop?"plan-pop":""}`} style={{boxShadow: p.pop ? "0 8px 30px rgba(0,0,0,.12)" : undefined}}>
              {p.pop && (
                <div className="text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full inline-block w-fit mb-5"
                  style={{color:"var(--accent)", background:"var(--accent-lt)"}}>
                  Most popular
                </div>
              )}
              <div className="text-sm font-medium mb-1" style={{color:"var(--text-2)"}}>{p.name}</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold" style={{color:"var(--text-1)"}}>{p.price}</span>
                <span className="text-sm" style={{color:"var(--text-3)"}}>/mo</span>
              </div>
              <div className="text-[12px] font-semibold mb-3" style={{color:"var(--accent)"}}>{p.freq}</div>
              <p className="text-[13px] leading-relaxed mb-7" style={{color:"var(--text-2)"}}>{p.desc}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {p.features.map((f,j)=>(
                  <li key={j} className="flex items-start gap-2.5 text-[13px]" style={{color:"var(--text-1)"}}>
                    <Check size={13} style={{color:"var(--accent)", marginTop:2, flexShrink:0}} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className={p.pop ? "btn-primary justify-center" : "btn-outline justify-center"}>
                Start Free Trial
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-[12px] mt-7" style={{color:"var(--text-3)"}}>
          All plans start with 2 free articles. No credit card required.
        </p>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS ──────────────────────────────────────────────────────────────

function Testimonials() {
  const t=[
    {q:"We went from zero blog posts to ranking page 1 for 12 keywords in 3 months. ContentBloom is the best €99 we spend every month.", n:"Maria T.", r:"Founder, FitnessPro Store", i:"M"},
    {q:"I was skeptical about AI content but the articles are genuinely good. Our organic traffic is up 280% and we haven't touched the blog ourselves.", n:"James K.", r:"Owner, The Outdoor Co.", i:"J"},
    {q:"The free articles they sent blew me away. Signed up immediately. It's like having a full-time SEO writer for less than €2 a day.", n:"Sophie L.", r:"Director, Luxe Beauty", i:"S"},
  ];
  return (
    <section className="py-28 px-6 divider" style={{background:"var(--bg-warm)"}}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="sec-label mb-3">Testimonials</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{color:"var(--text-1)", lineHeight:1.1}}>
            Stores growing with<br />ContentBloom
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {t.map((x,i)=>(
            <div key={i} className="card card-lift flex flex-col p-8" style={{boxShadow:"0 2px 12px rgba(0,0,0,.06)"}}>
              <div className="flex gap-0.5 mb-6">
                {[...Array(5)].map((_,j)=><Star key={j} size={13} style={{fill:"var(--accent)", color:"var(--accent)"}}/>)}
              </div>
              <p className="text-[14px] leading-relaxed flex-1 mb-8" style={{color:"var(--text-1)"}}>&ldquo;{x.q}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{background:"var(--accent-lt)", color:"var(--accent)"}}>{x.i}</div>
                <div>
                  <div className="text-sm font-semibold" style={{color:"var(--text-1)"}}>{x.n}</div>
                  <div className="text-[12px]" style={{color:"var(--text-3)"}}>{x.r}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ───────────────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="px-6 py-28 divider" style={{background:"var(--bg)"}}>
      <div className="max-w-6xl mx-auto">
        <div className="card text-center p-16 relative overflow-hidden" style={{boxShadow:"0 8px 40px rgba(0,0,0,.08)"}}>
          <div className="absolute inset-0 pointer-events-none" style={{background:"radial-gradient(ellipse at 50% -20%, rgba(22,163,74,.06) 0%, transparent 60%)"}} />
          <div className="relative">
            <p className="sec-label mb-4 mx-auto w-fit">Get started today</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4" style={{color:"var(--text-1)", lineHeight:1.1}}>
              Ready to grow your store&apos;s<br className="hidden md:block" /> organic traffic?
            </h2>
            <p className="text-lg max-w-md mx-auto mb-10" style={{color:"var(--text-2)"}}>
              Join 500+ Shopify stores getting daily SEO content. Start with 2 free articles.
            </p>
            <Link href="/signup" className="btn-primary text-[15px] px-7 py-3.5 mx-auto">
              Get 2 Free Articles <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="py-10 px-6 divider" style={{background:"var(--bg)"}}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{background:"var(--text-1)"}}>
            <Sparkles size={11} className="text-white" />
          </div>
          <span className="font-bold text-sm" style={{color:"var(--text-1)"}}>ContentBloom</span>
        </Link>
        <div className="flex items-center gap-7 text-[13px]" style={{color:"var(--text-3)"}}>
          <Link href="#" className="hover:opacity-70 transition-opacity">Privacy</Link>
          <Link href="#" className="hover:opacity-70 transition-opacity">Terms</Link>
          <Link href="mailto:hello@bloomcontent.site" className="hover:opacity-70 transition-opacity">Contact</Link>
        </div>
        <p className="text-[12px]" style={{color:"var(--text-3)"}}>© 2026 ContentBloom. All rights reserved.</p>
      </div>
    </footer>
  );
}

// ─── PAGE ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main style={{background:"var(--bg)"}}>
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
