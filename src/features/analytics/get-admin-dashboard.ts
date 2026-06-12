import type { RequestScope } from "@/lib/scope";
import { applyReportScope, applyUserScope } from "@/lib/scope";
import { db } from "@/lib/db";

export async function getAdminDashboard(scope: RequestScope) {
  const reportWhere = applyReportScope(scope);
  const userWhere = applyUserScope(scope);

  const [reports, activeCitizens, pendingReview, redemptions] = await Promise.all([
    db.transportReport.findMany({
      where: {
        ...reportWhere,
        status: "APPROVED",
      },
      include: {
        actualMode: true,
        baselineMode: true,
        user: true,
      },
      orderBy: { reportDate: "desc" },
      take: 60,
    }),
    db.user.count({
      where: {
        ...userWhere,
        role: "WARGA",
        reports: {
          some: {
            status: "APPROVED",
          },
        },
      },
    }),
    db.transportReport.findMany({
      where: {
        ...reportWhere,
        status: "PENDING_REVIEW",
      },
      include: { user: true, actualMode: true, baselineMode: true },
      orderBy: { createdAt: "desc" },
    }),
    db.rewardRedemption.findMany({
      where: {
        user: userWhere,
      },
      include: {
        reward: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const totalAvoidedEmissionKg = reports.reduce((sum, report) => sum + report.avoidedEmissionKg, 0);
  const approvedReports = reports.length;

  const trendMap = new Map<string, number>();
  const shiftMap = new Map<string, number>();
  for (const report of reports) {
    const label = report.reportDate.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
    trendMap.set(label, (trendMap.get(label) ?? 0) + Number(report.avoidedEmissionKg.toFixed(2)));

    const shiftLabel = `${report.baselineMode.name} → ${report.actualMode.name}`;
    shiftMap.set(shiftLabel, (shiftMap.get(shiftLabel) ?? 0) + 1);
  }

  const emissionTrend = Array.from(trendMap.entries()).map(([label, avoidedEmissionKg]) => ({
    label,
    avoidedEmissionKg,
  }));
  const modeShift = Array.from(shiftMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, total]) => ({ label, total }));

  return {
    approvedReports,
    totalAvoidedEmissionKg,
    activeCitizens,
    pendingReview,
    redemptions,
    emissionTrend,
    modeShift,
  };
}
