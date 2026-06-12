import { differenceInCalendarDays } from "date-fns";
import type { Prisma } from "@prisma/client";

import { gamificationConfig } from "@/config/gamification";

export async function awardReportPoints(
  tx: Prisma.TransactionClient,
  params: {
    userId: string;
    reportId: string;
    avoidedEmissionKg: number;
    reportDate: Date;
  },
) {
  if (params.avoidedEmissionKg <= 0) {
    return 0;
  }

  const user = await tx.user.findUniqueOrThrow({
    where: { id: params.userId },
  });

  const basePoints = Math.min(
    gamificationConfig.maxPointsPerReport,
    Math.round(params.avoidedEmissionKg * gamificationConfig.pointMultiplier),
  );

  let nextStreak = user.currentStreak;
  let dailyBonus = 0;
  let streakBonus = 0;

  if (!user.lastReportDate) {
    nextStreak = 1;
    dailyBonus = gamificationConfig.dailyFirstReportBonus;
  } else {
    const dayGap = differenceInCalendarDays(params.reportDate, user.lastReportDate);
    if (dayGap <= 0) {
      nextStreak = user.currentStreak;
    } else if (dayGap === 1) {
      nextStreak = user.currentStreak + 1;
      dailyBonus = gamificationConfig.dailyFirstReportBonus;
    } else {
      nextStreak = 1;
      dailyBonus = gamificationConfig.dailyFirstReportBonus;
    }
  }

  if (nextStreak > 0 && nextStreak % 7 === 0 && dailyBonus > 0) {
    streakBonus = gamificationConfig.weeklyStreakBonus;
  }

  const totalDelta = basePoints + dailyBonus + streakBonus;

  await tx.pointsLedger.create({
    data: {
      userId: params.userId,
      delta: totalDelta,
      reason: "Laporan transport disetujui",
      referenceId: params.reportId,
    },
  });

  await tx.user.update({
    where: { id: params.userId },
    data: {
      totalPoints: { increment: totalDelta },
      currentStreak: nextStreak,
      lastReportDate: params.reportDate,
    },
  });

  return totalDelta;
}
