"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function EmissionTrendChart({
  data,
}: {
  data: Array<{ label: string; avoidedEmissionKg: number }>;
}) {
  return (
    <div className="h-72 rounded-[28px] border border-[var(--color-app-border)] bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-slate-900">Tren emisi terhindarkan</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorAvoided" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#0f766e" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#0f766e" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Area type="monotone" dataKey="avoidedEmissionKg" stroke="#0f766e" fill="url(#colorAvoided)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
