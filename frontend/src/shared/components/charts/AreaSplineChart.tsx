import React, { useState } from 'react';
import { TrendingUp, Calendar, Sparkles } from 'lucide-react';

export interface ChartDataPoint {
  label: string; // e.g. 'Jan', 'Feb', 'Mar'
  value: number; // e.g. 85
  secondaryValue?: number; // e.g. 12
  fullDate?: string;
  tooltipText?: string;
}

interface AreaSplineChartProps {
  title?: string;
  subtitle?: string;
  data: ChartDataPoint[];
  height?: number;
  highlightValue?: string;
  highlightLabel?: string;
  trendText?: string;
  color?: string;
}

export const AreaSplineChart: React.FC<AreaSplineChartProps> = ({
  title = 'Performance Overview',
  subtitle = 'Statistik & Efisiensi Layanan',
  data,
  height = 180,
  highlightValue = '94.8%',
  highlightLabel = 'Tingkat Kepuasan & SLA',
  trendText = '+14.2% vs periode lalu',
  color = '#10b981',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [selectedRange, setSelectedRange] = useState<'month' | 'halfYear' | 'year'>('halfYear');

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        Tidak ada data grafik yang tersedia.
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values, 100);
  const minVal = Math.min(...values, 0);
  const range = maxVal - minVal || 1;

  const width = 600;
  const paddingX = 30;
  const paddingY = 25;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1 || 1)) * chartW;
    const y = paddingY + chartH - ((d.value - minVal) / range) * chartH;
    return { x, y, ...d };
  });

  // Calculate smooth SVG Cubic Bezier Path
  const createSplinePath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const cp1x = curr.x + (next.x - curr.x) / 2.5;
      const cp1y = curr.y;
      const cp2x = next.x - (next.x - curr.x) / 2.5;
      const cp2y = next.y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    return path;
  };

  const linePath = createSplinePath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY + 10} L ${points[0].x} ${height - paddingY + 10} Z`;

  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
      {/* Top Header & Range Filters */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
              {subtitle}
            </span>
          </div>
          <h3 className="text-base font-black text-slate-900 mt-1">{title}</h3>
        </div>

        {/* Timeframe pill selector */}
        <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/70 text-[11px] font-extrabold">
          <button
            type="button"
            onClick={() => setSelectedRange('month')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              selectedRange === 'month' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Bulan Ini
          </button>
          <button
            type="button"
            onClick={() => setSelectedRange('halfYear')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              selectedRange === 'halfYear' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            6 Bulan
          </button>
          <button
            type="button"
            onClick={() => setSelectedRange('year')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              selectedRange === 'year' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            1 Tahun
          </button>
        </div>
      </div>

      {/* Hero Metric & Trend Badge */}
      <div className="flex flex-wrap items-baseline gap-3 pt-1">
        <span className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
          {highlightValue}
        </span>
        <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-xl">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{trendText}</span>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {highlightLabel}
        </span>
      </div>

      {/* Interactive SVG Chart Canvas */}
      <div className="relative w-full overflow-hidden pt-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="areaGradientEmerald" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
              <stop offset="65%" stopColor="#10b981" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Horizontal Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((ratio, idx) => (
            <line
              key={idx}
              x1={paddingX}
              y1={paddingY + chartH * (1 - ratio)}
              x2={width - paddingX}
              y2={paddingY + chartH * (1 - ratio)}
              stroke="#f1f5f9"
              strokeDasharray="4 4"
              strokeWidth="1.2"
            />
          ))}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#areaGradientEmerald)" />

          {/* Spline Stroke Line */}
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />

          {/* Data Points and Hover Target Zones */}
          {points.map((p, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g key={idx} className="cursor-pointer">
                {/* Hover Vertical Guide Line */}
                {isHovered && (
                  <line
                    x1={p.x}
                    y1={paddingY}
                    x2={p.x}
                    y2={height - paddingY + 10}
                    stroke="#10b981"
                    strokeDasharray="3 3"
                    strokeWidth="1.5"
                    className="animate-pulse"
                  />
                )}

                {/* Point Outer Ring */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 7.5 : 4.5}
                  fill="#ffffff"
                  stroke={color}
                  strokeWidth={isHovered ? 3.5 : 2.5}
                  className="transition-all duration-200 shadow-sm"
                />

                {/* Invisible larger hit target */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={22}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Interactive Floating Tooltip */}
        {activePoint && (
          <div
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 bg-slate-900/95 text-white text-[11px] font-sans p-2.5 rounded-2xl shadow-xl border border-slate-700/80 backdrop-blur-md min-w-[120px] text-center"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
              top: `${Math.max(0, (activePoint.y / height) * 100 - 35)}%`,
            }}
          >
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              {activePoint.label} {activePoint.fullDate ? `(${activePoint.fullDate})` : ''}
            </div>
            <div className="text-sm font-black text-emerald-400 mt-0.5">
              {activePoint.value} {activePoint.tooltipText || 'Performa'}
            </div>
            {activePoint.secondaryValue !== undefined && (
              <div className="text-[10px] text-slate-300 font-mono">
                Diproses: {activePoint.secondaryValue} surat
              </div>
            )}
          </div>
        )}

        {/* X-Axis Labels */}
        <div className="flex justify-between items-center px-4 pt-2 text-[10px] sm:text-[11px] font-extrabold text-slate-400">
          {data.map((d, i) => (
            <span
              key={i}
              className={`transition-colors cursor-pointer ${
                hoveredIdx === i ? 'text-emerald-700 font-black scale-110' : 'hover:text-slate-700'
              }`}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
