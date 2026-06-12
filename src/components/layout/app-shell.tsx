import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function AppShell({
  title,
  subtitle,
  sidebar,
  bottomNav,
  userMeta,
  children,
}: {
  title: string;
  subtitle?: string;
  sidebar?: ReactNode;
  bottomNav?: ReactNode;
  userMeta?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-app-bg)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-4 lg:px-6">
        {sidebar ? <aside className="hidden w-72 lg:block">{sidebar}</aside> : null}
        <div className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col rounded-[32px] border border-[var(--color-app-border)] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <header className="border-b border-[var(--color-app-border)] px-6 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-teal-700">
                  Platform emisi RT/RW
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{title}</h1>
                {subtitle ? <p className="mt-2 max-w-3xl text-sm text-slate-600">{subtitle}</p> : null}
              </div>
              {userMeta ? (
                <div className="rounded-2xl border border-[var(--color-app-border)] bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {userMeta}
                </div>
              ) : null}
            </div>
          </header>
          <main className={cn("flex-1 px-6 py-6 pb-24 lg:pb-6")}>{children}</main>
          {bottomNav ? <div className="lg:hidden">{bottomNav}</div> : null}
        </div>
      </div>
    </div>
  );
}
