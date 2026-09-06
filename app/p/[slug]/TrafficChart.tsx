"use client";

interface KeywordMetrics {
  monthlyVolume: number;
  relatedVolume: number;
  keyword: string;
  businessName: string;
  language?: string;
}

function formatNum(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return n.toString();
}

export function TrafficChart({ metrics }: { metrics: KeywordMetrics }) {
  const { monthlyVolume, relatedVolume, keyword, businessName, language } = metrics;
  const es = (language || "en").startsWith("es");

  const totalMonthlySearches = monthlyVolume + relatedVolume;

  // 12-month traffic ramp: articles compound, rankings improve over time
  const rampPct = [0, 0.01, 0.03, 0.07, 0.13, 0.22, 0.33, 0.44, 0.54, 0.62, 0.68, 0.73];
  // Conservative: ~4 posts/mo (Bloom €99 plan), not 1/day
  const monthlyTraffic = rampPct.map((pct) => Math.round(totalMonthlySearches * pct * 0.035));
  const cumulativeTraffic = monthlyTraffic.reduce<number[]>(
    (acc, v) => [...acc, (acc[acc.length - 1] || 0) + v],
    []
  );
  const cumulativeCustomers = cumulativeTraffic.map((t) => Math.round(t * 0.02));

  const totalCustomers12m = cumulativeCustomers[11];
  const totalTraffic12m = cumulativeTraffic[11];

  const chartW = 560;
  const chartH = 120;
  const pad = { top: 8, right: 8, bottom: 24, left: 36 };
  const innerW = chartW - pad.left - pad.right;
  const innerH = chartH - pad.top - pad.bottom;

  const maxVal = Math.max(...cumulativeTraffic, 1);
  const pts = cumulativeTraffic.map((v, i) => ({
    x: pad.left + (i / 11) * innerW,
    y: pad.top + innerH - (v / maxVal) * innerH,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${pts[11].x.toFixed(1)},${(pad.top + innerH).toFixed(1)} L${pts[0].x.toFixed(1)},${(pad.top + innerH).toFixed(1)} Z`;

  const months = es
    ? ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const copy = es
    ? {
        badge: "Oportunidad de tráfico — proyección 12 meses",
        introA: "personas/mes",
        introB: "buscan temas como",
        introC: "Así podría verse el tráfico orgánico para",
        introD: "con contenido SEO constante:",
        s1: "Búsquedas/mes",
        s1sub: "cluster de keyword",
        s2: "Visitas orgánicas (año 1)",
        s2sub: "acumulado, estimación conservadora",
        s3: "Clientes potenciales",
        s3sub: "con conversión 2%",
        chartLabel: "Visitas orgánicas acumuladas — proyección 12 meses",
        foot: "Proyección orientativa asumiendo ~4 artículos/mes, posiciones medias 5–8, CTR 3,5% y conversión visita→cliente 2%. Volúmenes de búsqueda aproximados (ES).",
      }
    : {
        badge: "Traffic opportunity — 12 month projection",
        introA: "people/month",
        introB: "search for topics like",
        introC: "Here's what consistent SEO content could mean for",
        introD: ":",
        s1: "Monthly searches",
        s1sub: "for your keyword cluster",
        s2: "Organic visitors (yr 1)",
        s2sub: "cumulative, conservative estimate",
        s3: "Potential customers",
        s3sub: "at 2% conversion rate",
        chartLabel: "Cumulative organic visitors — 12 month projection",
        foot: "Illustrative projection assumes ~4 articles/month, average ranking positions 5–8, 3.5% CTR, 2% visitor-to-customer conversion. Search volumes are approximate.",
      };

  return (
    <div style={{ background: "#fff", border: "1px solid rgb(227,225,225)", borderRadius: 16, padding: "28px 28px 20px", marginTop: 20 }}>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#16a34a", marginBottom: 6 }}>
          {copy.badge}
        </p>
        <p style={{ fontSize: 14, color: "#757372", lineHeight: 1.6 }}>
          <strong style={{ color: "#1a1615" }}>{formatNum(totalMonthlySearches)} {copy.introA}</strong> {copy.introB} &ldquo;{keyword}&rdquo;.{" "}
          {copy.introC} {businessName} {copy.introD}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
        {[
          { label: copy.s1, value: formatNum(totalMonthlySearches), sub: copy.s1sub, color: "#1a1615" },
          { label: copy.s2, value: formatNum(totalTraffic12m), sub: copy.s2sub, color: "#1a1615" },
          { label: copy.s3, value: formatNum(totalCustomers12m), sub: copy.s3sub, color: "#16a34a" },
        ].map((s, i) => (
          <div key={i} style={{ background: "rgb(240,234,229)", borderRadius: 12, padding: "16px 14px", textAlign: "center" }}>
            <p style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: "-0.02em", marginBottom: 2 }}>{s.value}</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#1a1615", marginBottom: 2 }}>{s.label}</p>
            <p style={{ fontSize: 10, color: "#b0adac", lineHeight: 1.4 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 8 }}>
        <p style={{ fontSize: 11, color: "#b0adac", marginBottom: 8 }}>{copy.chartLabel}</p>
        <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: "100%", display: "block" }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16a34a" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#16a34a" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0, 0.5, 1].map((pct, i) => (
            <text key={i} x={pad.left - 6} y={pad.top + innerH - pct * innerH + 4} textAnchor="end" fontSize="9" fill="#b0adac">
              {formatNum(Math.round(maxVal * pct))}
            </text>
          ))}
          {[0, 0.5, 1].map((pct, i) => (
            <line
              key={i}
              x1={pad.left}
              x2={pad.left + innerW}
              y1={pad.top + innerH - pct * innerH}
              y2={pad.top + innerH - pct * innerH}
              stroke="rgb(227,225,225)"
              strokeWidth="1"
            />
          ))}
          <path d={areaPath} fill="url(#areaGrad)" />
          <path d={linePath} fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {pts.map((pt, i) => (
            <circle key={i} cx={pt.x} cy={pt.y} r="3" fill="#fff" stroke="#16a34a" strokeWidth="1.5" />
          ))}
          {months.map((m, i) =>
            i % 3 === 0 ? (
              <text key={i} x={pad.left + (i / 11) * innerW} y={chartH - 4} textAnchor="middle" fontSize="9" fill="#b0adac">
                {m}
              </text>
            ) : null
          )}
        </svg>
      </div>

      <p style={{ fontSize: 11, color: "#b0adac", borderTop: "1px solid rgb(227,225,225)", paddingTop: 12, marginTop: 4 }}>
        {copy.foot}
      </p>
    </div>
  );
}
