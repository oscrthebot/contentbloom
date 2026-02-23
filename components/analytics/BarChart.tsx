"use client";

import { useState } from "react";

interface BarItem {
  label: string;
  value: number;
  sublabel?: string;
}

interface BarChartProps {
  data: BarItem[];
  title?: string;
  loading?: boolean;
  height?: number;
  color?: string;
}

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

export function BarChart({ data, title, loading, height = 240, color = "#6366f1" }: BarChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        {title && <div className="h-5 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4" />}
        <div className="animate-pulse bg-gray-100 dark:bg-gray-900 rounded-lg" style={{ height }} />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        {title && <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{title}</h3>}
        <div
          className="flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm"
          style={{ height }}
        >
          No data yet
        </div>
      </div>
    );
  }

  const W = 560;
  const H = height;
  const PAD = { top: 16, right: 16, bottom: 60, left: 40 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const barWidth = Math.max(8, (chartW / data.length) * 0.6);
  const barGap = chartW / data.length;

  const xOf = (i: number) => PAD.left + i * barGap + barGap / 2;
  const barH = (v: number) => (v / maxVal) * chartH;

  return (
    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6">
      {title && (
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{title}</h3>
      )}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ height, minWidth: 300 }}
          onMouseLeave={() => setHovered(null)}
        >
          {/* Y-grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const yVal = Math.round(t * maxVal);
            const y = PAD.top + chartH - t * chartH;
            return (
              <g key={t}>
                <line
                  x1={PAD.left}
                  x2={PAD.left + chartW}
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={0.08}
                  strokeWidth={1}
                />
                <text
                  x={PAD.left - 6}
                  y={y}
                  fontSize={9}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fill="currentColor"
                  fillOpacity={0.5}
                >
                  {yVal}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((d, i) => {
            const bh = barH(d.value);
            const bx = xOf(i) - barWidth / 2;
            const by = PAD.top + chartH - bh;
            const isHov = hovered === i;

            return (
              <g key={i} onMouseEnter={() => setHovered(i)}>
                <rect
                  x={bx}
                  y={by}
                  width={barWidth}
                  height={bh}
                  rx={3}
                  fill={color}
                  fillOpacity={isHov ? 1 : 0.75}
                  style={{ transition: "fill-opacity 0.1s" }}
                />
                {/* X-axis label */}
                <text
                  x={xOf(i)}
                  y={PAD.top + chartH + 10}
                  fontSize={8}
                  textAnchor="middle"
                  fill="currentColor"
                  fillOpacity={0.6}
                >
                  {truncate(d.label, 12)}
                </text>
                {/* Hover tooltip */}
                {isHov && (
                  <>
                    <rect
                      x={xOf(i) - 28}
                      y={by - 22}
                      width={56}
                      height={18}
                      rx={4}
                      fill="#1e1b4b"
                    />
                    <text
                      x={xOf(i)}
                      y={by - 10}
                      fontSize={10}
                      textAnchor="middle"
                      fill="white"
                      fontWeight={600}
                    >
                      {d.value}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
