import Link from "next/link";
import Image from "next/image";

export const metadata = { title: "Terms of Service — BloomContent" };

export default function Terms() {
  return (
    <>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, height: 60, background: "rgba(249,248,248,.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)", zIndex: 100, display: "flex", alignItems: "center", padding: "0 24px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <Image src="/rocket.svg" alt="BloomContent" width={24} height={24} style={{ imageRendering: "pixelated" }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--t1)" }}>BloomContent</span>
        </Link>
      </nav>
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "88px 24px 80px" }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: "var(--t1)", letterSpacing: "-0.03em", marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ fontSize: 13, color: "var(--t3)", marginBottom: 40 }}>Last updated: February 2026</p>

        {[
          ["1. Service Description", "BloomContent provides AI-generated SEO blog content for Shopify stores. By subscribing, you agree to these terms."],
          ["2. Subscriptions & Billing", "Plans are billed monthly. You may cancel at any time from your account dashboard. Cancellation takes effect at the end of the current billing period. We do not offer refunds for partial months."],
          ["3. Free Trial", "New customers receive 2 free articles before any payment is required. No credit card is needed for the free trial."],
          ["4. Content Ownership", "All articles generated for your store become your property upon delivery. You may publish, modify, or repurpose them freely."],
          ["5. Content Quality", "We aim to produce high-quality, accurate SEO content. We offer revisions on any article that doesn't meet your expectations. We are not liable for any SEO results, as rankings depend on many factors outside our control."],
          ["6. Acceptable Use", "You may not use BloomContent to generate content that is illegal, defamatory, or violates third-party intellectual property rights."],
          ["7. Service Availability", "We aim for 99% uptime but do not guarantee uninterrupted service. We are not liable for losses arising from service downtime."],
          ["8. Termination", "We reserve the right to suspend or terminate accounts that violate these terms."],
          ["9. Governing Law", "These terms are governed by the laws of Spain. Disputes shall be resolved in the courts of Barcelona."],
          ["10. Contact", "Questions about these terms? Use our contact form at bloomcontent.site/contact."],
        ].map(([title, body]) => (
          <div key={title as string} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--t1)", marginBottom: 8 }}>{title}</h2>
            <p style={{ fontSize: 15, color: "var(--t2)", lineHeight: 1.75 }}>{body}</p>
          </div>
        ))}
      </main>
    </>
  );
}
