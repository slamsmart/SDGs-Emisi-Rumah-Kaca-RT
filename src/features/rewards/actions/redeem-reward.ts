"use server";

import { redirect } from "next/navigation";

import { requireUser } from "@/auth";
import { db } from "@/lib/db";
import { createNotification } from "@/features/notifications/create-notification";

export async function redeemReward(formData: FormData) {
  const user = await requireUser(["WARGA"]);
  const rewardId = String(formData.get("rewardId") ?? "");

  const reward = await db.reward.findFirst({
    where: {
      id: rewardId,
      villageId: user.villageId,
      isActive: true,
    },
  });

  if (!reward) {
    throw new Error("Reward tidak ditemukan.");
  }

  if (reward.stock <= 0) {
    redirect("/reward?status=stok-habis");
  }

  if (user.totalPoints < reward.costPoints) {
    redirect("/reward?status=poin-kurang");
  }

  await db.$transaction(async (tx) => {
    await tx.reward.update({
      where: { id: reward.id },
      data: { stock: { decrement: 1 } },
    });

    await tx.rewardRedemption.create({
      data: {
        rewardId: reward.id,
        userId: user.id,
        costPoints: reward.costPoints,
      },
    });

    await tx.pointsLedger.create({
      data: {
        userId: user.id,
        delta: -reward.costPoints,
        reason: `Redeem reward: ${reward.title}`,
        referenceId: reward.id,
      },
    });

    await tx.user.update({
      where: { id: user.id },
      data: {
        totalPoints: { decrement: reward.costPoints },
      },
    });

    await createNotification({
      userIds: [user.id],
      villageId: user.villageId,
      title: "Permintaan reward diterima",
      body: `${reward.title} sedang menunggu proses admin.`,
      href: "/reward",
      client: tx,
    });
  });

  redirect("/reward?status=redeemed");
}
