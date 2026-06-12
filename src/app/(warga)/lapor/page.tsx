import { requireUser } from "@/auth";
import { WorkflowHeader } from "@/components/navigation/workflow-header";
import { TransportReportForm } from "@/components/reports/transport-report-form";
import { db } from "@/lib/db";

function getActivityPreset(
  activity: string | undefined,
  modeMap: Map<string, { id: string }>,
): {
  title?: string;
  description?: string;
  preset?: {
    reportDate?: string;
    distanceKm?: number;
    trips?: number;
    occupancy?: number | null;
    actualModeId?: string;
    baselineModeId?: string;
    isRoundTrip?: boolean;
  };
} {
  const today = new Date().toISOString().slice(0, 10);
  switch (activity) {
    case "public":
      return {
        title: "Template transport publik",
        description: "Cocok untuk bus atau angkot sebagai pengganti motor pribadi.",
        preset: {
          reportDate: today,
          distanceKm: 5,
          trips: 2,
          actualModeId: modeMap.get("BUS")?.id,
          baselineModeId: modeMap.get("MOTORCYCLE")?.id,
          isRoundTrip: true,
        },
      };
    case "bike":
      return {
        title: "Template jalan kaki / sepeda",
        description: "Gunakan untuk aksi komuter dekat rumah, sekolah, atau kantor.",
        preset: {
          reportDate: today,
          distanceKm: 3,
          trips: 2,
          actualModeId: modeMap.get("BICYCLE")?.id ?? modeMap.get("WALK")?.id,
          baselineModeId: modeMap.get("MOTORCYCLE")?.id,
          isRoundTrip: true,
        },
      };
    case "carpool":
      return {
        title: "Template carpool",
        description: "Isi okupansi bersama untuk membuat estimasi pengurangan emisi lebih adil.",
        preset: {
          reportDate: today,
          distanceKm: 8,
          trips: 2,
          occupancy: 3,
          actualModeId: modeMap.get("CAR")?.id,
          baselineModeId: modeMap.get("MOTORCYCLE")?.id,
          isRoundTrip: true,
        },
      };
    default:
      return {};
  }
}

export default async function CitizenReportPage({
  searchParams,
}: {
  searchParams: Promise<{ activity?: string }>;
}) {
  await requireUser(["WARGA"]);
  const modes = await db.transportMode.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  const params = await searchParams;
  const modeMap = new Map(modes.map((mode) => [mode.code, { id: mode.id }]));
  const presetInfo = getActivityPreset(params.activity, modeMap);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-6 xl:col-span-2">
        <WorkflowHeader
          backHref="/beranda"
          backLabel="Back to Home"
          title="Submit aktivitas warga"
          description="Gunakan halaman ini untuk menambah aktivitas yang mendukung goal penurunan emisi. Setelah submit, Anda bisa lanjut melihat riwayat atau kembali ke dashboard."
          actions={[
            { href: "/riwayat", label: "Lihat riwayat" },
            { href: "/reward", label: "Cek reward" },
          ]}
        />
      </section>

      <section className="rounded-[28px] border border-[var(--color-app-border)] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Lapor aksi transport</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Masukkan jarak satu arah, jumlah perjalanan, moda aktual, dan baseline pembanding untuk menghitung estimasi emisi CO2e.
        </p>
        {presetInfo.title ? (
          <div className="mt-4 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3">
            <p className="text-sm font-semibold text-teal-800">{presetInfo.title}</p>
            <p className="mt-1 text-sm text-teal-700">{presetInfo.description}</p>
          </div>
        ) : null}
        <div className="mt-6">
          <TransportReportForm modes={modes} preset={presetInfo.preset} />
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--color-app-border)] bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Pedoman input cepat</h3>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
          <li>Jarak yang diisi selalu jarak satu arah.</li>
          <li>Centang pulang-pergi jika perjalanan pergi dan pulang dalam pola sama.</li>
          <li>Jika memakai motor atau mobil bersama, isi okupansi agar estimasi lebih adil.</li>
          <li>Laporan dengan pola anomali dasar tetap tersimpan, namun masuk antrean review admin.</li>
        </ul>
      </section>
    </div>
  );
}
