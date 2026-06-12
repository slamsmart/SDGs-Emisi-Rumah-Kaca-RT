import { requireUser } from "@/auth";
import { WorkflowHeader } from "@/components/navigation/workflow-header";
import { db } from "@/lib/db";

export default async function AdminMasterDataPage() {
  const admin = await requireUser(["ADMIN_RT", "ADMIN_RW"]);
  const [modes, factors] = await Promise.all([
    db.transportMode.findMany({
      where: {
        OR: [{ villageId: null }, { villageId: admin.villageId }],
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    db.emissionFactor.findMany({
      where: {
        transportMode: {
          OR: [{ villageId: null }, { villageId: admin.villageId }],
        },
      },
      include: { transportMode: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <WorkflowHeader
        backHref="/admin/dashboard"
        backLabel="Back to Dashboard"
        title="Master data program"
        description="Kelola moda transport dan faktor emisi, lalu kembali ke dashboard atau masuk ke review laporan dengan konteks yang tetap utuh."
        actions={[
          { href: "/admin/laporan", label: "Review laporan" },
          { href: "/admin/pengguna", label: "Lihat pengguna" },
        ]}
      />
      <section className="rounded-[28px] border border-[var(--color-app-border)] bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-950">Master moda transport</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modes.map((mode) => (
            <article key={mode.id} className="rounded-2xl border border-[var(--color-app-border)] p-4">
              <p className="font-semibold text-slate-900">{mode.name}</p>
              <p className="mt-1 text-sm text-slate-500">{mode.category}</p>
              <p className="mt-3 text-sm text-slate-600">Okupansi default: {mode.defaultOccupancy ?? "-"}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                {mode.isActive ? "Aktif" : "Nonaktif"}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--color-app-border)] bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-950">Faktor emisi aktif</h3>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Moda</th>
                <th className="px-4 py-3 font-medium">Unit</th>
                <th className="px-4 py-3 font-medium">kg CO2e / km</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Sumber</th>
              </tr>
            </thead>
            <tbody>
              {factors.map((factor) => (
                <tr key={factor.id} className="border-t border-[var(--color-app-border)]">
                  <td className="px-4 py-3 font-medium text-slate-900">{factor.transportMode.name}</td>
                  <td className="px-4 py-3 text-slate-700">{factor.unit}</td>
                  <td className="px-4 py-3 text-slate-700">{factor.kgCo2ePerKm.toFixed(3)}</td>
                  <td className="px-4 py-3 text-slate-700">{factor.isActive ? "Aktif" : "Nonaktif"}</td>
                  <td className="px-4 py-3 text-slate-700">{factor.sourceNote ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
