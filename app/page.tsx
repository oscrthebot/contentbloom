import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, ChevronRight, TrendingUp, Zap, Globe } from "lucide-react";
import { FeaturesSection } from "./features-section";
import { TestimonialsCarousel } from "./testimonials-carousel";

// ─── NAV ──────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image src="/rocket.svg" alt="BloomContent" width={28} height={28} style={{ imageRendering: "pixelated" }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--t1)", letterSpacing: "-0.01em" }}>BloomContent</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 32, fontSize: 13, color: "var(--t2)" }} className="hide-mobile">
          <Link href="#features"    style={{ color: "var(--t2)", textDecoration: "none" }}>Features</Link>
          <Link href="#how-it-works" style={{ color: "var(--t2)", textDecoration: "none" }}>How it works</Link>
          <Link href="#pricing"     style={{ color: "var(--t2)", textDecoration: "none" }}>Pricing</Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/login" className="hide-mobile" style={{ fontSize: 13, color: "var(--t2)", textDecoration: "none" }}>Log in</Link>
          <Link href="/signup" className="btn btn-dark" style={{ fontSize: 13, padding: "9px 18px" }}>Get 2 Free Articles</Link>
        </div>
      </div>
    </nav>
  );
}

// ─── HERO ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section style={{
      position: "relative",
      paddingTop: "9rem", paddingBottom: "4rem",
      backgroundImage: `url("https://framerusercontent.com/images/gxb6A1j9Y0wXrhIBrMQD21JI.png")`,
      backgroundSize: "cover",
      backgroundPosition: "center top",
      backgroundRepeat: "no-repeat",
    }}>
      {/* Fade to page background at the bottom */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, rgba(249,248,248,0.15) 0%, rgba(249,248,248,0.5) 60%, #f9f8f8 100%)",
        pointerEvents: "none",
      }} />
      <div className="container" style={{ textAlign: "center", position: "relative" }}>
        <div className="a0" style={{ marginBottom: 24 }}>
          <span className="pill">
            <Image src="/rocket.svg" alt="" width={14} height={14} style={{ imageRendering: "pixelated" }} />
            AI-Powered Content for E-commerce
          </span>
        </div>

        <h1 className="a1" style={{
          fontSize: "clamp(42px, 6.5vw, 80px)",
          fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.02,
          color: "var(--t1)", marginBottom: 24,
        }}>
          Your Shopify store<br />
          deserves a blog that<br />
          <span style={{ color: "var(--accent)" }}>actually ranks</span>
        </h1>

        <p className="a2" style={{ fontSize: 18, color: "var(--t2)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 40px" }}>
          We write daily SEO blog posts for your Shopify store — fully automated,
          Google-optimized, and published for you. While you focus on the business,
          we grow your organic traffic.
        </p>

        <div className="a3" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 20 }}>
          <Link href="/signup" className="btn btn-dark" style={{ fontSize: 15, padding: "13px 26px" }}>
            Get 2 Free Articles <ArrowRight size={16} />
          </Link>
          <Link href="#how-it-works" className="btn btn-light" style={{ fontSize: 15, padding: "13px 26px" }}>
            See How It Works <ChevronRight size={15} style={{ color: "var(--t3)" }} />
          </Link>
        </div>

        <p style={{ fontSize: 12, color: "var(--t3)" }}>
          No credit card required · Cancel anytime
        </p>
      </div>

      {/* Mockup */}
      <div className="container a3" style={{ marginTop: "3.5rem", position: "relative" }}>
        <div className="card afloat" style={{ padding: 28, boxShadow: "0 12px 48px rgba(0,0,0,.10)" }}>
          {/* Browser chrome */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {["#fca5a5","#fcd34d","#86efac"].map((c,i)=><div key={i} style={{ width:12, height:12, borderRadius:"50%", background:c }}/>)}
            </div>
            <div className="card-inner" style={{ flex: 1, height: 26, marginLeft: 8, display: "flex", alignItems: "center", padding: "0 12px" }}>
              <span style={{ fontSize: 11, color: "var(--t3)" }}>app.bloomcontent.site/dashboard</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
            <div className="card-inner" style={{ padding: 20 }}>
              <p className="label" style={{ marginBottom: 8 }}>Published today</p>
              <p style={{ fontWeight: 600, fontSize: 14, color: "var(--t1)", lineHeight: 1.4, marginBottom: 8 }}>
                10 Best Yoga Mats for Home Practice in 2026 (Tested & Ranked)
              </p>
              <p style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6, marginBottom: 16 }}>
                Looking for the perfect yoga mat? We tested 47 options so you don&apos;t have to...
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", background: "var(--accent-lt)", padding: "3px 10px", borderRadius: 100 }}>SEO Score: 94</span>
                <span style={{ fontSize: 11, color: "var(--t3)" }}>1,240 words</span>
                <span style={{ fontSize: 11, color: "var(--t3)" }}>↗ Ranking: #3</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[{ l:"Organic traffic", v:"+340%", green:true }, { l:"Articles live", v:"87", green:false }].map((x,i)=>(
                <div key={i} className="card-inner" style={{ padding: 16, flex: 1 }}>
                  <p style={{ fontSize: 11, color: "var(--t3)", marginBottom: 4 }}>{x.l}</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: x.green ? "var(--accent)" : "var(--t1)" }}>{x.v}</p>
                  <p style={{ fontSize: 11, color: "var(--t3)" }}>{i===0?"vs last month":"this quarter"}</p>
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
  const platforms = [
    { name: "Shopify",       icon: "shopify" },
    { name: "WooCommerce",   icon: "woocommerce" },
    { name: "BigCommerce",   icon: "bigcommerce" },
    { name: "Wix",           icon: "wix" },
    { name: "Squarespace",   icon: "squarespace" },
    { name: "Shopify Plus",  icon: "shopify" },
    { name: "Etsy",          icon: "etsy" },
    { name: "PrestaShop",    icon: "prestashop" },
  ];
  // Duplicate for seamless scroll
  const items = [...platforms, ...platforms];
  return (
    <section style={{ background: "var(--bg)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "28px 0", overflow: "hidden" }}>
      <p style={{ textAlign: "center", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--t3)", marginBottom: 20 }}>
        Works with every major e-commerce platform
      </p>
      <div className="ascroll" style={{ display: "flex", alignItems: "center", gap: 48, width: "max-content" }}>
        {items.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://cdn.simpleicons.org/${p.icon}/b0adac`}
              alt={p.name}
              width={18}
              height={18}
              style={{ opacity: 0.7 }}
            />
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--t3)" }}>{p.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ──────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    { icon:<Globe size={18}/>, n:"01", title:"Connect your store", desc:"Link your Shopify store in 30 seconds. We scan your products and niche to build a tailored content strategy." },
    { icon:<Zap size={18}/>, n:"02", title:"AI writes daily", desc:"Every day our AI researches trending keywords, writes a long-form SEO article, and publishes it automatically." },
    { icon:<TrendingUp size={18}/>, n:"03", title:"Organic traffic grows", desc:"Articles start ranking in 4–8 weeks. Content accumulates into compounding traffic that brings customers for years." },
  ];
  return (
    <section id="how-it-works" className="section-default section-divider">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <p className="label" style={{ marginBottom: 12 }}>How it works</p>
          <h2 style={{ fontSize: "clamp(30px,4vw,48px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1, color: "var(--t1)" }}>
            Set it up once,<br />watch traffic grow
          </h2>
        </div>
        <div className="grid-3">
          {steps.map((s, i) => (
            <div key={i} className="card" style={{ padding: "36px 32px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--accent-lt)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {s.icon}
                </div>
                <span style={{ fontSize: 40, fontWeight: 700, color: "var(--border-md)" }}>{s.n}</span>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--t1)", marginBottom: 12 }}>{s.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--t2)" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── STATS ─────────────────────────────────────────────────────────────────────

function Stats() {
  const stats = [
    { v:"340%",   l:"Average organic traffic\nincrease in 90 days" },
    { v:"€1.63",  l:"Per article on Starter plan —\nvs €50+ with agencies" },
    { v:"30/mo",  l:"SEO articles published\nautomatically every month" },
    { v:"4–8 wks",l:"Average time to\nfirst Google ranking" },
  ];
  return (
    <section className="section-warm section-divider">
      <div className="container">
        <div className="grid-4">
          {stats.map((x, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <p style={{ fontSize: "clamp(28px,3vw,42px)", fontWeight: 700, color: "var(--t1)", marginBottom: 8 }}>{x.v}</p>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--t2)", whiteSpace: "pre-line" }}>{x.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PRICING ───────────────────────────────────────────────────────────────────

function Pricing() {
  const plans = [
    { name:"Starter", price:"€49", perArticle:"€1.63/article", freq:"1 article / day", desc:"Perfect for new stores starting content marketing",
      features:["30 SEO articles per month","Keyword research included","Meta descriptions & tags","1 revision per article","Email support"], featured:false },
    { name:"Growth",  price:"€99", perArticle:"€1.10/article", freq:"3 articles / day", desc:"For established stores ready to dominate search",
      features:["90 SEO articles per month","Advanced keyword clustering","Internal linking strategy","Unlimited revisions","Priority support","Monthly performance report"], featured:true },
    { name:"Scale",  price:"€149", perArticle:"€0.99/article", freq:"5 articles / day", desc:"Maximum velocity for high-growth brands",
      features:["150 SEO articles per month","Competitor gap analysis","Topic cluster strategy","Unlimited revisions","Dedicated account manager","Weekly performance calls"], featured:false },
  ];
  return (
    <section id="pricing" className="section-default section-divider">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <p className="label" style={{ marginBottom: 12 }}>Pricing</p>
          <h2 style={{ fontSize: "clamp(30px,4vw,48px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1, color: "var(--t1)", marginBottom: 16 }}>
            Simple plans<br />for serious growth
          </h2>
          <p style={{ fontSize: 17, color: "var(--t2)" }}>Cancel anytime. Start with 2 free articles.</p>
        </div>

        <div className="grid-3">
          {plans.map((p, i) => (
            <div key={i} className={`card${p.featured ? " plan-featured" : ""}`} style={{ padding: "36px 32px", display: "flex", flexDirection: "column" }}>
              {p.featured && (
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--accent)", background: "var(--accent-lt)", padding: "4px 12px", borderRadius: 100, display: "inline-block", width: "fit-content", marginBottom: 20 }}>
                  Most popular
                </span>
              )}
              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--t2)", marginBottom: 4 }}>{p.name}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 44, fontWeight: 700, color: "var(--t1)", letterSpacing: "-0.02em" }}>{p.price}</span>
                <span style={{ fontSize: 14, color: "var(--t3)" }}>/mo</span>
              </div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", marginBottom: 2 }}>{p.freq}</p>
              <p style={{ fontSize: 11, color: "var(--t3)", marginBottom: 12 }}>{p.perArticle}</p>
              <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6, marginBottom: 28 }}>{p.desc}</p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12, marginBottom: 32, flex: 1 }}>
                {p.features.map((f, j) => (
                  <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "var(--t1)" }}>
                    <Check size={13} style={{ color: "var(--accent)", marginTop: 2, flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className={`btn ${p.featured ? "btn-dark" : "btn-light"}`} style={{ width: "100%" }}>
                Start Free Trial
              </Link>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "var(--t3)", marginTop: 28 }}>
          All plans start with 2 free articles. No credit card required.
        </p>
      </div>
    </section>
  );
}

// ─── CTA ───────────────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="section-default section-divider">
      <div className="container">
        <div className="card" style={{ padding: "80px 48px", textAlign: "center", boxShadow: "var(--shadow-md)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% -10%, rgba(22,163,74,.06) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <p className="label" style={{ marginBottom: 16 }}>Get started today</p>
            <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1, color: "var(--t1)", marginBottom: 16 }}>
              Ready to grow your store&apos;s<br />organic traffic?
            </h2>
            <p style={{ fontSize: 17, color: "var(--t2)", maxWidth: 420, margin: "0 auto 40px" }}>
              Daily SEO content for your Shopify store, fully automated. Start with 2 free articles.
            </p>
            <Link href="/signup" className="btn btn-dark" style={{ fontSize: 15, padding: "14px 30px", display: "inline-flex" }}>
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
    <footer style={{ background: "var(--bg)", borderTop: "1px solid var(--border)", padding: "40px 0" }}>
      <div className="container" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <Image src="/rocket.svg" alt="BloomContent" width={22} height={22} style={{ imageRendering: "pixelated" }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--t1)" }}>BloomContent</span>
        </Link>
        <div style={{ display: "flex", gap: 28 }}>
          {[["Privacy","/privacy"],["Terms","/terms"],["Contact","/contact"]].map(([l,href]) => (
            <Link key={l} href={href} style={{ fontSize: 13, color: "var(--t3)", textDecoration: "none" }}>{l}</Link>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "var(--t3)" }}>© 2026 BloomContent. All rights reserved.</p>
      </div>
    </footer>
  );
}

// ─── PAGE ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main style={{ background: "var(--bg)" }}>
      <Nav />
      <Hero />
      <LogoBar />
      <FeaturesSection />
      <HowItWorks />
      <Stats />
      <Pricing />
      <TestimonialsCarousel />
      <CTA />
      <Footer />
    </main>
  );
}
