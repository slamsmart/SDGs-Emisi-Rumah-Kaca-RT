import { requireUser } from "@/auth";
import { WorkflowHeader } from "@/components/navigation/workflow-header";
import { db } from "@/lib/db";

export default async function AdminNotificationsPage() {
  const admin = await requireUser(["ADMIN_RT", "ADMIN_RW"]);
  const notifications = await db.notification.findMany({
    where: {
      villageId: admin.villageId,
      userId: null,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <WorkflowHeader
        backHref="/admin/dashboard"
        backLabel="Back to Dashboard"
        title="Broadcast dan notifikasi"
        description="Buka riwayat notifikasi desa, lalu kembali ke dashboard atau lanjut ke reward dan review laporan tanpa berhenti di tengah workflow."
        actions={[
          { href: "/admin/reward", label: "Buka reward" },
          { href: "/admin/laporan", label: "Review laporan" },
        ]}
      />
      <section className="rounded-[28px] border border-[var(--color-app-border)] bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-950">Broadcast program</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Riwayat notifikasi broadcast tingkat desa yang tampil di notification center warga.
        </p>
        <div className="mt-5 rounded-2xl border border-dashed border-[var(--color-app-border)] bg-slate-50 p-4 text-sm text-slate-500">
          Pada iterasi berikutnya, halaman ini dapat diperluas menjadi form broadcast dan template true story.
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--color-app-border)] bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-950">Riwayat notifikasi umum</h3>
        <div className="mt-5 space-y-3">
          {notifications.length ? (
            notifications.map((notification) => (
              <article key={notification.id} className="rounded-2xl border border-[var(--color-app-border)] p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-slate-900">{notification.title}</p>
                  <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{notification.channel}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{notification.body}</p>
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-500">Belum ada notifikasi broadcast tingkat desa.</p>
          )}
        </div>
      </section>
    </div>
  );
}
