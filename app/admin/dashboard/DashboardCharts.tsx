"use client";

import { useEffect, useState, useRef } from "react";

/* ────── TYPES ────── */
interface ChartPoint { label: string; value: number; }

interface DashboardChartsProps {
  timeline: { year?: string; id?: string }[];
  certs: { date?: string }[];
  messages: { createdAt?: string }[];
}

/* ────── HELPERS ────── */
function groupByYear(items: { year?: string; date?: string }[], field: "year" | "date"): ChartPoint[] {
  const map: Record<string, number> = {};
  items.forEach(item => {
    const raw = field === "year" ? item.year : item.date;
    if (!raw) return;
    // Extract 4-digit year from strings like "2024", "Oct 2024", "2024-01-15"
    const match = raw.match(/(\d{4})/);
    const yr = match ? match[1] : raw;
    map[yr] = (map[yr] || 0) + 1;
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => ({ label, value }));
}

function groupByMonth(items: { createdAt?: string }[]): ChartPoint[] {
  const map: Record<string, number> = {};
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  items.forEach(item => {
    if (!item.createdAt) return;
    const d = new Date(item.createdAt);
    if (isNaN(d.getTime())) return;
    const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map)
    .sort(([a], [b]) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(-12) // last 12 months
    .map(([label, value]) => ({ label, value }));
}

/* ────── REUSABLE LINE CHART ────── */
function LineChart({ data, color, label }: { data: ChartPoint[]; color: string; label: string }) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (data.length === 0) {
    return (
      <div style={chartCardStyle}>
        <h3 style={chartTitleStyle}>{label}</h3>
        <div style={emptyStateStyle}>No data available</div>
      </div>
    );
  }

  const W = 500, H = 200, PAD = 40, PADT = 20, PADR = 20;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const plotW = W - PAD - PADR;
  const plotH = H - PADT - PAD;

  const points = data.map((d, i) => ({
    x: PAD + (data.length > 1 ? (i / (data.length - 1)) * plotW : plotW / 2),
    y: PADT + plotH - (d.value / maxVal) * plotH,
  }));

  // Smooth SVG path using cubic bezier
  let linePath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    linePath += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  // Area path (for gradient fill)
  const areaPath = linePath + ` L ${points[points.length - 1].x} ${PADT + plotH} L ${points[0].x} ${PADT + plotH} Z`;

  // Y-axis ticks
  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((maxVal / yTicks) * i));

  const gradientId = `grad-${label.replace(/\s/g, "")}`;

  return (
    <div ref={ref} style={chartCardStyle}>
      <h3 style={chartTitleStyle}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block", marginRight: 8 }} />
        {label}
      </h3>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yTickValues.map((val, i) => {
          const y = PADT + plotH - (val / maxVal) * plotH;
          return (
            <g key={i}>
              <line x1={PAD} y1={y} x2={W - PADR} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <text x={PAD - 8} y={y + 4} fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="end" fontFamily="monospace">{val}</text>
            </g>
          );
        })}

        {/* Area fill */}
        <path
          d={areaPath}
          fill={`url(#${gradientId})`}
          style={{
            opacity: animated ? 1 : 0,
            transition: "opacity 1s ease 0.3s",
          }}
        />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 2000,
            strokeDashoffset: animated ? 0 : 2000,
            transition: "stroke-dashoffset 1.5s ease",
          }}
        />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x} cy={p.y} r={animated ? 4 : 0}
              fill="#080808" stroke={color} strokeWidth="2"
              style={{ transition: `r 0.3s ease ${0.3 + i * 0.1}s` }}
            />
            {/* Tooltip hover area */}
            <circle cx={p.x} cy={p.y} r={14} fill="transparent" style={{ cursor: "default" }}>
              <title>{`${data[i].label}: ${data[i].value}`}</title>
            </circle>
          </g>
        ))}

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={points[i].x}
            y={H - 8}
            fill="rgba(255,255,255,0.4)"
            fontSize="10"
            textAnchor="middle"
            fontFamily="monospace"
          >
            {d.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

/* ────── BAR CHART ────── */
function BarChart({ data, color, label }: { data: ChartPoint[]; color: string; label: string }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (data.length === 0) {
    return (
      <div style={chartCardStyle}>
        <h3 style={chartTitleStyle}>{label}</h3>
        <div style={emptyStateStyle}>No data available</div>
      </div>
    );
  }

  const W = 500, H = 200, PAD = 40, PADT = 20, PADR = 20;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const plotW = W - PAD - PADR;
  const plotH = H - PADT - PAD;
  const barWidth = Math.min(40, (plotW / data.length) * 0.6);
  const gap = (plotW - barWidth * data.length) / (data.length + 1);

  const gradientId = `bargrad-${label.replace(/\s/g, "")}`;

  return (
    <div style={chartCardStyle}>
      <h3 style={chartTitleStyle}>
        <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: "inline-block", marginRight: 8 }} />
        {label}
      </h3>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color} stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Horizontal grid */}
        {[0.25, 0.5, 0.75, 1].map((frac, i) => {
          const y = PADT + plotH - frac * plotH;
          return (
            <g key={i}>
              <line x1={PAD} y1={y} x2={W - PADR} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <text x={PAD - 8} y={y + 4} fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="end" fontFamily="monospace">
                {Math.round(frac * maxVal)}
              </text>
            </g>
          );
        })}

        {/* Baseline */}
        <line x1={PAD} y1={PADT + plotH} x2={W - PADR} y2={PADT + plotH} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

        {/* Bars */}
        {data.map((d, i) => {
          const barH = (d.value / maxVal) * plotH;
          const x = PAD + gap + i * (barWidth + gap);
          const y = PADT + plotH - barH;
          return (
            <g key={i}>
              <rect
                x={x}
                y={animated ? y : PADT + plotH}
                width={barWidth}
                height={animated ? barH : 0}
                rx={3}
                fill={`url(#${gradientId})`}
                style={{
                  transition: `y 0.6s ease ${i * 0.08}s, height 0.6s ease ${i * 0.08}s`,
                }}
              />
              {/* Value label on top of bar */}
              <text
                x={x + barWidth / 2}
                y={animated ? y - 6 : PADT + plotH - 6}
                fill="rgba(255,255,255,0.6)"
                fontSize="11"
                textAnchor="middle"
                fontFamily="monospace"
                fontWeight="600"
                style={{
                  opacity: animated ? 1 : 0,
                  transition: `opacity 0.3s ease ${0.4 + i * 0.08}s, y 0.6s ease ${i * 0.08}s`,
                }}
              >
                {d.value}
              </text>
              {/* X-axis label */}
              <text
                x={x + barWidth / 2}
                y={H - 8}
                fill="rgba(255,255,255,0.4)"
                fontSize="10"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ────── MINI STAT CARD (Area sparkline) ────── */
function SparklineCard({ data, color, label, total }: { data: ChartPoint[]; color: string; label: string; total: number }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const W = 200, H = 60;
  const maxVal = Math.max(...data.map(d => d.value), 1);

  const points = data.map((d, i) => ({
    x: data.length > 1 ? (i / (data.length - 1)) * W : W / 2,
    y: H - (d.value / maxVal) * (H * 0.8) - H * 0.1,
  }));

  let sparkPath = "";
  if (points.length > 0) {
    sparkPath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      sparkPath += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
  }
  const areaPath = points.length > 0 ? sparkPath + ` L ${W} ${H} L 0 ${H} Z` : "";

  const gradientId = `spark-${label.replace(/\s/g, "")}`;

  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.05)",
      borderRadius: 12,
      padding: "1rem 1.25rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "1rem",
      minWidth: 0,
    }}>
      <div>
        <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: "1.5rem", fontWeight: 600, color }}>{total}</div>
      </div>
      {points.length > 1 && (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: 120, height: 40, flexShrink: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#${gradientId})`} style={{ opacity: animated ? 1 : 0, transition: "opacity 0.8s ease" }} />
          <path d={sparkPath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"
            style={{ strokeDasharray: 1000, strokeDashoffset: animated ? 0 : 1000, transition: "stroke-dashoffset 1.2s ease" }}
          />
        </svg>
      )}
    </div>
  );
}

