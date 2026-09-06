import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  Mail,
  Search,
  FileText,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Bloom Content for Shopify — 1 post/semana · €99/mes",
  description:
    "Keywords + 1 artículo de blog a la semana para tiendas Shopify con poco o ningún contenido. €99/mes, sin permanencia. rafa@bloomcontent.site",
  openGraph: {
    title: "Bloom Content for Shopify — €99/mes",
    description:
      "KW research + 1 post/semana para tiendas Shopify. Sin permanencia.",
    url: "https://bloomcontent.site/shopify",
    siteName: "Bloom Content",
    type: "website",
    locale: "es_ES",
  },
};

const MAILTO =
  "mailto:rafa@bloomcontent.site?subject=Bloom%20Content%20for%20Shopify";

function Nav() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link
          href="/shopify"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <Image
            src="/rocket.svg"
            alt="Bloom"
            width={28}
            height={28}
            style={{ imageRendering: "pixelated" }}
          />
          <span
            style={{
              fontWeight: 900,
              fontSize: 15,
              color: "var(--t1)",
              letterSpacing: "-0.02em",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Bloom Content
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#96bf48",
              background: "rgba(150,191,72,.15)",
              padding: "3px 8px",
              borderRadius: 999,
            }}
          >
            for Shopify
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/"
            style={{ fontSize: 13, color: "var(--t3)", textDecoration: "none" }}
            className="hide-mobile"
          >
            Webs locales
          </Link>
          <a
            href={MAILTO}
            className="btn btn-dark"
            style={{ fontSize: 13, padding: "9px 18px" }}
          >
            Escríbeme
          </a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section
      style={{
        paddingTop: "9rem",
        paddingBottom: "4rem",
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(150,191,72,.12) 0%, transparent 55%)",
      }}
    >
      <div className="container" style={{ textAlign: "center" }}>
        <div style={{ marginBottom: 20 }}>
          <span className="pill">
            <ShoppingBag size={14} />
            Para tiendas Shopify · ES / EU
          </span>
        </div>
        <h1
          style={{
            fontSize: "clamp(36px, 5.5vw, 60px)",
            fontWeight: 800,
            letterSpacing: "-0.035em",
            lineHeight: 1.08,
            color: "var(--t1)",
            marginBottom: 20,
          }}
        >
          Tu tienda vende.
          <br />
          <span style={{ color: "var(--accent)" }}>Tu blog no escribe.</span>
        </h1>
        <p
          style={{
            fontSize: 18,
            color: "var(--t2)",
            lineHeight: 1.7,
            maxWidth: 520,
            margin: "0 auto 32px",
          }}
        >
          Elegimos keywords con intención comercial y te entregamos{" "}
          <strong style={{ color: "var(--t1)" }}>1 artículo a la semana</strong>{" "}
          listo para publicar en Shopify. Sin llamadas. Sin permanencia.
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <a
            href={MAILTO}
            className="btn btn-dark"
            style={{ fontSize: 15, padding: "13px 26px" }}
          >
            Empezar a €99/mes <Mail size={16} />
          </a>
          <Link
            href="#como"
            className="btn btn-light"
            style={{ fontSize: 15, padding: "13px 26px" }}
          >
            Cómo funciona <ArrowRight size={15} />
          </Link>
        </div>
        <p style={{ fontSize: 13, color: "var(--t3)" }}>
          €99/mes · 4 posts · KW research incluido · cancela cuando quieras
        </p>
      </div>
    </section>
  );
}

