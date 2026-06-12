import { db } from "@/lib/db";

export async function resolveEmissionFactor(transportModeId: string) {
  const factor = await db.emissionFactor.findFirst({
    where: {
      transportModeId,
      isActive: true,
    },
    orderBy: { createdAt: "desc" },
    include: {
      transportMode: true,
    },
  });

  if (!factor) {
    throw new Error("Faktor emisi aktif tidak ditemukan.");
  }

  return factor;
}
