import Link from "next/link";
import {
  ArrowRight,
  Award,
  Bus,
  Flame,
  Footprints,
  Gift,
  Lightbulb,
  Recycle,
  TrendingDown,
  Users,
} from "lucide-react";

import { requireUser } from "@/auth";
import { EmissionTrendChart } from "@/components/charts/emission-trend-chart";
import { getCitizenDashboard } from "@/features/analytics/get-citizen-dashboard";
import { formatDateTime, formatKg, formatPoint } from "@/lib/utils";

export default async function CitizenHomePage() {
  const user = await requireUser(["WARGA"]);
  const dashboard = await getCitizenDashboard(user.id);
  const quickActions = [
    {
      title: "Transport publik",
      description: "Isi cepat aksi bus atau angkot untuk perjalanan harian.",
      href: "/lapor?activity=public",
      icon: Bus,
      meta: "+20 s/d +80 poin",
      status: "ready",
    },
    {
      title: "Jalan kaki / sepeda",
      description: "Catat komuter dekat rumah yang menggantikan motor.",
      href: "/lapor?activity=bike",
      icon: Footprints,
      meta: "+15 s/d +70 poin",
      status: "ready",
    },
    {
      title: "Carpool",
      description: "Laporkan perjalanan berbagi mobil dengan okupansi lebih tinggi.",
      href: "/lapor?activity=carpool",
      icon: Users,
      meta: "+10 s/d +60 poin",
      status: "ready",
    },
    {
      title: "Hemat listrik",
      description: "Kategori aksi rumah tangga akan dibuka pada iterasi berikutnya.",
      href: "#",
      icon: Lightbulb,
      meta: "Segera hadir",
      status: "soon",
    },
    {
      title: "Kelola sampah",
      description: "Aktivitas bank sampah dan kompos akan ditambahkan setelah MVP transport stabil.",
      href: "#",
      icon: Recycle,
      meta: "Segera hadir",
      status: "soon",
    },
  ] as const;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] bg-slate-950 p-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">Goal pribadi bulan ini</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight">
              Kurangi {dashboard.monthlyGoalKg} kg CO2e dari aktivitas transport harian.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Dashboard ini sekarang jadi titik aksi. Tambah aktivitas baru, kejar misi aktif, dan bantu RT mencapai target emisi lokal.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/lapor"
                className="inline-flex items-center gap-2 rounded-2xl bg-teal-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
              >
                Tambah Aktivitas
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#misi-aktif"
                className="inline-flex items-center rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Lihat Misi
              </a>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-300">Progress pribadi</p>
              <p className="mt-3 text-3xl font-semibold">
                {dashboard.totalAvoidedEmissionKg.toFixed(1)} / {dashboard.monthlyGoalKg} kg
              </p>
              <div className="mt-4 h-3 rounded-full bg-white/10">
                <div
                  className="h-3 rounded-full bg-teal-400"
                  style={{ width: `${dashboard.progressPercent}%` }}
                />
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-teal-200">
                {dashboard.progressPercent}% target tercapai
              </p>
            </article>
            <article className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-300">Kontribusi ke RT</p>
              <p className="mt-3 text-3xl font-semibold">
                {dashboard.rtTotalAvoidedEmissionKg.toFixed(1)} / {dashboard.rtGoalKg} kg
              </p>
              <div className="mt-4 h-3 rounded-full bg-white/10">
                <div
                  className="h-3 rounded-full bg-emerald-300"
                  style={{ width: `${dashboard.rtProgressPercent}%` }}
                />
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-emerald-200">
                RT {user.rt?.number ?? "-"} sudah {dashboard.rtProgressPercent}% dari goal
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            icon: TrendingDown,
            label: "Total emisi terhindarkan",
            value: formatKg(dashboard.totalAvoidedEmissionKg),
          },
          {
            icon: Gift,
            label: "Saldo poin",
            value: formatPoint(dashboard.user.totalPoints),
          },
          {
            icon: Flame,
            label: "Streak aktif",
            value: `${dashboard.user.currentStreak} hari`,
          },
          {
            icon: Award,
            label: "Level warga",
            value: `Level ${dashboard.level}`,
          },
        ].map((card) => (
          <article key={card.label} className="rounded-[28px] border border-[var(--color-app-border)] bg-white p-5 shadow-sm">
            <card.icon className="h-5 w-5 text-teal-700" />
            <p className="mt-4 text-sm text-slate-500">{card.label}</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{card.value}</h2>
          </article>
        ))}
      </section>

      <section className="rounded-[28px] border border-[var(--color-app-border)] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Aktivitas cepat</h3>
            <p className="mt-1 text-sm text-slate-600">
              Pilih jenis aktivitas yang ingin Anda submit. Tiga aksi pertama sudah langsung terhubung ke form laporan.
            </p>
          </div>
          <Link href="/lapor" className="text-sm font-semibold text-teal-700">
            Form lengkap
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const content = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <Icon className="h-5 w-5 text-teal-700" />
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                      action.status === "ready"
                        ? "bg-teal-50 text-teal-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {action.meta}
                  </span>
                </div>
                <h4 className="mt-4 text-base font-semibold text-slate-900">{action.title}</h4>
                <p className="mt-2 text-sm leading-6 text-slate-600">{action.description}</p>
              </>
            );

            return action.status === "ready" ? (
              <Link
                key={action.title}
                href={action.href}
                className="rounded-[28px] border border-[var(--color-app-border)] bg-slate-50 p-5 transition hover:border-teal-200 hover:bg-teal-50"
              >
                {content}
              </Link>
            ) : (
              <div key={action.title} className="rounded-[28px] border border-[var(--color-app-border)] bg-slate-50 p-5 opacity-80">
                {content}
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <EmissionTrendChart data={dashboard.chartData} />

        <section
          id="misi-aktif"
          className="rounded-[28px] border border-[var(--color-app-border)] bg-white p-5 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900">Misi aktif</h3>
          <div className="mt-4 space-y-3">
            {dashboard.missions.map((mission) => {
              const missionPercent = Math.min(100, Math.round((mission.progress / mission.target) * 100));
              return (
                <article key={mission.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-slate-900">{mission.title}</p>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
                      +{mission.bonusPoints} poin
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{mission.description}</p>
                  <div className="mt-3 h-2.5 rounded-full bg-slate-200">
                    <div
                      className="h-2.5 rounded-full bg-teal-600"
                      style={{ width: `${missionPercent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                    {mission.progress} / {mission.target}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[28px] border border-[var(--color-app-border)] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-slate-900">Aktivitas terbaru</h3>
            <Link href="/riwayat" className="text-sm font-semibold text-teal-700">
              Lihat semua
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {dashboard.recentReports.map((report) => (
              <div key={report.id} className="rounded-2xl bg-slate-50 px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {report.baselineMode.name} → {report.actualMode.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{formatDateTime(report.createdAt)}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                      report.status === "APPROVED"
                        ? "bg-teal-100 text-teal-800"
                        : report.status === "PENDING_REVIEW"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {report.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <span>{formatKg(report.avoidedEmissionKg)}</span>
                  <span>{formatPoint(report.pointsAwarded)}</span>
                  <span>{report.distanceKm} km</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-[var(--color-app-border)] bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Kabar dan true story</h3>
          <div className="mt-4 space-y-3">
            {dashboard.notifications.map((notification) => (
              <article key={notification.id} className="rounded-2xl border border-[var(--color-app-border)] p-4">
                <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{notification.body}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-[28px] border border-[var(--color-app-border)] bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Badge terbaru</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {dashboard.achievements.length ? (
            dashboard.achievements.slice(0, 4).map((achievement) => (
              <article key={achievement.id} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{achievement.title}</p>
                <p className="mt-1 text-sm text-slate-600">{achievement.description}</p>
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-500">Belum ada badge. Mulai kirim laporan untuk membuka pencapaian.</p>
          )}
        </div>
      </section>
    </div>
  );
}
