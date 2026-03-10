'use client';

import { mockScenarios } from '@/data/mockData';
import { formatCurrency } from '@/lib/utils';
import { TrendingDown, TrendingUp, AlertCircle, Activity, BarChart3, Zap } from 'lucide-react';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const getScenarioIcon = (type: string) => {
  switch (type) {
    case 'market_crash': return TrendingDown;
    case 'inflation': return Activity;
    case 'recession': return AlertCircle;
    case 'bull_market': return TrendingUp;
    default: return BarChart3;
  }
};

const getRiskColor = (level: string) => {
  switch (level) {
    case 'high': return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', bar: '#EF4444' };
    case 'medium': return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', bar: '#F59E0B' };
    case 'low': return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: '#10B981' };
    default: return { text: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', bar: '#6B7280' };
  }
};

export default function ScenarioAnalysis() {
  const [selectedScenario, setSelectedScenario] = useState(mockScenarios[0]);

  const chartData = mockScenarios.map(s => ({
    name: s.name.split(' ')[0],
    impact: s.projectedImpact,
    fullName: s.name,
  }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof chartData[0] }> }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-100">
          <p className="font-semibold text-gray-900">{item.fullName}</p>
          <p className={`text-sm font-medium ${item.impact >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {item.impact >= 0 ? '+' : ''}{formatCurrency(item.impact)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Scenario Analysis</h2>
          <p className="text-sm text-gray-500">Understand how your portfolio responds to market conditions</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg">
          <Zap className="w-4 h-4" />
          <span className="text-sm font-medium">AI-Powered</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[200px] mb-6" style={{ minWidth: 0, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
            <XAxis 
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              tickFormatter={(value) => `${value >= 0 ? '+' : ''}${(value / 1000)}K`}
            />
            <YAxis 
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="impact" 
              radius={[0, 4, 4, 0]}
              onClick={(data, index) => {
                const scenario = mockScenarios[index];
                if (scenario) setSelectedScenario(scenario);
              }}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.impact >= 0 ? '#10B981' : '#EF4444'}
                  cursor="pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Selected Scenario Details */}
      {selectedScenario && (
        <div className={`p-4 rounded-xl ${getRiskColor(selectedScenario.riskLevel).bg} border ${getRiskColor(selectedScenario.riskLevel).border}`}>
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-white shadow-sm">
              {(() => {
                const Icon = getScenarioIcon(selectedScenario.type);
                return <Icon className={`w-5 h-5 ${getRiskColor(selectedScenario.riskLevel).text}`} />;
              })()}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{selectedScenario.name}</h3>
                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getRiskColor(selectedScenario.riskLevel).bg} ${getRiskColor(selectedScenario.riskLevel).text} border ${getRiskColor(selectedScenario.riskLevel).border}`}>
                  {selectedScenario.riskLevel.charAt(0).toUpperCase() + selectedScenario.riskLevel.slice(1)} Risk
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{selectedScenario.description}</p>
              
              <div className="flex items-center gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Projected Impact</p>
                  <p className={`text-xl font-bold ${selectedScenario.projectedImpact >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {selectedScenario.projectedImpact >= 0 ? '+' : ''}{formatCurrency(selectedScenario.projectedImpact)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Recommendations:</p>
                <ul className="space-y-1">
                  {selectedScenario.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-gray-400 mt-0.5">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scenario Selector */}
      <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
        {mockScenarios.map((scenario) => {
          const Icon = getScenarioIcon(scenario.type);
          const isSelected = selectedScenario?.id === scenario.id;
          
          return (
            <button
              key={scenario.id}
              onClick={() => setSelectedScenario(scenario)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {scenario.name.split('(')[0].trim()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
