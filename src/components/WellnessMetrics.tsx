'use client';

import { getScoreColor, getScoreBgColor } from '@/lib/utils';
import { buildHealthIndicators } from '@/lib/wellness';
import { TrendingUp, TrendingDown, Minus, ChevronRight, Activity, Shield, Droplets, Brain, Target } from 'lucide-react';
import type { Asset } from '@/types';

type WellnessMetricsProps = {
  assets: Asset[];
};

const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
  switch (trend) {
    case 'up': return TrendingUp;
    case 'down': return TrendingDown;
    default: return Minus;
  }
};

const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
  switch (trend) {
    case 'up': return 'text-emerald-500';
    case 'down': return 'text-red-500';
    default: return 'text-gray-400';
  }
};

const getMetricIcon = (name: string) => {
  if (name.includes('Diversification')) return Shield;
  if (name.includes('Liquidity')) return Droplets;
  if (name.includes('Risk')) return Activity;
  if (name.includes('Tax')) return Target;
  return Brain;
};

export default function WellnessMetrics({ assets }: WellnessMetricsProps) {
  const { overallScore, healthIndicators } = buildHealthIndicators(assets);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Financial Wellness Metrics</h2>
          <p className="text-sm text-gray-500">Key health indicators for your portfolio</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
            {overallScore}
          </div>
          <div className="text-sm text-gray-500">
            <div>Overall</div>
            <div>Score</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {healthIndicators.map((metric) => {
          const TrendIcon = getTrendIcon(metric.trend);
          const MetricIcon = getMetricIcon(metric.name);
          const statusColors = {
            excellent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            good: 'bg-blue-50 text-blue-700 border-blue-200',
            fair: 'bg-amber-50 text-amber-700 border-amber-200',
            poor: 'bg-red-50 text-red-700 border-red-200',
          };

          return (
            <div
              key={metric.name}
              className="group p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${getScoreBgColor(metric.score)} bg-opacity-10`}>
                  <MetricIcon className={`w-5 h-5 ${getScoreColor(metric.score)}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">{metric.name}</h3>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${statusColors[metric.status]}`}>
                        {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                      </span>
                      <TrendIcon className={`w-4 h-4 ${getTrendColor(metric.trend)}`} />
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-500">{metric.description}</span>
                      <span className={`font-semibold ${getScoreColor(metric.score)}`}>
                        {metric.score}/100
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getScoreBgColor(metric.score)} transition-all duration-500`}
                        style={{ width: `${metric.score}%` }}
                      />
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
