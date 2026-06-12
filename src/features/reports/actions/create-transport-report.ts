"use server";

import { redirect } from "next/navigation";

import { requireUser } from "@/auth";
import { db } from "@/lib/db";
import { awardAchievements } from "@/features/gamification/award-achievements";
import { awardReportPoints } from "@/features/gamification/award-report-points";
import { createNotification } from "@/features/notifications/create-notification";
import { calculateTransportEmission } from "@/features/emission/calculate-transport-emission";
import { resolveEmissionFactor } from "@/features/emission/resolve-emission-factor";
import { transportReportSchema } from "@/features/reports/schemas/transport-report.schema";

function getAnomalyReason(input: {
  distanceKm: number;
  trips: number;
  actualModeId: string;
  baselineModeId: string;
  duplicateCount: number;
}) {
  if (input.actualModeId === input.baselineModeId) {
    return "Moda aktual sama dengan baseline.";
  }
  if (input.distanceKm > 40) {
    return "Jarak perjalanan di atas ambang wajar.";
  }
  if (input.trips > 6) {
    return "Jumlah perjalanan dalam satu laporan terlalu tinggi.";
  }
  if (input.duplicateCount > 0) {
    return "Terdapat pola laporan serupa di hari yang sama.";
  }
  return null;
}

export async function createTransportReport(formData: FormData) {
  const user = await requireUser(["WARGA"]);

  const parsed = transportReportSchema.parse({
    reportDate: formData.get("reportDate"),
    distanceKm: formData.get("distanceKm"),
    trips: formData.get("trips"),
    isRoundTrip: formData.get("isRoundTrip") === "on",
    occupancy: formData.get("occupancy"),
    actualModeId: formData.get("actualModeId"),
    baselineModeId: formData.get("baselineModeId"),
  });

  const reportDate = new Date(parsed.reportDate);
  const [actualFactor, baselineFactor, duplicateCount] = await Promise.all([
    resolveEmissionFactor(parsed.actualModeId),
    resolveEmissionFactor(parsed.baselineModeId),
    db.transportReport.count({
      where: {
        userId: user.id,
        reportDate,
        actualModeId: parsed.actualModeId,
        baselineModeId: parsed.baselineModeId,
      },
    }),
  ]);

  const emission = calculateTransportEmission({
    distanceKm: parsed.distanceKm,
    trips: parsed.trips,
    isRoundTrip: parsed.isRoundTrip,
    occupancy: parsed.occupancy,
    actualFactor: {
      unit: actualFactor.unit,
      kgCo2ePerKm: actualFactor.kgCo2ePerKm,
      defaultOccupancy: actualFactor.transportMode.defaultOccupancy,
    },
    baselineFactor: {
      unit: baselineFactor.unit,
      kgCo2ePerKm: baselineFactor.kgCo2ePerKm,
      defaultOccupancy: baselineFactor.transportMode.defaultOccupancy,
    },
  });

  const anomalyReason = getAnomalyReason({
    distanceKm: parsed.distanceKm,
    trips: parsed.trips,
    actualModeId: parsed.actualModeId,
    baselineModeId: parsed.baselineModeId,
    duplicateCount,
  });

  const status = anomalyReason ? "PENDING_REVIEW" : "APPROVED";

  await db.$transaction(async (tx) => {
    const report = await tx.transportReport.create({
      data: {
        userId: user.id,
        reportDate,
        distanceKm: parsed.distanceKm,
        trips: parsed.trips,
        isRoundTrip: parsed.isRoundTrip,
        occupancy: parsed.occupancy,
        actualModeId: parsed.actualModeId,
        baselineModeId: parsed.baselineModeId,
        actualEmissionKg: emission.actualEmissionKg,
        baselineEmissionKg: emission.baselineEmissionKg,
        avoidedEmissionKg: emission.avoidedEmissionKg,
        anomalyReason,
        status,
      },
    });

    if (status === "APPROVED") {
      const points = await awardReportPoints(tx, {
        userId: user.id,
        reportId: report.id,
        avoidedEmissionKg: emission.avoidedEmissionKg,
        reportDate,
      });

      await tx.transportReport.update({
        where: { id: report.id },
        data: { pointsAwarded: points },
      });

      const achievements = await awardAchievements(tx, user.id);
      if (achievements.length) {
        await createNotification({
          userIds: [user.id],
          villageId: user.villageId,
          title: "Badge baru berhasil dibuka",
          body: `Anda mendapat ${achievements[0].title}.`,
          href: "/beranda",
          client: tx,
        });
      }
    }

    await createNotification({
      userIds: [user.id],
      villageId: user.villageId,
      title: status === "APPROVED" ? "Laporan tersimpan" : "Laporan menunggu review",
      body:
        status === "APPROVED"
          ? "Estimasi emisi berhasil dihitung dan poin telah ditambahkan."
          : "Laporan terdeteksi anomali dasar dan masuk antrean review admin.",
      href: "/riwayat",
      client: tx,
    });
  });

  redirect(`/riwayat?status=${status.toLowerCase()}`);
}
