import React from 'react';

interface DonutGaugeProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: 'emerald' | 'amber' | 'sky' | 'rose' | 'teal' | 'indigo';
  label?: string;
  sublabel?: string;
  icon?: React.ReactNode;
}

const colorMap = {
  emerald: {
    stroke: '#10b981',
    bg: '#ecfdf5',
    text: 'text-emerald-700',
    track: '#f1f5f9',
  },
  teal: {
    stroke: '#14b8a6',
    bg: '#f0fdfa',
    text: 'text-teal-700',
    track: '#f1f5f9',
  },
  amber: {
    stroke: '#f59e0b',
    bg: '#fffbeb',
    text: 'text-amber-700',
    track: '#f1f5f9',
  },
  sky: {
    stroke: '#0ea5e9',
    bg: '#f0f9ff',
    text: 'text-sky-700',
    track: '#f1f5f9',
  },
  rose: {
    stroke: '#f43f5e',
    bg: '#fff1f2',
    text: 'text-rose-700',
    track: '#f1f5f9',
  },
  indigo: {
    stroke: '#6366f1',
    bg: '#eef2ff',
    text: 'text-indigo-700',
    track: '#f1f5f9',
  },
};

export const DonutGauge: React.FC<DonutGaugeProps> = ({
  percentage,
  size = 68,
  strokeWidth = 6.5,
  color = 'emerald',
  label,
  sublabel,
  icon,
}) => {
  const safePercentage = Math.min(Math.max(percentage, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safePercentage / 100) * circumference;
  const theme = colorMap[color] || colorMap.emerald;

  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.track}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.stroke}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {icon ? (
            <div className={`${theme.text}`}>{icon}</div>
          ) : (
            <span className="text-[11px] font-black text-slate-900 leading-none tracking-tight">
              {Math.round(safePercentage)}%
            </span>
          )}
        </div>
      </div>

      {(label || sublabel) && (
        <div className="min-w-0">
          {label && <div className="text-xs font-black text-slate-900 truncate">{label}</div>}
          {sublabel && <div className="text-[10px] text-slate-400 font-medium truncate">{sublabel}</div>}
        </div>
      )}
    </div>
  );
};
