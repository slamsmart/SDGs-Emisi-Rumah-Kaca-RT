import type { Prisma } from "@prisma/client";

import { achievementDefinitions } from "@/config/achievements";

export async function awardAchievements(tx: Prisma.TransactionClient, userId: string) {
  const [user, approvedReports, existingAwards] = await Promise.all([
    tx.user.findUniqueOrThrow({ where: { id: userId } }),
    tx.transportReport.count({
      where: { userId, status: "APPROVED" },
    }),
    tx.achievementAward.findMany({
      where: { userId },
      select: { code: true },
    }),
  ]);

  const existingCodes = new Set(existingAwards.map((item) => item.code));
  const newAwards = achievementDefinitions.filter((achievement) => {
    if (existingCodes.has(achievement.code)) return false;

    if (achievement.kind === "reports") {
      return approvedReports >= achievement.threshold;
    }

    if (achievement.kind === "points") {
      return user.totalPoints >= achievement.threshold;
    }

    return user.currentStreak >= achievement.threshold;
  });

  if (!newAwards.length) return [];

  await tx.achievementAward.createMany({
    data: newAwards.map((achievement) => ({
      userId,
      code: achievement.code,
      title: achievement.title,
      description: achievement.description,
    })),
  });

  return newAwards;
}
