"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface BranchesChartProps {
  data: any[];
}

export default function BranchesChart({ data }: BranchesChartProps) {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} layout="vertical">
          <defs>
            <linearGradient id="colorBranchRev" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="100%" stopColor="#2563EB" stopOpacity={1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" strokeOpacity={0.7} />
          <XAxis type="number" stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `Rs.${val/1000}k`} />
          <YAxis dataKey="branchName" type="category" stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} width={120} />
          <Tooltip 
            cursor={{ fill: 'var(--surface-elevated)', opacity: 0.4 }}
            contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--foreground)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}
            formatter={(value: any) => [`Rs. ${Number(value).toLocaleString()}`, "Revenue"]}
          />
          <Bar dataKey="revenue" fill="url(#colorBranchRev)" radius={[0, 4, 4, 0]} barSize={26} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
