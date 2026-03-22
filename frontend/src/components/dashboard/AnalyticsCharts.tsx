import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export interface ChartData {
  name: string;
  value: number;
}

interface AnalyticsChartsProps {
  pieChartData: ChartData[];
  barChartData: ChartData[];
  pieChartTitle: string;
  barChartTitle: string;
}

const COLORS = ['#6366f1', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#14b8a6'];

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  pieChartData,
  barChartData,
  pieChartTitle,
  barChartTitle
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Dynamic Pie Chart */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6 font-sans">{pieChartTitle}</h3>
        <div className="h-[300px] w-full">
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieChartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                  }} 
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">No data available</div>
          )}
        </div>
      </div>

      {/* Dynamic Bar Chart */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6 font-sans">{barChartTitle}</h3>
        <div className="h-[300px] w-full">
          {barChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                  }} 
                />
                <Bar 
                  dataKey="value" 
                  fill="#3b82f6" 
                  radius={[8, 8, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex items-center justify-center h-full text-slate-400">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
