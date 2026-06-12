"use server";

import { redirect } from "next/navigation";

import { requireUser } from "@/auth";
import { db } from "@/lib/db";
import { applyUserScope, resolveScope } from "@/lib/scope";
import { createNotification } from "@/features/notifications/create-notification";

export async function processRedemption(formData: FormData) {
  const admin = await requireUser(["ADMIN_RT", "ADMIN_RW"]);
  const redemptionId = String(formData.get("redemptionId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const notes = String(formData.get("notes") ?? "");

  const scope = resolveScope(admin);
  const redemption = await db.rewardRedemption.findFirst({
    where: {
      id: redemptionId,
      user: applyUserScope(scope),
    },
    include: {
      reward: true,
      user: true,
    },
  });

  if (!redemption) {
    throw new Error("Redemption tidak ditemukan.");
  }

  await db.$transaction(async (tx) => {
    if (decision === "reject" && redemption.status !== "REJECTED") {
      await tx.reward.update({
        where: { id: redemption.rewardId },
        data: { stock: { increment: 1 } },
      });

      await tx.pointsLedger.create({
        data: {
          userId: redemption.userId,
          delta: redemption.costPoints,
          reason: `Refund reward: ${redemption.reward.title}`,
          referenceId: redemption.id,
        },
      });

      await tx.user.update({
        where: { id: redemption.userId },
        data: { totalPoints: { increment: redemption.costPoints } },
      });
    }

    await tx.rewardRedemption.update({
      where: { id: redemption.id },
      data: {
        status:
          decision === "approve"
            ? "APPROVED"
            : decision === "fulfill"
              ? "FULFILLED"
              : "REJECTED",
        notes: notes || null,
        processedById: admin.id,
        processedAt: new Date(),
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: admin.id,
        action: `REDEMPTION_${decision.toUpperCase()}`,
        entityType: "RewardRedemption",
        entityId: redemption.id,
        detail: notes || null,
      },
    });

    await createNotification({
      userIds: [redemption.userId],
      villageId: admin.villageId,
      title: "Status reward diperbarui",
      body:
        decision === "reject"
          ? `Permintaan ${redemption.reward.title} ditolak dan poin Anda dikembalikan.`
          : `Permintaan ${redemption.reward.title} kini berstatus ${decision.toUpperCase()}.`,
      href: "/reward",
      client: tx,
    });
  });

  redirect("/admin/reward?status=updated");
}
