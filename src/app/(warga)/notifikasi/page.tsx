import { requireUser } from "@/auth";
import { WorkflowHeader } from "@/components/navigation/workflow-header";
import { PushOptInCard } from "@/components/notifications/push-opt-in-card";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { formatDateTime } from "@/lib/utils";

export default async function CitizenNotificationPage() {
  const user = await requireUser(["WARGA"]);
  const notifications = await db.notification.findMany({
    where: {
      OR: [{ userId: user.id }, { userId: null, villageId: user.villageId }],
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <WorkflowHeader
        backHref="/beranda"
        backLabel="Back to Home"
        title="Notification center"
        description="Buka update program, pengingat, dan notifikasi sistem tanpa kehilangan akses cepat kembali ke dashboard atau aktivitas warga."
        actions={[
          { href: "/lapor", label: "Tambah aktivitas" },
          { href: "/riwayat", label: "Lihat riwayat" },
        ]}
      />
      <PushOptInCard vapidPublicKey={env.NEXT_PUBLIC_VAPID_PUBLIC_KEY} />
      <section className="rounded-[28px] border border-[var(--color-app-border)] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Notification center</h2>
        <div className="mt-5 space-y-3">
          {notifications.map((notification) => (
            <article key={notification.id} className="rounded-2xl border border-[var(--color-app-border)] p-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-semibold text-slate-900">{notification.title}</h3>
                <span className="text-xs text-slate-500">{formatDateTime(notification.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{notification.body}</p>
              {notification.href ? (
                <a href={notification.href} className="mt-3 inline-flex text-sm font-semibold text-teal-700">
                  Buka halaman terkait
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
