"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { citizenNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function CitizenBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-4 bottom-4 z-30 rounded-3xl border border-[var(--color-app-border)] bg-white/95 p-2 shadow-[0_16px_40px_rgba(15,23,42,0.14)] backdrop-blur">
      <ul className="grid grid-cols-5 gap-1">
        {citizenNavigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium text-slate-500 transition",
                  isActive && "bg-teal-50 text-teal-700",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
