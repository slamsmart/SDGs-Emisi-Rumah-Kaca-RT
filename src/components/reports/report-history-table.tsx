import { formatDate, formatKg } from "@/lib/utils";

type ReportHistoryItem = {
  id: string;
  reportDate: Date;
  actualMode: { name: string };
  baselineMode: { name: string };
  avoidedEmissionKg: number;
  pointsAwarded: number;
  status: "APPROVED" | "PENDING_REVIEW" | "REJECTED";
  anomalyReason: string | null;
};

export function ReportHistoryTable({ reports }: { reports: ReportHistoryItem[] }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-[var(--color-app-border)]">
      <table className="min-w-full divide-y divide-[var(--color-app-border)] text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Tanggal</th>
            <th className="px-4 py-3 font-medium">Peralihan moda</th>
            <th className="px-4 py-3 font-medium">Emisi terhindar</th>
            <th className="px-4 py-3 font-medium">Poin</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-app-border)] bg-white">
          {reports.map((report) => (
            <tr key={report.id}>
              <td className="px-4 py-4">{formatDate(report.reportDate)}</td>
              <td className="px-4 py-4">
                <div className="font-medium text-slate-800">
                  {report.baselineMode.name} → {report.actualMode.name}
                </div>
                {report.anomalyReason ? <p className="mt-1 text-xs text-amber-700">{report.anomalyReason}</p> : null}
              </td>
              <td className="px-4 py-4 font-medium text-teal-700">{formatKg(report.avoidedEmissionKg)}</td>
              <td className="px-4 py-4">{report.pointsAwarded}</td>
              <td className="px-4 py-4">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {report.status === "APPROVED"
                    ? "Disetujui"
                    : report.status === "PENDING_REVIEW"
                      ? "Perlu review"
                      : "Ditolak"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
