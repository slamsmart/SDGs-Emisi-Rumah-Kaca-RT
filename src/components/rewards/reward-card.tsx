import { redeemReward } from "@/features/rewards/actions/redeem-reward";
import { formatPoint } from "@/lib/utils";

export function RewardCard({
  reward,
}: {
  reward: {
    id: string;
    title: string;
    description: string;
    costPoints: number;
    stock: number;
    isActive: boolean;
  };
}) {
  return (
    <article className="rounded-[28px] border border-[var(--color-app-border)] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{reward.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{reward.description}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          Stok {reward.stock}
        </span>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Biaya</p>
          <p className="mt-1 text-xl font-semibold text-teal-700">{formatPoint(reward.costPoints)}</p>
        </div>
        <form action={redeemReward}>
          <input type="hidden" name="rewardId" value={reward.id} />
          <button
            type="submit"
            disabled={!reward.isActive || reward.stock <= 0}
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition enabled:hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            Tukar reward
          </button>
        </form>
      </div>
    </article>
  );
}
