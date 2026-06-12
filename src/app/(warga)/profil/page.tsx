import { requireUser } from "@/auth";
import { WorkflowHeader } from "@/components/navigation/workflow-header";
import { db } from "@/lib/db";
import { formatDateTime, formatPoint } from "@/lib/utils";

export default async function CitizenProfilePage() {
  const user = await requireUser(["WARGA"]);
  const subscriptions = await db.pushSubscription.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <WorkflowHeader
        backHref="/beranda"
        backLabel="Back to Home"
        title="Profil warga"
        description="Lihat ringkasan akun, perangkat terhubung, dan kembali ke dashboard atau ke fitur aktivitas tanpa putus di tengah alur."
        actions={[
          { href: "/lapor", label: "Tambah aktivitas" },
          { href: "/notifikasi", label: "Buka notifikasi" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-[28px] border border-[var(--color-app-border)] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">{user.fullName}</h2>
        <p className="mt-2 text-sm text-slate-600">{user.email}</p>
        <dl className="mt-6 space-y-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Scope</dt>
            <dd className="font-medium text-slate-900">
              RW {user.rw?.number} / RT {user.rt?.number}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Saldo poin</dt>
            <dd className="font-medium text-slate-900">{formatPoint(user.totalPoints)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Streak</dt>
            <dd className="font-medium text-slate-900">{user.currentStreak} hari</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Gabung</dt>
            <dd className="font-medium text-slate-900">{formatDateTime(user.createdAt)}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-[28px] border border-[var(--color-app-border)] bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Perangkat terhubung</h3>
        <div className="mt-4 space-y-3">
          {subscriptions.length ? (
            subscriptions.map((subscription) => (
              <article key={subscription.id} className="rounded-2xl border border-[var(--color-app-border)] p-4">
                <p className="text-sm font-medium text-slate-900">{subscription.endpoint}</p>
                <p className="mt-1 text-xs text-slate-500">Ditambahkan {formatDateTime(subscription.createdAt)}</p>
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-500">Belum ada browser yang terdaftar untuk web push.</p>
          )}
        </div>
      </section>
      </div>
    </div>
  );
}
