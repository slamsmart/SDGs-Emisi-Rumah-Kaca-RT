"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

type WorkflowAction = {
  href: string;
  label: string;
};

export function WorkflowHeader({
  backHref,
  backLabel,
  title,
  description,
  actions = [],
}: {
  backHref: string;
  backLabel: string;
  title: string;
  description?: string;
  actions?: WorkflowAction[];
}) {
  const pathname = usePathname();

  return (
    <section className="rounded-[28px] border border-[var(--color-app-border)] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-app-border)] bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
          <span className="rounded-full bg-teal-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-700">
            {pathname}
          </span>
        </div>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
            {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
          </div>

          {actions.length ? (
            <div className="flex flex-wrap gap-2">
              {actions.map((action, index) => (
                <Link
                  key={`${action.href}-${action.label}`}
                  href={action.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition",
                    index === 0
                      ? "bg-teal-700 text-white hover:bg-teal-800"
                      : "border border-[var(--color-app-border)] bg-slate-50 text-slate-700 hover:bg-slate-100",
                  )}
                >
                  {action.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
