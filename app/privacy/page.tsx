import Link from "next/link";
import Image from "next/image";

export const metadata = { title: "Privacy Policy — BloomContent" };

export default function Privacy() {
  return (
    <>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, height: 60, background: "rgba(249,248,248,.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)", zIndex: 100, display: "flex", alignItems: "center", padding: "0 24px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <Image src="/rocket.svg" alt="BloomContent" width={24} height={24} style={{ imageRendering: "pixelated" }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--t1)" }}>BloomContent</span>
        </Link>
      </nav>
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "88px 24px 80px" }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: "var(--t1)", letterSpacing: "-0.03em", marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ fontSize: 13, color: "var(--t3)", marginBottom: 40 }}>Last updated: February 2026</p>

        {[
          ["1. Who We Are", 'BloomContent (bloomcontent.site) is an AI-powered content service for Shopify stores. We generate and publish SEO blog articles on behalf of our customers. References to "we", "us" or "our" refer to BloomContent.'],
          ["2. What Data We Collect", "When you sign up or contact us, we collect your name, email address, and Shopify store URL. If you use our article preview pages, we collect the email you provide to unlock an article. We do not collect payment information directly — payments are processed by Stripe."],
          ["3. How We Use Your Data", "We use your data to provide the service (generating and publishing articles), to send you service-related communications, and to improve our product. We do not sell your data to third parties."],
          ["4. Cookies", "We use only essential cookies necessary to operate the service. We do not use advertising or tracking cookies."],
          ["5. Data Storage", "Your data is stored on servers within the EU (Convex, eu-west-1 region). We retain your data for as long as your account is active. You may request deletion at any time."],
          ["6. Your Rights", "Under GDPR, you have the right to access, correct, or delete your personal data. To exercise these rights, contact us at the address below."],
          ["7. Contact", "For privacy-related questions, use our contact form at bloomcontent.site/contact."],
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
