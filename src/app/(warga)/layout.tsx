import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { clearSession, requireUser } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { CitizenBottomNav } from "@/components/layout/citizen-bottom-nav";

async function logoutAction() {
  "use server";

  await clearSession();
  redirect("/login");
}

export default async function CitizenLayout({ children }: { children: ReactNode }) {
  const user = await requireUser(["WARGA"]);

  return (
    <AppShell
      title="Portal warga"
      subtitle="Catat aksi transport, lihat dampak pribadi, dan tukar reward program lingkungan RT/RW."
      bottomNav={<CitizenBottomNav />}
      userMeta={
        <div className="flex items-center gap-4">
          <div>
            <p className="font-semibold text-slate-900">{user.fullName}</p>
            <p className="text-xs text-slate-500">
              RW {user.rw?.number} / RT {user.rt?.number}
            </p>
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