/* ────── MAIN EXPORT ────── */
export default function DashboardCharts({ timeline, certs, messages }: DashboardChartsProps) {
  const certsByYear = groupByYear(certs, "date");
  const timelineByYear = groupByYear(timeline, "year");
  const messagesByMonth = groupByMonth(messages);

  // Compute stats for sparkline summary row
  const totalVisitors = messages.length + certs.length + timeline.length; // Mock stat
  const unreadMessages = messages.filter((m: any) => !m.read).length;

  return (
    <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Sparkline Summary Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <SparklineCard data={certsByYear} color="#00aaff" label="Certifications Trend" total={certs.length} />
        <SparklineCard data={timelineByYear} color="#a855f7" label="Timeline Growth" total={timeline.length} />
        <SparklineCard data={messagesByMonth} color="#22c55e" label="Messages Activity" total={messages.length} />
      </div>

      {/* Main Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "1.5rem" }}>
        <LineChart data={certsByYear} color="#00aaff" label="Certifications per Year" />
        <BarChart data={timelineByYear} color="#a855f7" label="Timeline Events per Year" />
      </div>

      {/* Messages Over Time - Full Width */}
      {messagesByMonth.length > 0 && (
        <LineChart data={messagesByMonth} color="#22c55e" label="Messages per Month" />
      )}
    </div>
  );
}

/* ────── SHARED STYLES ────── */
const chartCardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.05)",
  borderRadius: 12,
  padding: "1.5rem",
};

const chartTitleStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  color: "rgba(255,255,255,0.5)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "1rem",
  fontWeight: 500,
  display: "flex",
  alignItems: "center",
};

const emptyStateStyle: React.CSSProperties = {
  height: 120,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "rgba(255,255,255,0.25)",
  fontSize: "0.9rem",
};