function Problem() {
  const items = [
    {
      title: "Ads caros, blog vacío",
      desc: "Pagáis clics y dejáis escapar búsquedas orgánicas que vuestros productos ya responden.",
    },
    {
      title: "Sin tiempo de escribir",
      desc: "Entre pedidos, stock y creatividades, el blog queda para “cuando haya hueco”.",
    },
    {
      title: "Posts genéricos = ruido",
      desc: "No hace falta volumen infinito: hace falta 1 pieza útil a la semana, bien apuntada.",
    },
  ];
  return (
    <section className="section-default section-divider">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p className="label" style={{ marginBottom: 12 }}>
            El hueco
          </p>
          <h2
            style={{
              fontSize: "clamp(26px,4vw,38px)",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              color: "var(--t1)",
            }}
          >
            Muchas Shopify viven de ads
            <br />y el blog está muerto
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 18,
          }}
        >
          {items.map((it, i) => (
            <div key={i} className="card" style={{ padding: 26 }}>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--t1)",
                  marginBottom: 8,
                }}
              >
                {it.title}
              </h3>
              <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.65 }}>
                {it.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function How() {
  const steps = [
    {
      num: "01",
      icon: <Search size={20} style={{ color: "var(--accent)" }} />,
      title: "Keywords",
      desc: "Elegimos búsquedas con intención cerca de vuestros productos y colecciones.",
    },
    {
      num: "02",
      icon: <FileText size={20} style={{ color: "var(--accent)" }} />,
      title: "1 post / semana",
      desc: "Artículo listo para el blog de Shopify: título, meta y enlaces internos sugeridos.",
    },
    {
      num: "03",
      icon: <Sparkles size={20} style={{ color: "var(--accent)" }} />,
      title: "Vosotros publicáis",
      desc: "Os lo mandamos por email. Si más adelante queréis que lo publiquemos nosotros, se habla aparte.",
    },
  ];
  return (
    <section className="section-default section-divider" id="como">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p className="label" style={{ marginBottom: 12 }}>
            Cómo funciona
          </p>
          <h2
            style={{
              fontSize: "clamp(26px,4vw,38px)",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              color: "var(--t1)",
            }}
          >
            Simple. Recurrente. Sin calls.
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 18,
          }}
        >
          {steps.map((s, i) => (
            <div key={i} className="card" style={{ padding: 26 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--accent)",
                  }}
                >
                  {s.num}
                </span>
                {s.icon}
              </div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--t1)",
                  marginBottom: 8,
                }}
              >
                {s.title}
              </h3>
              <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.65 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const includes = [
    "Keyword research mensual",
    "1 artículo / semana (4 al mes)",
    "Título + meta description",
    "Enlaces internos a colecciones/productos",
    "Entrega por email (listo para Shopify)",
    "Sin permanencia",
  ];
  return (
    <section className="section-default section-divider" id="precio">
      <div className="container" style={{ textAlign: "center" }}>
        <p className="label" style={{ marginBottom: 12 }}>
          Precio
        </p>
        <h2
          style={{
            fontSize: "clamp(26px,4vw,38px)",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            color: "var(--t1)",
            marginBottom: 12,
          }}
        >
          €99/mes. Sin letra pequeña.
        </h2>
        <p
          style={{
            fontSize: 16,
            color: "var(--t2)",
            maxWidth: 440,
            margin: "0 auto 36px",
          }}
        >
          Contenido recurrente para crecer en Google sin montar un equipo de
          content.
        </p>
        <div
          className="card plan-featured"
          style={{
            padding: "44px 36px",
            maxWidth: 420,
            margin: "0 auto",
            textAlign: "left",
          }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--t2)",
              marginBottom: 8,
            }}
          >
            Bloom Content · Shopify
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 6,
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontSize: 52,
                fontWeight: 700,
                color: "var(--t1)",
                letterSpacing: "-0.02em",
              }}
            >
              €99
            </span>
            <span style={{ fontSize: 15, color: "var(--t3)" }}>/mes</span>
          </div>
          <p
            style={{
              fontSize: 14,
              color: "var(--t2)",
              lineHeight: 1.65,
              marginBottom: 26,
            }}
          >
            Ideal si tenéis catálogo activo y el blog lleva meses parado (o
            nunca existió).
          </p>
          <ul
            style={{
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 28,
            }}
          >
            {includes.map((f, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  gap: 10,
                  fontSize: 14,
                  color: "var(--t1)",
                }}
              >
                <Check
                  size={14}
                  style={{ color: "var(--accent)", marginTop: 3, flexShrink: 0 }}
                />
                {f}
              </li>
            ))}
          </ul>
          <a
            href={MAILTO}
            className="btn btn-dark"
            style={{ width: "100%", fontSize: 15, padding: "14px 24px" }}
          >
            Escribir a Rafa <Mail size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="section-default section-divider">
      <div className="container">
        <div
          className="card"
          style={{ padding: "64px 40px", textAlign: "center" }}
        >
          <h2
            style={{
              fontSize: "clamp(24px,4vw,36px)",
              fontWeight: 700,
              color: "var(--t1)",
              marginBottom: 14,
            }}
          >
            ¿Queréis ver un artículo de muestra
            <br />
            para vuestra tienda?
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "var(--t2)",
              maxWidth: 420,
              margin: "0 auto 28px",
            }}
          >
            Enviadme la URL de la store. Os preparo un preview y, si encaja,
            empezamos a €99/mes.
          </p>
          <a
            href={MAILTO}
            className="btn btn-dark"
            style={{ fontSize: 15, padding: "14px 28px", display: "inline-flex" }}
          >
            rafa@bloomcontent.site
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        padding: "36px 0",
        background: "var(--bg)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <span style={{ fontSize: 13, color: "var(--t3)" }}>
          Bloom Content for Shopify · bloomcontent.site/shopify
        </span>
        <div style={{ display: "flex", gap: 20 }}>
          <Link href="/" style={{ fontSize: 13, color: "var(--t3)" }}>
            Webs locales
          </Link>
          <a href={MAILTO} style={{ fontSize: 13, color: "var(--t3)" }}>
            Contacto
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function ShopifyLandingPage() {
  return (
    <main style={{ background: "var(--bg)" }}>
      <Nav />
      <Hero />
      <Problem />
      <How />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
