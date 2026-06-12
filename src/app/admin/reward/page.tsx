import { requireUser } from "@/auth";
import { WorkflowHeader } from "@/components/navigation/workflow-header";
import { processRedemption } from "@/features/rewards/actions/process-redemption";
import { db } from "@/lib/db";
import { applyUserScope, resolveScope } from "@/lib/scope";
import { formatDateTime, formatPoint } from "@/lib/utils";

export default async function AdminRewardPage() {
  const admin = await requireUser(["ADMIN_RT", "ADMIN_RW"]);
  const scope = resolveScope(admin);
  const [rewards, redemptions] = await Promise.all([
    db.reward.findMany({
      where: { villageId: admin.villageId },
      orderBy: [{ isActive: "desc" }, { costPoints: "asc" }],
    }),
    db.rewardRedemption.findMany({
      where: {
        user: applyUserScope(scope),
      },
      include: {
        reward: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <WorkflowHeader
        backHref="/admin/dashboard"
        backLabel="Back to Dashboard"
        title="Reward program"
        description="Kelola katalog reward dan proses penukaran warga, lalu lanjut ke review laporan atau kembali ke dashboard utama."
        actions={[
          { href: "/admin/laporan", label: "Review laporan" },
          { href: "/admin/notifikasi", label: "Buka broadcast" },
        ]}
      />
      <section className="rounded-[28px] border border-[var(--color-app-border)] bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-950">Katalog reward program</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rewards.map((reward) => (
            <article key={reward.id} className="rounded-2xl border border-[var(--color-app-border)] p-4">
              <p className="font-semibold text-slate-900">{reward.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{reward.description}</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="font-semibold text-teal-700">{formatPoint(reward.costPoints)}</span>
                <span className="text-slate-500">Stok {reward.stock}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--color-app-border)] bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-950">Permintaan penukaran</h3>
        <div className="mt-5 space-y-4">
          {redemptions.length ? (
            redemptions.map((redemption) => (
              <article key={redemption.id} className="rounded-2xl border border-[var(--color-app-border)] p-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{redemption.reward.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{redemption.user.fullName}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDateTime(redemption.createdAt)}</p>
                    <p className="mt-3 text-sm text-slate-600">Nilai redeem: {formatPoint(redemption.costPoints)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <form action={processRedemption} className="flex gap-2">
                      <input type="hidden" name="redemptionId" value={redemption.id} />
                      <input type="hidden" name="decision" value="approve" />
                      <button
                        type="submit"
                        className="rounded-2xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
                      >
                        Approve
                      </button>
                    </form>
                    <form action={processRedemption} className="flex gap-2">
                      <input type="hidden" name="redemptionId" value={redemption.id} />
                      <input type="hidden" name="decision" value="fulfill" />
                      <button
                        type="submit"
                        className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                      >
                        Fulfill
                      </button>
                    </form>
                    <form action={processRedemption} className="flex gap-2">
                      <input type="hidden" name="redemptionId" value={redemption.id} />
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
            <p className="text-sm text-slate-500">Belum ada permintaan reward dari warga.</p>
          )}
        </div>
      </section>
    </div>
  );
}
