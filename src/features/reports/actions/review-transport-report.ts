"use server";

import { redirect } from "next/navigation";

import { requireUser } from "@/auth";
import { db } from "@/lib/db";
import { resolveScope, applyReportScope } from "@/lib/scope";
import { awardAchievements } from "@/features/gamification/award-achievements";
import { awardReportPoints } from "@/features/gamification/award-report-points";
import { createNotification } from "@/features/notifications/create-notification";

export async function reviewTransportReport(formData: FormData) {
  const admin = await requireUser(["ADMIN_RT", "ADMIN_RW"]);
  const reportId = String(formData.get("reportId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const notes = String(formData.get("notes") ?? "");

  const scope = resolveScope(admin);
  const report = await db.transportReport.findFirst({
    where: {
      id: reportId,
      ...applyReportScope(scope),
    },
    include: { user: true },
  });

  if (!report) {
    throw new Error("Laporan tidak ditemukan dalam scope admin.");
  }

  await db.$transaction(async (tx) => {
    if (decision === "approve") {
      const points = await awardReportPoints(tx, {
        userId: report.userId,
        reportId: report.id,
        avoidedEmissionKg: report.avoidedEmissionKg,
        reportDate: report.reportDate,
      });

      await tx.transportReport.update({
        where: { id: report.id },
        data: {
          status: "APPROVED",
          anomalyReason: notes || report.anomalyReason,
          reviewedAt: new Date(),
          reviewedById: admin.id,
          pointsAwarded: points,
        },
      });

      await awardAchievements(tx, report.userId);
      await createNotification({
        userIds: [report.userId],
        villageId: admin.villageId,
        title: "Laporan disetujui admin",
        body: "Laporan transport Anda lolos review dan poin telah diproses.",
        href: "/riwayat",
        client: tx,
      });
    } else {
      await tx.transportReport.update({
        where: { id: report.id },
        data: {
          status: "REJECTED",
          anomalyReason: notes || report.anomalyReason || "Ditolak admin.",
          reviewedAt: new Date(),
          reviewedById: admin.id,
        },
      });

      await createNotification({
        userIds: [report.userId],
        villageId: admin.villageId,
        title: "Laporan perlu diperbaiki",
        body: notes || "Admin menandai laporan untuk diperbaiki lalu dikirim ulang.",
        href: "/lapor",
        client: tx,
      });
    }

    await tx.auditLog.create({
      data: {
        actorId: admin.id,
        action: decision === "approve" ? "REVIEW_APPROVE" : "REVIEW_REJECT",
        entityType: "TransportReport",
        entityId: report.id,
        detail: notes || null,
      },
    });
  });

  redirect("/admin/laporan?status=updated");
}
