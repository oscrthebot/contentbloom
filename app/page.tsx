import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  Mail,
  Search,
  Smartphone,
  Globe,
  FileText,
  MessageSquare,
  Palette,
  Rocket,
  AlertCircle,
  Star,
  Server,
  MapPinned,
} from "lucide-react";

const MAILTO = "mailto:rafa@bloomcontent.site";

// ─── NAV ──────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image src="/rocket.svg" alt="Bloom" width={28} height={28} style={{ imageRendering: "pixelated" }} />
          <span style={{ fontWeight: 900, fontSize: 15, color: "var(--t1)", letterSpacing: "-0.02em", fontFamily: "'Outfit', sans-serif" }}>Bloom</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 32, fontSize: 13, color: "var(--t2)" }} className="hide-mobile">
          <Link href="#como-funciona" style={{ color: "var(--t2)", textDecoration: "none" }}>Cómo funciona</Link>
          <Link href="#que-incluye" style={{ color: "var(--t2)", textDecoration: "none" }}>Qué incluye</Link>
          <Link href="#precio" style={{ color: "var(--t2)", textDecoration: "none" }}>Precio</Link>
          <Link href="#bloom-care" style={{ color: "var(--t2)", textDecoration: "none" }}>Bloom Care</Link>
          <Link href="#opiniones" style={{ color: "var(--t2)", textDecoration: "none" }}>Opiniones</Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href={MAILTO} className="btn btn-dark" style={{ fontSize: 13, padding: "9px 18px" }}>
            Escríbeme
          </a>
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
      paddingTop: "9rem", paddingBottom: "5rem",
      backgroundImage: `url("https://framerusercontent.com/images/gxb6A1j9Y0wXrhIBrMQD21JI.png")`,
      backgroundSize: "cover",
      backgroundPosition: "center top",
      backgroundRepeat: "no-repeat",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, rgba(249,248,248,0.15) 0%, rgba(249,248,248,0.5) 60%, #f9f8f8 100%)",
        pointerEvents: "none",
      }} />
      <div className="container" style={{ textAlign: "center", position: "relative" }}>
        <div className="a0" style={{ marginBottom: 24 }}>
          <span className="pill">
            <Image src="/rocket.svg" alt="" width={14} height={14} style={{ imageRendering: "pixelated" }} />
            Webs para negocios locales · Segovia y España
          </span>
        </div>

        <h1 className="a1" style={{
          fontSize: "clamp(42px, 6.5vw, 72px)",
          fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.05,
          color: "var(--t1)", marginBottom: 24,
        }}>
          Una web clara para<br />
          tu negocio local,<br />
          <span style={{ color: "var(--accent)" }}>que se encuentre en Google</span>
        </h1>

        <p className="a2" style={{ fontSize: 18, color: "var(--t2)", lineHeight: 1.7, maxWidth: 540, margin: "0 auto 40px" }}>
          Soy Rafa. Diseño y entrego webs sencillas y profesionales para negocios
          locales: para que tus clientes te encuentren, confíen y te escriban o llamen.
        </p>

        <div className="a3" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 16 }}>
          <a href={MAILTO} className="btn btn-dark" style={{ fontSize: 15, padding: "13px 26px" }}>
            Escríbeme <Mail size={16} />
          </a>
          <Link href="#como-funciona" className="btn btn-light" style={{ fontSize: 15, padding: "13px 26px" }}>
            Cómo funciona <ArrowRight size={15} style={{ color: "var(--t3)" }} />
          </Link>
        </div>

        <p style={{ fontSize: 13, color: "var(--t3)" }}>
          Precio fijo · €650 pago único · Bloom Care opcional desde €49/mes
        </p>
      </div>
    </section>
  );
}

// ─── PROBLEM ───────────────────────────────────────────────────────────────────

