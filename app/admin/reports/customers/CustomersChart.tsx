"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface CustomersChartProps {
  data: any[];
}

export default function CustomersChart({ data }: CustomersChartProps) {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" strokeOpacity={0.7} />
          <XAxis type="number" stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `Rs.${val/1000}k`} />
          <YAxis dataKey="name" type="category" stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} width={100} />
          <Tooltip 
            cursor={{ fill: 'var(--surface-elevated)', opacity: 0.4 }}
            contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--foreground)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}
            formatter={(value: any) => [`Rs. ${Number(value).toLocaleString()}`, 'Lifetime Spent']}
          />
          <defs>
            <linearGradient id="colorSpent" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="100%" stopColor="#2563EB" stopOpacity={1}/>
            </linearGradient>
          </defs>
          <Bar dataKey="spent" fill="url(#colorSpent)" radius={[0, 4, 4, 0]} barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
