"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Star } from "lucide-react";

const REVIEWS = [
  { q: "We went from zero blog posts to ranking page 1 for 12 keywords in 3 months. The best €99 we spend every month.", n: "Maria T.", r: "Founder, FitnessPro Store", photo: "https://i.pravatar.cc/96?img=44" },
  { q: "I was skeptical about AI content but the articles are genuinely good. Our organic traffic is up 280% and we haven't touched the blog ourselves.", n: "James K.", r: "Owner, The Outdoor Co.", photo: "https://i.pravatar.cc/96?img=67" },
  { q: "BloomContent writes better product-focused SEO content than the agency we were paying €2,000/month for. Honestly embarrassing how good it is.", n: "Sophie L.", r: "Director, Luxe Beauty", photo: "https://i.pravatar.cc/96?img=5" },
  { q: "We went from page 5 to page 1 for our main keyword in 6 weeks. I didn't have to write a single word. Absolute game changer.", n: "Tom B.", r: "CEO, Nordic Gear Co.", photo: "https://i.pravatar.cc/96?img=12" },
  { q: "The time I used to spend briefing writers and editing drafts — that's all gone now. Articles go live every morning while I focus on the business.", n: "Laura M.", r: "Owner, Petal & Stitch", photo: "https://i.pravatar.cc/96?img=47" },
  { q: "Finally found something that actually moves the needle on organic. We're ranking for 40+ keywords we never bothered targeting before.", n: "Alex R.", r: "Co-founder, Vault Athletics", photo: "https://i.pravatar.cc/96?img=15" },
  { q: "ROI is insane. €49/month for content that brings in customers who would have cost €8–15 each via paid ads? Easy decision.", n: "Emma S.", r: "Founder, Glow & Go Skincare", photo: "https://i.pravatar.cc/96?img=56" },
  { q: "I was spending €800/month on a content agency. Switched to this for €99 and honestly the quality is better. No brainer.", n: "Carlos D.", r: "Owner, Mesa Home Store", photo: "https://i.pravatar.cc/96?img=33" },
];

export function TestimonialsCarousel() {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setActive(a => (a + 1) % REVIEWS.length), 4500);
  }

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function go(i: number) {
    setActive(i);
    startTimer();
  }

  return (
    <section className="section-warm section-divider">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p className="label" style={{ marginBottom: 12 }}>Testimonials</p>
          <h2 style={{ fontSize: "clamp(30px,4vw,48px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1, color: "var(--t1)" }}>
            Stores growing with<br />BloomContent
          </h2>
        </div>

        {/* Cards track */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <div style={{
            display: "flex",
            transition: "transform .5s cubic-bezier(.4,0,.2,1)",
            transform: `translateX(calc(-${active} * (100% / 3 + 16px)))`,
            gap: 24,
          }}>
            {REVIEWS.map((x, i) => (
              <div
                key={i}
                className="card"
                style={{
                  minWidth: "calc(33.33% - 16px)",
                  padding: "32px 28px",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "var(--shadow-sm)",
                  opacity: Math.abs(i - active) <= 2 ? 1 : 0.4,
                  transition: "opacity .4s",
                  flexShrink: 0,
                }}
              >
                <div style={{ display: "flex", gap: 2, marginBottom: 20 }}>
                  {[...Array(5)].map((_,j) => <Star key={j} size={13} style={{ fill:"var(--accent)", color:"var(--accent)" }} />)}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--t1)", flex: 1, marginBottom: 24 }}>&ldquo;{x.q}&rdquo;</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Image src={x.photo} alt={x.n} width={40} height={40} style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--t1)" }}>{x.n}</p>
                    <p style={{ fontSize: 12, color: "var(--t3)" }}>{x.r}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28 }}>
          {REVIEWS.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              style={{
                width: i === active ? 24 : 8,
                height: 8,
                borderRadius: 100,
                background: i === active ? "var(--accent)" : "var(--border-md)",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "width .3s, background .3s",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
