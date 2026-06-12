"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ModeShiftChart({
  data,
}: {
  data: Array<{ label: string; total: number }>;
}) {
  return (
    <div className="h-72 rounded-[28px] border border-[var(--color-app-border)] bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-slate-900">Peralihan moda terbanyak</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" tickLine={false} axisLine={false} />
          <YAxis dataKey="label" type="category" width={120} tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey="total" fill="#0f172a" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
