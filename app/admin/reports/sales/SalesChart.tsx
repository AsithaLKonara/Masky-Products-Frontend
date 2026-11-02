"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface SalesChartProps {
  data: any[];
}

export default function SalesChart({ data }: SalesChartProps) {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorEcom" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.7} />
          <XAxis dataKey="date" stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} dy={5} />
          <YAxis stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `Rs.${val/1000}k`} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--foreground)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}
            formatter={(value: any) => [`Rs. ${Number(value).toLocaleString()}`, undefined]}
          />
          <Legend iconType="circle" />
          <Area type="monotone" name="Ecommerce" dataKey="ecommerceRevenue" stroke="#3B82F6" fillOpacity={1} fill="url(#colorEcom)" strokeWidth={2.5} activeDot={{ r: 6 }} />
          <Area type="monotone" name="POS" dataKey="posRevenue" stroke="#10B981" fillOpacity={1} fill="url(#colorPos)" strokeWidth={2.5} activeDot={{ r: 6 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