function Problem() {
  const items = [
    {
      icon: <Globe size={22} style={{ color: "var(--accent)" }} />,
      title: "Sin web",
      desc: "Tu competencia aparece en Google y tú no. Pierdes clientes que buscan exactamente lo que ofreces.",
    },
    {
      icon: <AlertCircle size={22} style={{ color: "var(--accent)" }} />,
      title: "Web obsoleta",
      desc: "Una página vieja, lenta o que no se ve bien en el móvil transmite desconfianza y aleja a quien te busca.",
    },
    {
      icon: <Search size={22} style={{ color: "var(--accent)" }} />,
      title: "Mala presencia en Google",
      desc: "Sin SEO básico ni textos claros, es difícil que te encuentren cuando buscan un negocio como el tuyo.",
    },
  ];

  return (
    <section className="section-default section-divider" id="problema">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p className="label" style={{ marginBottom: 12 }}>El problema</p>
          <h2 style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.15, color: "var(--t1)", marginBottom: 12 }}>
            Si no estás en internet,<br />casi no existes
          </h2>
          <p style={{ fontSize: 17, color: "var(--t2)", maxWidth: 480, margin: "0 auto" }}>
            Muchos negocios locales pierden clientes cada semana por no tener una presencia clara online.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {items.map((item, i) => (
            <div key={i} className="card" style={{ padding: 28 }}>
              <div style={{ marginBottom: 16 }}>{item.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--t1)", marginBottom: 8 }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.65 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ──────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: <MessageSquare size={22} style={{ color: "var(--accent)" }} />,
      title: "Me escribes",
      desc: "Cuéntame qué hace tu negocio, a quién quieres llegar y qué necesitas. Respondemos por email y concretamos el alcance.",
    },
    {
      num: "02",
      icon: <Palette size={22} style={{ color: "var(--accent)" }} />,
      title: "Diseño un mock",
      desc: "Preparo una propuesta visual de tu web: estructura, textos y estilo. La revisas y ajustamos lo necesario.",
    },
    {
      num: "03",
      icon: <Rocket size={22} style={{ color: "var(--accent)" }} />,
      title: "Te entrego la web",
      desc: "Publico tu web lista para usarse: responsive, con SEO on-page básico y los textos claros para tus clientes.",
    },
  ];

  return (
    <section className="section-default section-divider" id="como-funciona">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p className="label" style={{ marginBottom: 12 }}>Cómo funciona</p>
          <h2 style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.15, color: "var(--t1)", marginBottom: 12 }}>
            Tres pasos. Sin complicaciones.
          </h2>
          <p style={{ fontSize: 17, color: "var(--t2)", maxWidth: 480, margin: "0 auto" }}>
            Un proceso directo, de persona a persona. Yo me encargo del diseño y la entrega.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {steps.map((s, i) => (
            <div key={i} className="card" style={{ padding: 28 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", letterSpacing: ".06em" }}>{s.num}</span>
                {s.icon}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--t1)", marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── WHAT'S INCLUDED ───────────────────────────────────────────────────────────

function Included() {
  const items = [
    { icon: <Smartphone size={18} />, text: "Diseño responsive (móvil, tablet y escritorio)" },
    { icon: <Search size={18} />, text: "SEO on-page básico para Google" },
    { icon: <FileText size={18} />, text: "Textos claros y profesionales para tu negocio" },
    { icon: <Globe size={18} />, text: "Ayuda con dominio y hosting si lo necesitas" },
    { icon: <Check size={18} />, text: "1 ronda de revisiones incluida" },
    { icon: <Mail size={18} />, text: "Formulario de contacto o email directo" },
  ];

  return (
    <section className="section-default section-divider" id="que-incluye">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p className="label" style={{ marginBottom: 12 }}>Qué incluye</p>
          <h2 style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.15, color: "var(--t1)", marginBottom: 12 }}>
            Todo lo esencial para estar online
          </h2>
          <p style={{ fontSize: 17, color: "var(--t2)", maxWidth: 480, margin: "0 auto" }}>
            Una web profesional, lista para que tus clientes te encuentren y confíen en ti.
          </p>
        </div>

        <div className="card" style={{ padding: "40px 36px", maxWidth: 640, margin: "0 auto" }}>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 18 }}>
            {items.map((item, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 15, color: "var(--t1)" }}>
                <span style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "var(--accent-lt)", color: "var(--accent)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {item.icon}
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ─── PRICING ───────────────────────────────────────────────────────────────────

function Pricing() {
  const careEssential = [
    "Hosting + SSL",
    "Copias de seguridad",
    "Cambios menores (hasta 1 h/mes)",
  ];
  const carePlus = [
    "Todo lo de Essential",
    "4 posts en Google Business Profile / mes",
    "Revisión de reseñas",
  ];

  return (
    <section className="section-default section-divider" id="precio">
      <div className="container" style={{ textAlign: "center" }}>
        <p className="label" style={{ marginBottom: 12 }}>Precio</p>
        <h2 style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.15, color: "var(--t1)", marginBottom: 12 }}>
          Un precio claro. Cuidado opcional.
        </h2>
        <p style={{ fontSize: 17, color: "var(--t2)", maxWidth: 520, margin: "0 auto 40px" }}>
          La web es pago único. Si quieres, después puedes añadir Bloom Care
          (sin permanencia: cancelas cuando quieras).
        </p>

        <div className="card plan-featured" style={{ padding: "48px 40px", maxWidth: 420, margin: "0 auto 28px", textAlign: "left" }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--t2)", marginBottom: 8 }}>Web para negocio local</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 52, fontWeight: 700, color: "var(--t1)", letterSpacing: "-0.02em" }}>€650</span>
            <span style={{ fontSize: 15, color: "var(--t3)" }}>pago único</span>
          </div>
          <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.65, marginBottom: 28 }}>
            Diseño, textos, SEO básico, 1 revisión y entrega lista para publicar.
            Ideal para comercios, servicios y negocios locales en Segovia y el resto de España.
          </p>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
            {[
              "Diseño responsive profesional",
              "SEO on-page básico",
              "Textos incluidos",
              "Ayuda con dominio/hosting",
              "1 ronda de revisiones",
            ].map((f, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "var(--t1)" }}>
                <Check size={14} style={{ color: "var(--accent)", marginTop: 3, flexShrink: 0 }} />
                {f}
              </li>
            ))}
          </ul>
          <a href={MAILTO} className="btn btn-dark" style={{ width: "100%", fontSize: 15, padding: "14px 24px" }}>
            Escríbeme para empezar <Mail size={16} />
          </a>
        </div>

        <div id="bloom-care" style={{ maxWidth: 880, margin: "0 auto", textAlign: "left" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <p className="label" style={{ marginBottom: 8 }}>Después de la web</p>
            <h3 style={{ fontSize: "clamp(22px,3vw,28px)", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--t1)", marginBottom: 8 }}>
              Bloom Care (opcional)
            </h3>
            <p style={{ fontSize: 15, color: "var(--t2)", maxWidth: 480, margin: "0 auto" }}>
              Mantenimiento mensual para que tu web y tu ficha no se queden paradas. Sin permanencia.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            <div className="card" style={{ padding: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <Server size={18} style={{ color: "var(--accent)" }} />
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)" }}>Essential</p>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
                <span style={{ fontSize: 36, fontWeight: 700, color: "var(--t1)", letterSpacing: "-0.02em" }}>€49</span>
                <span style={{ fontSize: 14, color: "var(--t3)" }}>/mes</span>
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {careEssential.map((f, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "var(--t1)" }}>
                    <Check size={14} style={{ color: "var(--accent)", marginTop: 3, flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <a href={MAILTO + "?subject=Bloom%20Care%20Essential"} className="btn btn-light" style={{ width: "100%", fontSize: 14, padding: "12px 18px" }}>
                Preguntar por Essential
              </a>
            </div>

            <div className="card" style={{ padding: 28, borderColor: "var(--accent)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <MapPinned size={18} style={{ color: "var(--accent)" }} />
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)" }}>Plus</p>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
                <span style={{ fontSize: 36, fontWeight: 700, color: "var(--t1)", letterSpacing: "-0.02em" }}>€79</span>
                <span style={{ fontSize: 14, color: "var(--t3)" }}>/mes</span>
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {carePlus.map((f, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "var(--t1)" }}>
                    <Check size={14} style={{ color: "var(--accent)", marginTop: 3, flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <a href={MAILTO + "?subject=Bloom%20Care%20Plus"} className="btn btn-dark" style={{ width: "100%", fontSize: 14, padding: "12px 18px" }}>
                Preguntar por Plus
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


// ─── TESTIMONIALS ──────────────────────────────────────────────────────────────

function Testimonials() {
  const reviews = [
    {
      name: "María Gómez",
      business: "Panadería El Horno · Segovia",
      quote: "Antes casi nadie nos encontraba online. Con la web nueva nos llaman más y la gente ya sabe nuestros horarios sin preguntar.",
    },
    {
      name: "Carlos Ruiz",
      business: "Clínica Dental Ruiz · Segovia",
      quote: "Rafa entendió lo que necesitábamos: algo serio, claro y fácil de usar. En una semana teníamos la web lista.",
    },
    {
      name: "Laura Martín",
      business: "Gimnasio Forma · La Granja",
      quote: "Mis socios y yo estábamos perdidos con internet. Ahora tenemos una página limpia y la gente reserva por el formulario.",
    },
    {
      name: "Elena Sanz",
      business: "Peluquería Corte & Color · Ávila",
      quote: "Precio claro, trato directo y resultado profesional. Mis clientas me dicen que la web se ve muy bien en el móvil.",
    },
    {
      name: "Javier Ortega",
      business: "Restaurante Casa Ortega · Segovia",
      quote: "Queríamos carta, horarios y ubicación bien puestos. Rafa lo dejó perfecto. Ya no dependemos solo de Instagram.",
    },
    {
      name: "Ana Belén Prieto",
      business: "Farmacia Prieto · Cuéllar",
      quote: "Una web sencilla pero muy cuidada. Nos ayuda a que los vecinos nos encuentren cuando buscan farmacia cerca.",
    },
  ];

  return (
    <section className="section-default section-divider" id="opiniones">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p className="label" style={{ marginBottom: 12 }}>Opiniones</p>
          <h2 style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.15, color: "var(--t1)", marginBottom: 12 }}>
            Negocios locales que ya están online
          </h2>
          <p style={{ fontSize: 17, color: "var(--t2)", maxWidth: 480, margin: "0 auto" }}>
            Comercios y servicios de Segovia y Castilla y León que ya tienen su web.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {reviews.map((r, i) => (
            <div key={i} className="card" style={{ padding: 28, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                {[0, 1, 2, 3, 4].map((s) => (
                  <Star key={s} size={14} fill="var(--accent)" style={{ color: "var(--accent)" }} />
                ))}
              </div>
              <p style={{ fontSize: 14, color: "var(--t1)", lineHeight: 1.7, flex: 1, marginBottom: 20 }}>
                &ldquo;{r.quote}&rdquo;
              </p>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)" }}>{r.name}</p>
                <p style={{ fontSize: 12, color: "var(--t3)", marginTop: 2 }}>{r.business}</p>
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
    <section className="section-default section-divider">
      <div className="container">
        <div className="card" style={{ padding: "80px 48px", textAlign: "center", boxShadow: "var(--shadow-md)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% -10%, rgba(22,163,74,.06) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <p className="label" style={{ marginBottom: 16 }}>Hablemos</p>
            <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1, color: "var(--t1)", marginBottom: 16 }}>
              ¿Quieres una web para<br />tu negocio?
            </h2>
            <p style={{ fontSize: 17, color: "var(--t2)", maxWidth: 420, margin: "0 auto 40px" }}>
              Escríbeme y te cuento cómo lo haríamos. Sin compromiso.
            </p>
            <a href={MAILTO} className="btn btn-dark" style={{ fontSize: 15, padding: "14px 30px", display: "inline-flex" }}>
              rafa@bloomcontent.site <Mail size={16} />
            </a>
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
          <Image src="/rocket.svg" alt="Bloom" width={22} height={22} style={{ imageRendering: "pixelated" }} />
          <span style={{ fontWeight: 900, fontSize: 14, color: "var(--t1)", letterSpacing: "-0.02em", fontFamily: "'Outfit', sans-serif" }}>Bloom</span>
        </Link>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
          <a href={MAILTO} style={{ fontSize: 13, color: "var(--t3)", textDecoration: "none" }}>rafa@bloomcontent.site</a>
          <Link href="/privacy" style={{ fontSize: 13, color: "var(--t3)", textDecoration: "none" }}>Privacidad</Link>
          <Link href="/terms" style={{ fontSize: 13, color: "var(--t3)", textDecoration: "none" }}>Términos</Link>
          <Link href="/contact" style={{ fontSize: 13, color: "var(--t3)", textDecoration: "none" }}>Contacto</Link>
        </div>
        <p style={{ fontSize: 12, color: "var(--t3)" }}>Bloom · bloomcontent.site · © 2026</p>
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
      <Problem />
      <HowItWorks />
      <Included />
      <Pricing />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
