"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function AdminSidebar({
  adminName,
  scopeLabel,
}: {
  adminName: string;
  scopeLabel: string;
}) {
  const pathname = usePathname();

  return (
    <div className="sticky top-4 rounded-[28px] border border-[var(--color-app-border)] bg-slate-950 p-5 text-white shadow-[0_20px_40px_rgba(15,23,42,0.24)]">
      <div className="rounded-2xl bg-white/10 p-4">
        <p className="text-xs uppercase tracking-[0.24em] text-teal-200">Admin RT/RW</p>
        <h2 className="mt-3 text-xl font-semibold">{adminName}</h2>
        <p className="mt-2 text-sm text-slate-300">{scopeLabel}</p>
      </div>
      <ul className="mt-5 space-y-2">
        {adminNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white",
                  isActive && "bg-white text-slate-950",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
