import { getLevelFromPoints } from "@/config/gamification";
import { db } from "@/lib/db";

export async function getCitizenDashboard(userId: string) {
  const [user, reports, recentReports, ledger, achievements, notifications] = await Promise.all([
    db.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        rw: true,
        rt: true,
      },
    }),
    db.transportReport.findMany({
      where: {
        userId,
        status: "APPROVED",
      },
      include: {
        actualMode: true,
        baselineMode: true,
      },
      orderBy: { reportDate: "desc" },
      take: 7,
    }),
    db.transportReport.findMany({
      where: {
        userId,
      },
      include: {
        actualMode: true,
        baselineMode: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.pointsLedger.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.achievementAward.findMany({
      where: { userId },
      orderBy: { awardedAt: "desc" },
    }),
    db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const totalAvoidedEmissionKg = reports.reduce((sum, report) => sum + report.avoidedEmissionKg, 0);
  const rtApprovedReports = await db.transportReport.findMany({
    where: {
      status: "APPROVED",
      user: {
        villageId: user.villageId,
        rwId: user.rwId ?? undefined,
        rtId: user.rtId ?? undefined,
      },
    },
    select: {
      avoidedEmissionKg: true,
    },
  });

  const rtTotalAvoidedEmissionKg = rtApprovedReports.reduce(
    (sum, report) => sum + report.avoidedEmissionKg,
    0,
  );
  const monthlyGoalKg = 12;
  const rtGoalKg = 40;
  const progressPercent = Math.min(100, Math.round((totalAvoidedEmissionKg / monthlyGoalKg) * 100));
  const rtProgressPercent = Math.min(100, Math.round((rtTotalAvoidedEmissionKg / rtGoalKg) * 100));
  const chartData = reports
    .slice()
    .reverse()
    .map((report) => ({
      label: report.reportDate.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
      avoidedEmissionKg: Number(report.avoidedEmissionKg.toFixed(2)),
      pointsAwarded: report.pointsAwarded,
    }));

  const missions = [
    {
      id: "transport-week",
      title: "3 aksi transport minggu ini",
      description: "Catat minimal 3 aktivitas transport rendah emisi minggu ini.",
      progress: Math.min(recentReports.length, 3),
      target: 3,
      bonusPoints: 40,
    },
    {
      id: "without-motor",
      title: "7 hari tanpa motor",
      description: "Jaga konsistensi agar streak aksi ramah lingkungan terus tumbuh.",
      progress: Math.min(user.currentStreak, 7),
      target: 7,
      bonusPoints: 50,
    },
    {
      id: "save-emission",
      title: "Capai 12 kg CO2e bulan ini",
      description: "Kumpulkan penghematan emisi pribadi untuk mendekati target bulan berjalan.",
      progress: Number(totalAvoidedEmissionKg.toFixed(1)),
      target: monthlyGoalKg,
      bonusPoints: 80,
    },
  ];

  return {
    user,
    totalAvoidedEmissionKg,
    monthlyGoalKg,
    progressPercent,
    rtTotalAvoidedEmissionKg,
    rtGoalKg,
    rtProgressPercent,
    level: getLevelFromPoints(user.totalPoints),
    reports,
    recentReports,
    ledger,
    achievements,
    notifications,
    chartData,
    missions,
  };
}
