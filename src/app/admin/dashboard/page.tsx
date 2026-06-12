import { Activity, ShieldAlert, Sparkles, Users } from "lucide-react";

import { requireUser } from "@/auth";
import { EmissionTrendChart } from "@/components/charts/emission-trend-chart";
import { ModeShiftChart } from "@/components/charts/mode-shift-chart";
import { getAdminDashboard } from "@/features/analytics/get-admin-dashboard";
import { formatDateTime, formatKg } from "@/lib/utils";
import { resolveScope } from "@/lib/scope";

export default async function AdminDashboardPage() {
  const admin = await requireUser(["ADMIN_RT", "ADMIN_RW"]);
  const dashboard = await getAdminDashboard(resolveScope(admin));

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            icon: Activity,
            label: "Laporan approved",
            value: dashboard.approvedReports,
          },
          {
            icon: Sparkles,
            label: "Estimasi emisi terhindarkan",
            value: formatKg(dashboard.totalAvoidedEmissionKg),
          },
          {
            icon: Users,
            label: "Warga aktif",
            value: dashboard.activeCitizens,
          },
          {
            icon: ShieldAlert,
            label: "Pending review",
            value: dashboard.pendingReview.length,
          },
        ].map((card) => (
          <article key={card.label} className="rounded-[28px] border border-[var(--color-app-border)] bg-white p-5 shadow-sm">
            <card.icon className="h-5 w-5 text-teal-700" />
            <p className="mt-4 text-sm text-slate-500">{card.label}</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{card.value}</h2>
          </article>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <EmissionTrendChart data={dashboard.emissionTrend} />
        <ModeShiftChart data={dashboard.modeShift} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <section className="rounded-[28px] border border-[var(--color-app-border)] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-slate-900">Antrean review laporan</h3>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              {dashboard.pendingReview.length} item
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {dashboard.pendingReview.length ? (
              dashboard.pendingReview.slice(0, 6).map((report) => (
                <article key={report.id} className="rounded-2xl border border-[var(--color-app-border)] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{report.user.fullName}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                        {report.baselineMode.name} → {report.actualMode.name}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500">{formatDateTime(report.createdAt)}</span>
                  </div>
                  {report.anomalyReason ? (
                    <p className="mt-3 text-sm leading-6 text-slate-600">{report.anomalyReason}</p>
                  ) : null}
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-500">Tidak ada laporan yang menunggu review.</p>
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-[var(--color-app-border)] bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Redemption terbaru</h3>
          <div className="mt-4 space-y-3">
            {dashboard.redemptions.length ? (
              dashboard.redemptions.map((redemption) => (
                <article key={redemption.id} className="rounded-2xl border border-[var(--color-app-border)] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{redemption.reward.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{redemption.user.fullName}</p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{redemption.status}</span>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-500">Belum ada penukaran reward terbaru.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
