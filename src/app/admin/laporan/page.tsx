import { requireUser } from "@/auth";
import { WorkflowHeader } from "@/components/navigation/workflow-header";
import { reviewTransportReport } from "@/features/reports/actions/review-transport-report";
import { db } from "@/lib/db";
import { applyReportScope, resolveScope } from "@/lib/scope";
import { formatDateTime, formatKg } from "@/lib/utils";

export default async function AdminReportsPage() {
  const admin = await requireUser(["ADMIN_RT", "ADMIN_RW"]);
  const reports = await db.transportReport.findMany({
    where: {
      ...applyReportScope(resolveScope(admin)),
      status: "PENDING_REVIEW",
    },
    include: {
      user: true,
      actualMode: true,
      baselineMode: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <WorkflowHeader
        backHref="/admin/dashboard"
        backLabel="Back to Dashboard"
        title="Review laporan anomali"
        description="Validasi laporan warga, lalu kembali ke dashboard atau lanjut ke pengelolaan reward dan pengguna tanpa terputus."
        actions={[
          { href: "/admin/reward", label: "Buka reward" },
          { href: "/admin/pengguna", label: "Lihat pengguna" },
        ]}
      />

      <div className="space-y-4">
        {reports.length ? (
          reports.map((report) => (
            <article key={report.id} className="rounded-[28px] border border-[var(--color-app-border)] bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-950">{report.user.fullName}</p>
                    <p className="mt-1 text-sm text-slate-500">{formatDateTime(report.createdAt)}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Pergeseran moda</p>
                      <p className="mt-2 font-semibold text-slate-900">
                        {report.baselineMode.name} → {report.actualMode.name}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Estimasi hemat</p>
                      <p className="mt-2 font-semibold text-slate-900">{formatKg(report.avoidedEmissionKg)}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Rincian perjalanan</p>
                      <p className="mt-2 font-semibold text-slate-900">
                        {report.distanceKm} km • {report.trips} perjalanan
                      </p>
                    </div>
                  </div>
                  {report.anomalyReason ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      {report.anomalyReason}
                    </div>
                  ) : null}
                </div>

                <div className="flex gap-3">
                  <form action={reviewTransportReport}>
                    <input type="hidden" name="reportId" value={report.id} />
                    <input type="hidden" name="decision" value="approve" />
                    <button
                      type="submit"
                      className="rounded-2xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
                    >
                      Approve
                    </button>
                  </form>
                  <form action={reviewTransportReport}>
                    <input type="hidden" name="reportId" value={report.id} />
                    <input type="hidden" name="decision" value="reject" />
                    <button
                      type="submit"
                      className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                    >
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[28px] border border-[var(--color-app-border)] bg-white p-6 text-sm text-slate-500 shadow-sm">
            Tidak ada laporan yang menunggu review saat ini.
          </div>
        )}
      </div>
    </div>
  );
}
