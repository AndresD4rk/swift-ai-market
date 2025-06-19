
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ActiveSession {
  product_id: number;
  product_name: string;
  active_sessions: number;
}

interface ActiveSessionsChartProps {
  sessions: ActiveSession[];
  isLoading: boolean;
}

const ActiveSessionsChart = ({ sessions, isLoading }: ActiveSessionsChartProps) => {
  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-400" />
            Sesiones Activas por Producto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = sessions
    .filter(session => Number(session.active_sessions) > 0)
    .map(session => ({
      name: session.product_name.length > 15 
        ? session.product_name.substring(0, 15) + '...' 
        : session.product_name,
      sessions: Number(session.active_sessions),
      fullName: session.product_name
    }));

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Activity className="w-5 h-5 mr-2 text-green-400" />
          Sesiones Activas por Producto
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <Activity className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No hay sesiones activas en este momento</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#9CA3AF" 
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value, name, props) => [
                  `${value} sesiones`,
                  props.payload.fullName
                ]}
              />
              <Bar 
                dataKey="sessions" 
                fill="#10b981" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveSessionsChart;
