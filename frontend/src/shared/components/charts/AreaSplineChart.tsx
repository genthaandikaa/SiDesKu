import React, { useState } from 'react';
import { TrendingUp, BarChart3, LineChart, Layers, PieChart } from 'lucide-react';

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
  title = 'Overview Efisiensi & Volume Surat',
  subtitle = 'Statistik Layanan Administrasi',
  data,
  height = 180,
  highlightValue = '96.75%',
  highlightLabel = 'Kecepatan Penerbitan & Kepuasan Warga',
  trendText = '+12.8% vs bulan lalu',
  color = '#10b981',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [selectedRange, setSelectedRange] = useState<'month' | 'halfYear' | 'year'>('halfYear');
  const [chartType, setChartType] = useState<'bar' | 'spline' | 'combo' | 'pie'>('bar');

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        Tidak ada data grafik yang tersedia.
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values, 10);
  const minVal = 0;
  const range = maxVal - minVal || 1;
  const totalValue = values.reduce((sum, v) => sum + v, 0) || 1;

  const width = 600;
  const paddingX = 30;
  const paddingY = 25;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const step = chartW / (data.length || 1);
  const barWidth = Math.min(36, Math.max(16, step * 0.48));

  // Bars calculation
  const bars = data.map((d, i) => {
    const x = paddingX + i * step + (step - barWidth) / 2;
    const barH = ((d.value - minVal) / range) * chartH;
    const y = paddingY + chartH - barH;
    return { x, y, barH, ...d };
  });

  // Points calculation for line / spline / combo
  const points = data.map((d, i) => {
    const x = paddingX + i * step + step / 2;
    const y = paddingY + chartH - ((d.value - minVal) / range) * chartH;
    return { x, y, ...d };
  });

  // Donut / Pie Slice Calculations (Curated Cohesive Emerald-Teal Palette)
  const sliceColors = [
    '#059669', // Emerald 600
    '#0d9488', // Teal 600
    '#10b981', // Emerald 500
    '#14b8a6', // Teal 500
    '#34d399', // Emerald 400
    '#2dd4bf', // Teal 400
    '#047857', // Emerald 700
    '#0f766e', // Teal 700
  ];

  // Donut / Pie Slice Calculations (Centered for Mobile/Responsive rendering)
  let accumMobileAngle = 0;
  const mobileCenter = { x: 90, y: 90, outerR: 78, innerR: 50 };
  const mobilePieSlices = data.map((d, idx) => {
    const percentage = (d.value / totalValue) * 100;
    const angle = (d.value / totalValue) * 360;
    const startAngle = accumMobileAngle;
    const endAngle = accumMobileAngle + angle;
    accumMobileAngle = endAngle;

    const radStart = ((startAngle - 90) * Math.PI) / 180;
    const radEnd = ((endAngle - 90) * Math.PI) / 180;

    const x1 = mobileCenter.x + mobileCenter.outerR * Math.cos(radStart);
    const y1 = mobileCenter.y + mobileCenter.outerR * Math.sin(radStart);
    const x2 = mobileCenter.x + mobileCenter.outerR * Math.cos(radEnd);
    const y2 = mobileCenter.y + mobileCenter.outerR * Math.sin(radEnd);

    const x3 = mobileCenter.x + mobileCenter.innerR * Math.cos(radEnd);
    const y3 = mobileCenter.y + mobileCenter.innerR * Math.sin(radEnd);
    const x4 = mobileCenter.x + mobileCenter.innerR * Math.cos(radStart);
    const y4 = mobileCenter.y + mobileCenter.innerR * Math.sin(radStart);

    const largeArcFlag = angle > 180 ? 1 : 0;
    const pathData = `M ${x1} ${y1} A ${mobileCenter.outerR} ${mobileCenter.outerR} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${mobileCenter.innerR} ${mobileCenter.innerR} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;

    return {
      ...d,
      pathData,
      percentage: percentage.toFixed(1),
      color: sliceColors[idx % sliceColors.length],
    };
  });

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

  const activePoint = hoveredIdx !== null ? bars[hoveredIdx] : null;

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4 font-sans">
      {/* Top Header & Range/Type Filters */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
              {subtitle}
            </span>
          </div>
          <h3 className="text-base font-black text-slate-900 mt-1">{title}</h3>
        </div>

        {/* Filter Controls Row: Chart Type Switcher + Timeframe Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart Mode Switcher */}
          <div className="flex items-center gap-1 bg-emerald-50/90 p-1 rounded-xl border border-emerald-200/70 text-[11px] font-extrabold">
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                chartType === 'bar' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-emerald-800 hover:bg-emerald-100/70'
              }`}
              title="Tampilan Grafik Batang (Bar)"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Batang</span>
            </button>

            <button
              type="button"
              onClick={() => setChartType('spline')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                chartType === 'spline' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-emerald-800 hover:bg-emerald-100/70'
              }`}
              title="Tampilan Grafik Garis (Spline Area)"
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Garis</span>
            </button>

            <button
              type="button"
              onClick={() => setChartType('combo')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                chartType === 'combo' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-emerald-800 hover:bg-emerald-100/70'
              }`}
              title="Tampilan Kombinasi Batang + Garis"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Combo</span>
            </button>

            <button
              type="button"
              onClick={() => setChartType('pie')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                chartType === 'pie' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-emerald-800 hover:bg-emerald-100/70'
              }`}
              title="Tampilan Grafik Bulat (Donut/Pie Chart)"
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Bulat</span>
            </button>
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

      {/* RENDER MODE 4: DONUT / PIE CHART (LEGEND LIST ALWAYS AT THE BOTTOM FOR MAXIMUM CLARITY IN LANDSCAPE & PORTRAIT) */}
      {chartType === 'pie' ? (
        <div className="flex flex-col items-center justify-center gap-5 pt-2 animate-fade-in">
          {/* Centered Large Crisp Donut Circle */}
          <div className="relative shrink-0 flex items-center justify-center py-2">
            <svg width={190} height={190} viewBox="0 0 180 180" className="overflow-visible select-none">
              {mobilePieSlices.map((slice, idx) => {
                const isHovered = hoveredIdx === idx;
                return (
                  <path
                    key={`pie-${idx}`}
                    d={slice.pathData}
                    fill={slice.color}
                    opacity={hoveredIdx !== null && !isHovered ? 0.5 : 1}
                    className="transition-all duration-300 cursor-pointer hover:scale-105 origin-[90px_90px]"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                );
              })}

              {/* Center Text Hole Display */}
              <circle cx={mobileCenter.x} cy={mobileCenter.y} r={mobileCenter.innerR - 2} fill="#ffffff" />
              <text x={mobileCenter.x} y={mobileCenter.y - 4} textAnchor="middle" fill="#0f172a" fontSize="18" fontWeight="900">
                {hoveredIdx !== null ? `${data[hoveredIdx].value}` : `${totalValue}`}
              </text>
              <text x={mobileCenter.x} y={mobileCenter.y + 12} textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="700">
                {hoveredIdx !== null ? `${data[hoveredIdx].label}` : 'Total Surat'}
              </text>
            </svg>
          </div>

          {/* HTML Responsive Legend List Cards: ALWAYS UNDERNEATH THE CHART FOR CLEAR VISIBILITY */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {mobilePieSlices.map((slice, i) => {
              const isHovered = hoveredIdx === i;
              return (
                <div
                  key={`legend-item-${i}`}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isHovered
                      ? 'bg-emerald-50/90 border-emerald-300 shadow-xs scale-102'
                      : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-3 h-3 rounded-md shrink-0 shadow-2xs"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="text-xs font-black text-slate-800 truncate">
                      {slice.label}
                    </span>
                  </div>

                  <div className="text-xs font-black shrink-0" style={{ color: slice.color }}>
                    {slice.value}{' '}
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      ({slice.percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* CARTESIAN CHART MODES (BAR, SPLINE, COMBO) */
        <div className="relative w-full overflow-hidden pt-2">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible select-none"
          >
            <defs>
              <linearGradient id="barGradientEmerald" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="barGradientHover" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <linearGradient id="areaGradientEmerald" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
                <stop offset="65%" stopColor="#10b981" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
              </linearGradient>
              <filter id="barGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
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

            {/* RENDER MODE 1: AREA SPLINE FILL & LINE (FOR 'spline' OR 'combo') */}
            {chartType === 'spline' && (
              <path d={areaPath} fill="url(#areaGradientEmerald)" className="animate-fade-in" />
            )}

            {/* RENDER BARS (FOR 'bar' OR 'combo') */}
            {(chartType === 'bar' || chartType === 'combo') &&
              bars.map((b, idx) => {
                const isHovered = hoveredIdx === idx;
                const computedHeight = Math.max(b.barH, 6);
                const computedY = paddingY + chartH - computedHeight;

                return (
                  <g
                    key={`bar-${idx}`}
                    className="cursor-pointer group"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    {/* Column Track Background */}
                    <rect
                      x={b.x}
                      y={paddingY}
                      width={barWidth}
                      height={chartH}
                      rx={8}
                      fill="#f8fafc"
                      stroke="#f1f5f9"
                      strokeWidth="1"
                      className="transition-colors duration-200 group-hover:fill-emerald-50/50"
                    />

                    {/* Filled Gradient Bar */}
                    <rect
                      x={b.x}
                      y={computedY}
                      width={barWidth}
                      height={computedHeight}
                      rx={7}
                      fill={isHovered ? 'url(#barGradientHover)' : 'url(#barGradientEmerald)'}
                      filter={isHovered ? 'url(#barGlow)' : undefined}
                      opacity={chartType === 'combo' ? 0.85 : 1}
                      className="transition-all duration-300 transform origin-bottom"
                    />

                    {/* Top Circular Indicator Cap Dot (Only for 'bar' mode) */}
                    {chartType === 'bar' && (
                      <circle
                        cx={b.x + barWidth / 2}
                        cy={computedY}
                        r={isHovered ? 6.5 : 4.5}
                        fill="#ffffff"
                        stroke="#059669"
                        strokeWidth={isHovered ? 3 : 2.5}
                        className="transition-all duration-200 drop-shadow-xs"
                      />
                    )}
                  </g>
                );
              })}

            {/* RENDER SPLINE STROKE LINE (FOR 'spline' OR 'combo') */}
            {(chartType === 'spline' || chartType === 'combo') && (
              <path
                d={linePath}
                fill="none"
                stroke={color}
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300"
              />
            )}

            {/* RENDER CIRCLE DOTS ON LINE (FOR 'spline' OR 'combo') */}
            {(chartType === 'spline' || chartType === 'combo') &&
              points.map((p, idx) => {
                const isHovered = hoveredIdx === idx;
                return (
                  <g
                    key={`point-${idx}`}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 7 : 4.5}
                      fill="#ffffff"
                      stroke={color}
                      strokeWidth={isHovered ? 3.5 : 2.5}
                      className="transition-all duration-200 shadow-sm"
                    />
                  </g>
                );
              })}

            {/* VALUE TEXT OVER BAR ON HOVER */}
            {bars.map((b, idx) => {
              if (hoveredIdx !== idx) return null;
              const computedHeight = Math.max(b.barH, 6);
              const computedY = paddingY + chartH - computedHeight;

              return (
                <text
                  key={`val-${idx}`}
                  x={b.x + barWidth / 2}
                  y={computedY - 10}
                  textAnchor="middle"
                  fill="#047857"
                  fontSize="11"
                  fontWeight="800"
                  className="animate-fade-in"
                >
                  {b.value}
                </text>
              );
            })}
          </svg>

          {/* Interactive Floating Tooltip */}
          {activePoint && (
            <div
              className="absolute z-20 pointer-events-none transform -translate-x-1/2 bg-slate-900/95 text-white text-[11px] font-sans p-2.5 rounded-2xl shadow-xl border border-slate-700/80 backdrop-blur-md min-w-[120px] text-center"
              style={{
                left: `${((activePoint.x + barWidth / 2) / width) * 100}%`,
                top: `${Math.max(0, (activePoint.y / height) * 100 - 38)}%`,
              }}
            >
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                {activePoint.label} {activePoint.fullDate ? `(${activePoint.fullDate})` : ''}
              </div>
              <div className="text-sm font-black text-emerald-400 mt-0.5">
                {activePoint.value} {activePoint.tooltipText || 'Surat'}
              </div>
              {activePoint.secondaryValue !== undefined && (
                <div className="text-[10px] text-slate-300 font-mono">
                  Selesai: {activePoint.secondaryValue} surat
                </div>
              )}
            </div>
          )}

          {/* X-Axis Labels */}
          <div className="flex justify-between items-center px-2 pt-2 text-[10px] sm:text-[11px] font-extrabold text-slate-400">
            {data.map((d, i) => (
              <span
                key={i}
                className={`transition-colors cursor-pointer text-center flex-1 ${
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
      )}
    </div>
  );
};
