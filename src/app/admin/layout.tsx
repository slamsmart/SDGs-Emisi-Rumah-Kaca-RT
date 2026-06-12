import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { clearSession, requireUser } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

async function logoutAction() {
  "use server";

  await clearSession();
  redirect("/login");
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireUser(["ADMIN_RT", "ADMIN_RW"]);
  const scopeLabel =
    admin.role === "ADMIN_RT"
      ? `RT ${admin.rt?.number} / RW ${admin.rw?.number}`
      : `RW ${admin.rw?.number ?? "-"}`;

  return (
    <AppShell
      title="Dashboard admin"
      subtitle="Pantau kualitas data, aktivitas warga, reward, dan notifikasi program berdasarkan scope wilayah."
      sidebar={<AdminSidebar adminName={admin.fullName} scopeLabel={scopeLabel} />}
      userMeta={
        <div className="flex items-center gap-4">
          <div>
            <p className="font-semibold text-slate-900">{admin.email}</p>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{admin.role}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-xl border border-[var(--color-app-border)] px-3 py-2 text-xs font-semibold text-slate-700"
            >
              Keluar
            </button>
          </form>
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
