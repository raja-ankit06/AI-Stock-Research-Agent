import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  changePercent?: number;
  subtext?: string;
  variant?: 'neutral' | 'bullish' | 'bearish' | 'warning';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  changePercent,
  subtext,
  variant = 'neutral',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'bullish':
        return 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400';
      case 'bearish':
        return 'border-red-500/20 bg-red-500/5 text-red-400';
      case 'warning':
        return 'border-amber-500/20 bg-amber-500/5 text-amber-400';
      default:
        return 'border-[#1F293D] bg-[#111827] text-gray-200';
    }
  };

  return (
    <div className={`p-4 rounded border transition ${getVariantStyles()}`}>
      <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5 font-medium">
        <span>{title}</span>
        {changePercent !== undefined && (
          <span
            className={`inline-flex items-center font-mono text-[11px] font-semibold ${
              changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {changePercent >= 0 ? (
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            )}
            {changePercent >= 0 ? '+' : ''}
            {changePercent.toFixed(2)}%
          </span>
        )}
      </div>
      <div className="font-mono text-xl lg:text-2xl font-bold tracking-tight text-white">
        {value}
      </div>
      {subtext && <div className="text-[11px] text-gray-400 mt-1 font-mono">{subtext}</div>}
    </div>
  );
};

