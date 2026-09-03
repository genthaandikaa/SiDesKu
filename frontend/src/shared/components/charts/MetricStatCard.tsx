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
    <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-4 transition-all hover:shadow-xs hover:border-emerald-300">
      <div className="space-y-1 min-w-0">
        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide truncate block">
          {title}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            {value}
          </span>
          {subvalue && (
            <span className="text-xs font-bold text-slate-400">
              {subvalue}
            </span>
          )}
        </div>

        {trend && (
          <div className={`flex items-center gap-1 text-[10px] font-black ${
            isPositiveTrend ? 'text-emerald-700' : 'text-rose-600'
          }`}>
            {isPositiveTrend ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{trend}</span>
          </div>
        )}
      </div>

      {percentage !== undefined && (
        <div className="shrink-0">
          <DonutGauge
            percentage={percentage}
            size={58}
            strokeWidth={5.5}
            color={color}
            icon={icon}
          />
        </div>
      )}
    </div>
  );
};
