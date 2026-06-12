import { requireUser } from "@/auth";
import { WorkflowHeader } from "@/components/navigation/workflow-header";
import { db } from "@/lib/db";
import { applyUserScope, resolveScope } from "@/lib/scope";
import { formatDateTime, formatPoint } from "@/lib/utils";

export default async function AdminUsersPage() {
  const admin = await requireUser(["ADMIN_RT", "ADMIN_RW"]);
  const users = await db.user.findMany({
    where: applyUserScope(resolveScope(admin)),
    include: {
      rw: true,
      rt: true,
      reports: {
        where: { status: "APPROVED" },
        take: 1,
        orderBy: { reportDate: "desc" },
      },
    },
    orderBy: [{ role: "asc" }, { fullName: "asc" }],
  });

  return (
    <div className="space-y-6">
      <WorkflowHeader
        backHref="/admin/dashboard"
        backLabel="Back to Dashboard"
        title="Pengguna dalam scope"
        description="Pantau siapa saja yang aktif di wilayah Anda, lalu pindah ke review laporan atau master data tanpa kehilangan konteks."
        actions={[
          { href: "/admin/laporan", label: "Review laporan" },
          { href: "/admin/master-data", label: "Buka master data" },
        ]}
      />

      <div className="overflow-hidden rounded-[28px] border border-[var(--color-app-border)] bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-4 font-medium">Nama</th>
              <th className="px-5 py-4 font-medium">Role</th>
              <th className="px-5 py-4 font-medium">Wilayah</th>
              <th className="px-5 py-4 font-medium">Poin</th>
              <th className="px-5 py-4 font-medium">Aktivitas terakhir</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-[var(--color-app-border)]">
                <td className="px-5 py-4">
                  <div>
                    <p className="font-semibold text-slate-900">{user.fullName}</p>
                    <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-700">{user.role}</td>
                <td className="px-5 py-4 text-slate-700">
                  RW {user.rw?.number ?? "-"} / RT {user.rt?.number ?? "-"}
                </td>
                <td className="px-5 py-4 font-semibold text-teal-700">{formatPoint(user.totalPoints)}</td>
                <td className="px-5 py-4 text-slate-700">
                  {user.reports[0] ? formatDateTime(user.reports[0].reportDate) : "Belum ada"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
