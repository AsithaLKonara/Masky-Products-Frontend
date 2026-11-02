"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface PromotionsChartProps {
  data: any[];
}

export default function PromotionsChart({ data }: PromotionsChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.7} />
          <XAxis dataKey="name" stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} dy={5} />
          <YAxis stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip 
            cursor={{ fill: 'var(--surface-elevated)', opacity: 0.4 }}
            contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--foreground)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}
          />
          <Legend iconType="circle" />
          <Bar dataKey="Issued" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={45} />
          <Bar dataKey="Used" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={45} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
