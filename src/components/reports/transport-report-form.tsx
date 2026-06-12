import { createTransportReport } from "@/features/reports/actions/create-transport-report";

export function TransportReportForm({
  modes,
  preset,
}: {
  modes: Array<{ id: string; name: string; category: string; defaultOccupancy: number | null }>;
  preset?: {
    reportDate?: string;
    distanceKm?: number;
    trips?: number;
    occupancy?: number | null;
    actualModeId?: string;
    baselineModeId?: string;
    isRoundTrip?: boolean;
  };
}) {
  return (
    <form action={createTransportReport} className="grid gap-4 lg:grid-cols-2">
      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Tanggal aksi</span>
        <input
          name="reportDate"
          type="date"
          required
          defaultValue={preset?.reportDate}
          className="w-full rounded-2xl border border-[var(--color-app-border)] px-4 py-3 outline-none focus:border-teal-600"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Jarak satu arah (km)</span>
        <input
          name="distanceKm"
          type="number"
          min="0.1"
          step="0.1"
          required
          defaultValue={preset?.distanceKm}
          className="w-full rounded-2xl border border-[var(--color-app-border)] px-4 py-3 outline-none focus:border-teal-600"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Jumlah perjalanan</span>
        <input
          name="trips"
          type="number"
          min="1"
          max="12"
          required
          defaultValue={preset?.trips}
          className="w-full rounded-2xl border border-[var(--color-app-border)] px-4 py-3 outline-none focus:border-teal-600"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Okupansi (opsional)</span>
        <input
          name="occupancy"
          type="number"
          min="1"
          max="20"
          step="0.1"
          placeholder="Contoh 1.5 untuk motor"
          defaultValue={preset?.occupancy ?? undefined}
          className="w-full rounded-2xl border border-[var(--color-app-border)] px-4 py-3 outline-none focus:border-teal-600"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Moda aktual</span>
        <select
          name="actualModeId"
          required
          defaultValue={preset?.actualModeId ?? ""}
          className="w-full rounded-2xl border border-[var(--color-app-border)] px-4 py-3 outline-none focus:border-teal-600"
        >
          <option value="">Pilih moda aktual</option>
          {modes.map((mode) => (
            <option key={mode.id} value={mode.id}>
              {mode.name} • {mode.category}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Moda baseline</span>
        <select
          name="baselineModeId"
          required
          defaultValue={preset?.baselineModeId ?? ""}
          className="w-full rounded-2xl border border-[var(--color-app-border)] px-4 py-3 outline-none focus:border-teal-600"
        >
          <option value="">Pilih pembanding</option>
          {modes.map((mode) => (
            <option key={mode.id} value={mode.id}>
              {mode.name} • {mode.category}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-3 rounded-2xl border border-[var(--color-app-border)] bg-slate-50 px-4 py-3 lg:col-span-2">
        <input
          name="isRoundTrip"
          type="checkbox"
          defaultChecked={preset?.isRoundTrip}
          className="h-4 w-4 rounded border-slate-300 text-teal-700"
        />
        <span className="text-sm text-slate-700">Perjalanan pulang-pergi</span>
      </label>

      <div className="lg:col-span-2">
        <button
          type="submit"
          className="inline-flex items-center rounded-2xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
        >
          Simpan laporan dan hitung estimasi emisi
        </button>
      </div>
    </form>
  );
}
