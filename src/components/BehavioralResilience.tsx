'use client';

import { mockFinancialWellness } from '@/data/mockData';
import { getScoreColor, getScoreBgColor } from '@/lib/utils';
import { Brain, Activity, RefreshCw, Heart, Gauge } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

export default function BehavioralResilience() {
  const { behavioralResilience } = mockFinancialWellness;

  const metrics = [
    {
      label: 'Volatility Tolerance',
      value: behavioralResilience.volatilityTolerance,
      icon: Activity,
      description: 'Your ability to stay calm during market swings',
    },
    {
      label: 'Emotional Bias',
      value: behavioralResilience.emotionalBiasScore,
      icon: Heart,
      description: 'Resistance to fear and greed-driven decisions',
    },
    {
      label: 'Decision Consistency',
      value: behavioralResilience.decisionConsistency,
      icon: Gauge,
      description: 'Following your investment strategy consistently',
    },
  ];

  const chartData = [{ value: behavioralResilience.score, fill: '#6366F1' }];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Behavioral Resilience</h2>
          <p className="text-sm text-gray-500">Your emotional and psychological investment health</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg">
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm font-medium">{behavioralResilience.rebalancingFrequency}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Radial Chart */}
        <div className="relative flex-shrink-0">
          <div className="w-40 h-40" style={{ minWidth: 0, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="100%"
                barSize={12}
                data={chartData}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  background={{ fill: '#E5E7EB' }}
                  dataKey="value"
                  cornerRadius={6}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Brain className={`w-6 h-6 ${getScoreColor(behavioralResilience.score)} mb-1`} />
            <span className={`text-2xl font-bold ${getScoreColor(behavioralResilience.score)}`}>
              {behavioralResilience.score}
            </span>
            <span className="text-xs text-gray-400">Score</span>
          </div>
        </div>

        {/* Metrics */}
        <div className="flex-1 space-y-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${getScoreBgColor(metric.value)} bg-opacity-10`}>
                <metric.icon className={`w-4 h-4 ${getScoreColor(metric.value)}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                  <span className={`text-sm font-bold ${getScoreColor(metric.value)}`}>
                    {metric.value}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getScoreBgColor(metric.value)} transition-all duration-500`}
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-sm font-medium text-gray-700 mb-3">Improvement Tips</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {behavioralResilience.recommendations.map((rec, index) => (
            <div 
              key={index}
              className="px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-600"
            >
              {rec}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
