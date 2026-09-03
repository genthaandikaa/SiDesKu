import React, { useState } from 'react';
import { BarChart2, ChevronDown, Check } from 'lucide-react';

export interface BarDataPoint {
  label: string; // e.g. 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'
  value: number; // e.g. 18
  maxValue?: number;
  highlight?: boolean;
}

interface BarActivityChartProps {
  title?: string;
  subtitle?: string;
  data: BarDataPoint[];
  mainValue?: string;
  mainLabel?: string;
  filterOptions?: string[];
}

export const BarActivityChart: React.FC<BarActivityChartProps> = ({
  title = 'Frekuensi Aktivitas',
  subtitle = 'Statistik Harian',
  data,
  mainValue = '142 Dokumen',
  mainLabel = 'Diproses Minggu Ini',
  filterOptions = ['Minggu Ini', 'Bulan Ini', 'Tahun Ini'],
}) => {
  const [activeFilter, setActiveFilter] = useState(filterOptions[0] || 'Minggu Ini');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const values = data.map((d) => d.value);
  const max = Math.max(...values, 10);

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
            {subtitle}
          </span>
          <h4 className="text-sm font-black text-slate-900 mt-1">{title}</h4>
        </div>

        <div className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-xl border border-emerald-200 flex items-center gap-1 cursor-pointer hover:bg-emerald-100 transition-colors">
          <span>{activeFilter}</span>
        </div>
      </div>

      {/* Hero Metric */}
      <div>
        <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          {mainValue}
        </div>
        <div className="text-xs text-slate-400 font-medium mt-0.5">
          {mainLabel}
        </div>
      </div>

      {/* Modern Rounded Vertical Bar Columns */}
      <div className="pt-2">
        <div className="h-32 flex items-end justify-between gap-2 sm:gap-3 px-1">
          {data.map((item, idx) => {
            const heightPct = Math.max(12, Math.round((item.value / max) * 100));
            const isHovered = hoveredIdx === idx;
            const isFeatured = item.highlight || isHovered;

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Tooltip on hover */}
                {isHovered && (
                  <div className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-md mb-1.5 shadow-2xs transition-all animate-scale-up">
                    {item.value}
                  </div>
                )}

                {/* Vertical Bar */}
                <div className="w-full bg-slate-100 rounded-2xl h-full flex items-end p-0.5">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-2xl transition-all duration-500 ${
                      isFeatured
                        ? 'bg-gradient-to-t from-emerald-700 to-emerald-500 shadow-xs scale-y-100'
                        : 'bg-emerald-300/80 hover:bg-emerald-400'
                    }`}
                  />
                </div>

                {/* Day / Label underneath */}
                <span
                  className={`mt-2 text-[10px] font-bold transition-colors ${
                    isHovered ? 'text-emerald-800 font-black' : 'text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
