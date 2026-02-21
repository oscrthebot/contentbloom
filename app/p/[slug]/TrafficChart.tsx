"use client";

interface KeywordMetrics {
  monthlyVolume: number;
  relatedVolume: number;
  keyword: string;
  businessName: string;
}

function formatNum(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return n.toString();
}

export function TrafficChart({ metrics }: { metrics: KeywordMetrics }) {
  const { monthlyVolume, relatedVolume, keyword, businessName } = metrics;

  const totalMonthlySearches = monthlyVolume + relatedVolume;

  // 12-month traffic ramp: articles compound, rankings improve over time
  // Month N = % of total potential traffic captured
  const rampPct = [0, 0.01, 0.03, 0.07, 0.13, 0.22, 0.33, 0.44, 0.54, 0.62, 0.68, 0.73];
  const monthlyTraffic = rampPct.map(pct => Math.round(totalMonthlySearches * pct * 0.035)); // 3.5% avg CTR
  const cumulativeTraffic = monthlyTraffic.reduce<number[]>((acc, v) => [...acc, (acc[acc.length - 1] || 0) + v], []);
  const cumulativeCustomers = cumulativeTraffic.map(t => Math.round(t * 0.02)); // 2% conversion

  const totalCustomers12m = cumulativeCustomers[11];
  const totalTraffic12m = cumulativeTraffic[11];
  const peakMonthly = monthlyTraffic[11];

  // SVG area chart
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

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <div style={{ background: "#fff", border: "1px solid rgb(227,225,225)", borderRadius: 16, padding: "28px 28px 20px", marginTop: 20 }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#16a34a", marginBottom: 6 }}>
          📊 Traffic opportunity — based on real search data
        </p>
        <p style={{ fontSize: 14, color: "#757372", lineHeight: 1.6 }}>
          <strong style={{ color: "#1a1615" }}>{formatNum(totalMonthlySearches)} people/month</strong> search for topics like &ldquo;{keyword}&rdquo;.
          Here&apos;s what consistent SEO content could mean for {businessName} over 12 months:
        </p>
      </div>

      {/* 3 key stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Monthly searches", value: formatNum(totalMonthlySearches), sub: "for your keyword cluster", color: "#1a1615" },
          { label: "Organic visitors (yr 1)", value: formatNum(totalTraffic12m), sub: "cumulative, conservative estimate", color: "#1a1615" },
          { label: "Potential customers", value: formatNum(totalCustomers12m), sub: "at 2% conversion rate", color: "#16a34a" },
        ].map((s, i) => (
          <div key={i} style={{ background: "rgb(240,234,229)", borderRadius: 12, padding: "16px 14px", textAlign: "center" }}>
            <p style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: "-0.02em", marginBottom: 2 }}>{s.value}</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#1a1615", marginBottom: 2 }}>{s.label}</p>
            <p style={{ fontSize: 10, color: "#b0adac", lineHeight: 1.4 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Area chart */}
      <div style={{ marginBottom: 8 }}>
        <p style={{ fontSize: 11, color: "#b0adac", marginBottom: 8 }}>Cumulative organic visitors — 12 month projection</p>
        <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: "100%", display: "block" }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16a34a" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#16a34a" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Y axis labels */}
          {[0, 0.5, 1].map((pct, i) => (
            <text key={i}
              x={pad.left - 6}
              y={pad.top + innerH - pct * innerH + 4}
              textAnchor="end"
              fontSize="9"
              fill="#b0adac"
            >
              {formatNum(Math.round(maxVal * pct))}
            </text>
          ))}

          {/* Grid lines */}
          {[0, 0.5, 1].map((pct, i) => (
            <line key={i}
              x1={pad.left} x2={pad.left + innerW}
              y1={pad.top + innerH - pct * innerH} y2={pad.top + innerH - pct * innerH}
              stroke="rgb(227,225,225)" strokeWidth="1"
            />
          ))}

          {/* Area fill */}
          <path d={areaPath} fill="url(#areaGrad)" />

          {/* Line */}
          <path d={linePath} fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Dots */}
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill="#fff" stroke="#16a34a" strokeWidth="1.5" />
          ))}

          {/* X axis labels — every 3 months */}
          {months.map((m, i) => i % 3 === 0 && (
            <text key={i}
              x={pad.left + (i / 11) * innerW}
              y={chartH - 4}
              textAnchor="middle"
              fontSize="9"
              fill="#b0adac"
            >
              {m}
            </text>
          ))}
        </svg>
      </div>

      {/* Footer note */}
      <p style={{ fontSize: 11, color: "#b0adac", borderTop: "1px solid rgb(227,225,225)", paddingTop: 12, marginTop: 4 }}>
        Projection assumes 1 article/day (Starter plan), average ranking position 5–8, CTR 3.5%, 2% visitor-to-customer conversion.
        Search volumes sourced from Google Ads keyword data.
      </p>
    </div>
  );
}
