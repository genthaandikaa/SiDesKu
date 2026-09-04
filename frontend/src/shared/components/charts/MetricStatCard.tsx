import React from 'react';
import { DonutGauge } from './DonutGauge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricStatCardProps {
  title: string;
  value: string | number;
  subvalue?: string;
  percentage?: number;
  color?: 'emerald' | 'amber' | 'sky' | 'rose' | 'teal' | 'indigo';
  trend?: string;
  isPositiveTrend?: boolean;
  icon?: React.ReactNode;
}

export const MetricStatCard: React.FC<MetricStatCardProps> = ({
  title,
  value,
  subvalue,
  percentage,
  color = 'emerald',
  trend,
  isPositiveTrend = true,
  icon,
}) => {
  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 transition-all hover:shadow-xs hover:border-emerald-300 min-w-0 h-full">
      {/* Left Text Block */}
      <div className="space-y-2 min-w-0 flex-1 flex flex-col justify-between h-full">
        {/* Title Slot: Fixed min-height (2.25rem = 36px) so 1-line and 2-line titles take identical vertical height */}
        <div className="min-h-[2.25rem] flex items-start">
          <span className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-wider leading-snug line-clamp-2 block">
            {title}
          </span>
        </div>

        {/* Primary Value & Subvalue */}
        <div className="space-y-0.5 py-0.5">
          <div className="text-lg sm:text-xl xl:text-2xl font-black text-slate-950 tracking-tight leading-none truncate">
            {value}
          </div>
          {subvalue && (
            <div className="text-[11px] font-bold text-slate-400 truncate">
              {subvalue}
            </div>
          )}
        </div>

        {/* Trend Pill Badge anchored to bottom */}
        <div className="min-h-[1.35rem] flex items-end">
          {trend ? (
            <div
              className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md ${
                isPositiveTrend
                  ? 'text-emerald-700 bg-emerald-50/90 border border-emerald-200/70'
                  : 'text-rose-700 bg-rose-50/90 border border-rose-200/70'
              }`}
            >
              {isPositiveTrend ? (
                <TrendingUp className="w-3 h-3 shrink-0" />
              ) : (
                <TrendingDown className="w-3 h-3 shrink-0" />
              )}
              <span className="truncate">{trend}</span>
            </div>
          ) : (
            <div className="h-4" />
          )}
        </div>
      </div>

      {/* Right Donut Gauge - centered vertically */}
      {percentage !== undefined && (
        <div className="shrink-0 flex items-center justify-center pl-1 self-center">
          <DonutGauge
            percentage={percentage}
            size={52}
            strokeWidth={5}
            color={color}
            icon={icon}
          />
        </div>
      )}
    </div>
  );
};
