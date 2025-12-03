import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface AnalysisChartProps {
  groundedCount: number;
  unverifiedCount: number; // For demo purposes, we can estimate this based on text length vs chunks
}

export const AnalysisChart: React.FC<AnalysisChartProps> = ({ groundedCount, unverifiedCount }) => {
  const data = [
    { name: '已验证知识', value: groundedCount },
    { name: '潜在盲点', value: unverifiedCount },
  ];

  const COLORS = ['#3b82f6', '#475569']; // Blue-500, Slate-600

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};