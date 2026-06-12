import { requireUser } from "@/auth";
import { WorkflowHeader } from "@/components/navigation/workflow-header";
import { RewardCard } from "@/components/rewards/reward-card";
import { db } from "@/lib/db";
import { formatDateTime, formatPoint } from "@/lib/utils";

export default async function CitizenRewardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireUser(["WARGA"]);
  const params = await searchParams;
  const [rewards, redemptions] = await Promise.all([
    db.reward.findMany({
      where: {
        villageId: user.villageId,
        isActive: true,
      },
      orderBy: [{ costPoints: "asc" }],
    }),
    db.rewardRedemption.findMany({
      where: { userId: user.id },
      include: { reward: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const statusMessage =
    params.status === "redeemed"
      ? "Permintaan reward berhasil dibuat."
      : params.status === "poin-kurang"
        ? "Poin Anda belum cukup untuk reward tersebut."
        : params.status === "stok-habis"
          ? "Stok reward sedang habis."
          : null;

  return (
    <div className="space-y-6">
      {statusMessage ? (
        <div className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">{statusMessage}</div>
      ) : null}
      <WorkflowHeader
        backHref="/beranda"
        backLabel="Back to Home"
        title="Reward dan penukaran"
        description="Lihat hadiah yang tersedia, cek saldo poin, lalu kembali ke dashboard atau tambah aktivitas baru bila poin masih kurang."
        actions={[
          { href: "/lapor", label: "Tambah aktivitas" },
          { href: "/riwayat", label: "Cek riwayat" },
        ]}
      />

      <section className="rounded-[28px] border border-[var(--color-app-border)] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Katalog reward internal</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Saldo Anda saat ini: {formatPoint(user.totalPoints)}.</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rewards.map((reward) => (
            <RewardCard key={reward.id} reward={reward} />
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--color-app-border)] bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Riwayat penukaran</h3>
        <div className="mt-4 space-y-3">
          {redemptions.map((redemption) => (
            <article key={redemption.id} className="rounded-2xl border border-[var(--color-app-border)] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">{redemption.reward.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{formatDateTime(redemption.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{formatPoint(redemption.costPoints)}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{redemption.status}</p>
                </div>
              </div>
              {redemption.notes ? <p className="mt-3 text-sm text-slate-600">{redemption.notes}</p> : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
