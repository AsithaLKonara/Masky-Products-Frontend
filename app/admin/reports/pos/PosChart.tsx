"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PosChartProps {
  data: any[];
}

export default function PosChart({ data }: PosChartProps) {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.7} />
          <XAxis dataKey="terminalName" stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} dy={5} />
          <YAxis stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `Rs.${val/1000}k`} />
          <Tooltip 
            cursor={{ fill: 'var(--surface-elevated)', opacity: 0.4 }}
            contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--foreground)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}
            formatter={(value: any) => [`Rs. ${Number(value).toLocaleString()}`, 'Revenue']}
          />
          <defs>
            <linearGradient id="colorPosRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={1}/>
              <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.8}/>
            </linearGradient>
          </defs>
          <Bar dataKey="revenue" fill="url(#colorPosRevenue)" radius={[4, 4, 0, 0]} maxBarSize={60} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
