import { requireUser } from "@/auth";
import { WorkflowHeader } from "@/components/navigation/workflow-header";
import { ReportHistoryTable } from "@/components/reports/report-history-table";
import { db } from "@/lib/db";

export default async function CitizenHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireUser(["WARGA"]);
  const params = await searchParams;
  const reports = await db.transportReport.findMany({
    where: { userId: user.id },
    include: {
      actualMode: true,
      baselineMode: true,
    },
    orderBy: { reportDate: "desc" },
  });

  return (
    <div className="space-y-6">
      {params.status ? (
        <div className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
          {params.status === "approved"
            ? "Laporan berhasil disimpan dan langsung disetujui."
            : params.status === "pending_review"
              ? "Laporan tersimpan dan menunggu review admin."
              : "Status laporan diperbarui."}
        </div>
      ) : null}
      <WorkflowHeader
        backHref="/beranda"
        backLabel="Back to Home"
        title="Riwayat pelaporan"
        description="Pantau semua aktivitas yang sudah Anda submit, cek status review, dan lanjutkan ke aksi berikutnya tanpa kehilangan arah."
        actions={[
          { href: "/lapor", label: "Tambah aktivitas" },
          { href: "/reward", label: "Lihat reward" },
        ]}
      />
      <section className="rounded-[28px] border border-[var(--color-app-border)] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Riwayat pelaporan</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Lihat histori submit, estimasi emisi, poin yang didapat, dan alasan bila laporan perlu review.
        </p>
        <div className="mt-6">
          <ReportHistoryTable reports={reports} />
        </div>
      </section>
    </div>
  );
}
