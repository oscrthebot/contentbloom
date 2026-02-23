"use client";

import { useState } from "react";

interface DataPoint {
  date: string;
  count: number;
}

interface LineChartProps {
  data: DataPoint[];
  title?: string;
  loading?: boolean;
  height?: number;
}

export function LineChart({ data, title, loading, height = 200 }: LineChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        {title && <div className="h-5 w-36 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4" />}
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
  const PAD = { top: 16, right: 16, bottom: 32, left: 40 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(...data.map((d) => d.count), 1);
  const minVal = 0;

  const xScale = (i: number) => PAD.left + (i / (data.length - 1)) * chartW;
  const yScale = (v: number) => PAD.top + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;

  const points = data.map((d, i) => `${xScale(i)},${yScale(d.count)}`).join(" ");
  const pathD = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(d.count)}`)
    .join(" ");
  const areaD =
    pathD +
    ` L ${xScale(data.length - 1)} ${PAD.top + chartH} L ${PAD.left} ${PAD.top + chartH} Z`;

  // Show at most 6 x-axis labels
  const labelStep = Math.max(1, Math.floor(data.length / 6));
  const xLabels = data.filter((_, i) => i % labelStep === 0 || i === data.length - 1);

  // Y grid lines (4)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    val: Math.round(minVal + t * (maxVal - minVal)),
    y: PAD.top + chartH - t * chartH,
  }));

  return (
    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6">
      {title && (
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{title}</h3>
      )}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ height, minWidth: 280 }}
          onMouseLeave={() => setHovered(null)}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick) => (
            <g key={tick.val}>
              <line
                x1={PAD.left}
                x2={PAD.left + chartW}
                y1={tick.y}
                y2={tick.y}
                stroke="currentColor"
                strokeOpacity={0.08}
                strokeWidth={1}
              />
              <text
                x={PAD.left - 6}
                y={tick.y}
                fontSize={9}
                textAnchor="end"
                dominantBaseline="middle"
                fill="currentColor"
                fillOpacity={0.5}
              >
                {tick.val}
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {xLabels.map((d) => {
            const i = data.indexOf(d);
            return (
              <text
                key={d.date}
                x={xScale(i)}
                y={PAD.top + chartH + 14}
                fontSize={9}
                textAnchor="middle"
                fill="currentColor"
                fillOpacity={0.5}
              >
                {d.date.slice(5)} {/* MM-DD */}
              </text>
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill="url(#areaGradient)" />

          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="#6366f1"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover hit areas + dots */}
          {data.map((d, i) => (
            <g key={d.date}>
              <rect
                x={xScale(i) - 12}
                y={PAD.top}
                width={24}
                height={chartH}
                fill="transparent"
                onMouseEnter={() => setHovered(i)}
              />
              {hovered === i && (
                <>
                  <line
                    x1={xScale(i)}
                    x2={xScale(i)}
                    y1={PAD.top}
                    y2={PAD.top + chartH}
                    stroke="#6366f1"
                    strokeOpacity={0.3}
                    strokeWidth={1}
                    strokeDasharray="3,3"
                  />
                  <circle
                    cx={xScale(i)}
                    cy={yScale(d.count)}
                    r={5}
                    fill="#6366f1"
                    stroke="white"
                    strokeWidth={2}
                  />
                  <rect
                    x={xScale(i) - 30}
                    y={yScale(d.count) - 26}
                    width={60}
                    height={20}
                    rx={4}
                    fill="#1e1b4b"
                  />
                  <text
                    x={xScale(i)}
                    y={yScale(d.count) - 12}
                    fontSize={10}
                    textAnchor="middle"
                    fill="white"
                    fontWeight={600}
                  >
                    {d.count}
                  </text>
                </>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
