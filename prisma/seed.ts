import bcrypt from "bcryptjs";
import { PrismaClient, type FactorUnit } from "@prisma/client";

import { rewardCatalogSeed } from "./seeds/reward-catalog";
import { transportFactorSeeds } from "./seeds/transport-factors";
import { transportModeSeeds } from "./seeds/transport-modes";
import { demoUsers, villageSeed } from "./seeds/village-structure";

const prisma = new PrismaClient();

function calculateEmission(params: {
  distanceKm: number;
  trips: number;
  isRoundTrip: boolean;
  occupancy?: number | null;
  actual: { unit: FactorUnit; kgCo2ePerKm: number; defaultOccupancy?: number | null };
  baseline: { unit: FactorUnit; kgCo2ePerKm: number; defaultOccupancy?: number | null };
}) {
  const distanceMultiplier = params.isRoundTrip ? 2 : 1;
  const effectiveDistance = params.distanceKm * params.trips * distanceMultiplier;

  const resolve = (factor: { unit: FactorUnit; kgCo2ePerKm: number; defaultOccupancy?: number | null }) => {
    if (factor.unit === "PASSENGER_KM") {
      return effectiveDistance * factor.kgCo2ePerKm;
    }

    const occupancy = params.occupancy ?? factor.defaultOccupancy ?? 1;
    return effectiveDistance * factor.kgCo2ePerKm / Math.max(1, occupancy);
  };

  const actualEmissionKg = resolve(params.actual);
  const baselineEmissionKg = resolve(params.baseline);
  const avoidedEmissionKg = Math.max(0, baselineEmissionKg - actualEmissionKg);
  return { actualEmissionKg, baselineEmissionKg, avoidedEmissionKg };
}

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.pushSubscription.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.rewardRedemption.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.achievementAward.deleteMany();
  await prisma.pointsLedger.deleteMany();
  await prisma.transportReport.deleteMany();
  await prisma.emissionFactor.deleteMany();
  await prisma.transportMode.deleteMany();
  await prisma.user.deleteMany();
  await prisma.rt.deleteMany();
  await prisma.rw.deleteMany();
  await prisma.village.deleteMany();

  const village = await prisma.village.create({
    data: { name: villageSeed.name },
  });

  const rwMap = new Map<string, { id: string; rtMap: Map<string, string> }>();

  for (const rwSeed of villageSeed.rws) {
    const rw = await prisma.rw.create({
      data: { villageId: village.id, number: rwSeed.number },
    });

    const rtMap = new Map<string, string>();
    for (const rtNumber of rwSeed.rts) {
      const rt = await prisma.rt.create({
        data: { rwId: rw.id, number: rtNumber },
      });
      rtMap.set(rtNumber, rt.id);
    }

    rwMap.set(rwSeed.number, { id: rw.id, rtMap });
  }

  const modeMap = new Map<string, { id: string; defaultOccupancy: number | null }>();
  for (const mode of transportModeSeeds) {
    const created = await prisma.transportMode.create({
      data: {
        ...mode,
        villageId: village.id,
      },
    });
    modeMap.set(mode.code, { id: created.id, defaultOccupancy: created.defaultOccupancy });
  }

  const factorMap = new Map<string, { unit: FactorUnit; kgCo2ePerKm: number; defaultOccupancy: number | null }>();
  for (const factor of transportFactorSeeds) {
    const mode = modeMap.get(factor.modeCode);
    if (!mode) continue;
    await prisma.emissionFactor.create({
      data: {
        transportModeId: mode.id,
        unit: factor.unit,
        kgCo2ePerKm: factor.kgCo2ePerKm,
        sourceNote: factor.sourceNote,
      },
    });
    factorMap.set(factor.modeCode, {
      unit: factor.unit,
      kgCo2ePerKm: factor.kgCo2ePerKm,
      defaultOccupancy: mode.defaultOccupancy,
    });
  }

  for (const reward of rewardCatalogSeed) {
    await prisma.reward.create({
      data: {
        ...reward,
        villageId: village.id,
      },
    });
  }

  const userIds = new Map<string, string>();
  for (const user of demoUsers) {
    const rw = rwMap.get(user.rwNumber);
    const rtId = user.rtNumber ? rw?.rtMap.get(user.rtNumber) : null;
    const passwordHash = await bcrypt.hash(user.password, 10);
    const created = await prisma.user.create({
      data: {
        fullName: user.fullName,
        email: user.email,
        passwordHash,
        role: user.role,
        villageId: village.id,
        rwId: rw?.id,
        rtId,
      },
    });
    userIds.set(user.email, created.id);
  }

  const dinaId = userIds.get("warga@demo.local");
  const ramaId = userIds.get("warga2@demo.local");
  const adminRwId = userIds.get("adminrw@demo.local");

  const bicycleFactor = factorMap.get("BICYCLE");
  const motorcycleFactor = factorMap.get("MOTORCYCLE");
  const busFactor = factorMap.get("BUS");
  const carFactor = factorMap.get("CAR");

  if (dinaId && bicycleFactor && motorcycleFactor) {
    const calc = calculateEmission({
      distanceKm: 4,
      trips: 1,
      isRoundTrip: true,
      occupancy: null,
      actual: bicycleFactor,
      baseline: motorcycleFactor,
    });
    const points = Math.min(500, Math.round(calc.avoidedEmissionKg * 100)) + 10;

    const report = await prisma.transportReport.create({
      data: {
        userId: dinaId,
        reportDate: new Date(),
        distanceKm: 4,
        trips: 1,
        isRoundTrip: true,
        occupancy: null,
        actualModeId: modeMap.get("BICYCLE")!.id,
        baselineModeId: modeMap.get("MOTORCYCLE")!.id,
        actualEmissionKg: calc.actualEmissionKg,
        baselineEmissionKg: calc.baselineEmissionKg,
        avoidedEmissionKg: calc.avoidedEmissionKg,
        pointsAwarded: points,
        status: "APPROVED",
      },
    });

    await prisma.pointsLedger.create({
      data: {
        userId: dinaId,
        delta: points,
        reason: "Laporan transport disetujui",
        referenceId: report.id,
      },
    });

    await prisma.achievementAward.create({
      data: {
        userId: dinaId,
        code: "AKSI_PERTAMA",
        title: "Aksi Pertama",
        description: "Mengirim laporan pertama.",
      },
    });

    await prisma.user.update({
      where: { id: dinaId },
      data: {
        totalPoints: points,
        currentStreak: 1,
        lastReportDate: new Date(),
      },
    });
  }

  if (ramaId && busFactor && carFactor) {
    const calc = calculateEmission({
      distanceKm: 18,
      trips: 4,
      isRoundTrip: true,
      occupancy: 1,
      actual: busFactor,
      baseline: carFactor,
    });

    await prisma.transportReport.create({
      data: {
        userId: ramaId,
        reportDate: new Date(),
        distanceKm: 18,
        trips: 4,
        isRoundTrip: true,
        occupancy: 1,
        actualModeId: modeMap.get("BUS")!.id,
        baselineModeId: modeMap.get("CAR")!.id,
        actualEmissionKg: calc.actualEmissionKg,
        baselineEmissionKg: calc.baselineEmissionKg,
        avoidedEmissionKg: calc.avoidedEmissionKg,
        anomalyReason: "Jumlah perjalanan tinggi, perlu verifikasi admin.",
        status: "PENDING_REVIEW",
      },
    });
  }

  if (dinaId) {
    const reward = await prisma.reward.findFirst({ where: { title: "Bibit tanaman" } });
    if (reward) {
      await prisma.rewardRedemption.create({
        data: {
          userId: dinaId,
          rewardId: reward.id,
          costPoints: reward.costPoints,
          status: "PENDING",
        },
      });
    }

    await prisma.notification.createMany({
      data: [
        {
          userId: dinaId,
          villageId: village.id,
          title: "Selamat datang di Jejak Hijau Warga",
          body: "Mulai laporkan aksi transport harian Anda untuk mengumpulkan poin.",
          href: "/lapor",
        },
        {
          userId: dinaId,
          villageId: village.id,
          title: "Reward siap ditukar",
          body: "Cek katalog terbaru dan tukar poin Anda sebelum stok habis.",
          href: "/reward",
        },
      ],
    });
  }

  if (adminRwId) {
    await prisma.auditLog.create({
      data: {
        actorId: adminRwId,
        action: "SEED_BOOTSTRAP",
        entityType: "Village",
        entityId: village.id,
        detail: "Data demo MVP berhasil di-seed.",
      },
    });
  }

  console.log("Seed selesai. Akun demo:");
  console.log("warga@demo.local / demo1234");
  console.log("adminrt@demo.local / demo1234");
  console.log("adminrw@demo.local / demo1234");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
