'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { mockHistoricalData } from '@/data/mockData';
import { formatCompactNumber } from '@/lib/utils';
import { useState } from 'react';

type TimeRange = '3M' | '6M' | '1Y' | 'ALL';

export default function WealthTrend() {
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y');
  const [showWellness, setShowWellness] = useState(true);

  const getFilteredData = () => {
    const monthsMap: Record<TimeRange, number> = {
      '3M': 3,
      '6M': 6,
      '1Y': 12,
      'ALL': mockHistoricalData.length,
    };
    return mockHistoricalData.slice(-monthsMap[timeRange]);
  };

  const data = getFilteredData();

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-100">
          <p className="text-sm text-gray-500 mb-2">{label}</p>
          {payload.map((item) => (
            <p key={item.dataKey} className="text-sm">
              <span className="font-medium text-gray-900">
                {item.dataKey === 'totalValue' ? 'Wealth: ' : 'Wellness: '}
              </span>
              <span className={item.dataKey === 'totalValue' ? 'text-indigo-600' : 'text-emerald-600'}>
                {item.dataKey === 'totalValue' 
                  ? formatCompactNumber(item.value)
                  : `${item.value}/100`
                }
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Wealth & Wellness Trend</h2>
          <p className="text-sm text-gray-500">Track your financial health over time</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowWellness(!showWellness)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              showWellness 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Wellness Score
          </button>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(['3M', '6M', '1Y', 'ALL'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[280px]" style={{ minWidth: 0, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorWellness" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
            />
            <YAxis 
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              tickFormatter={(value) => formatCompactNumber(value)}
            />
            {showWellness && (
              <YAxis 
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#9CA3AF' }}
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="totalValue"
              stroke="#6366F1"
              strokeWidth={2}
              fill="url(#colorValue)"
            />
            {showWellness && (
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="wellnessScore"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#colorWellness)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-500" />
          <span className="text-sm text-gray-600">Total Wealth</span>
        </div>
        {showWellness && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-sm text-gray-600">Wellness Score</span>
          </div>
        )}
      </div>
    </div>
  );
}
