import { Leaf, ShieldCheck, UserRound } from "lucide-react";
import { redirect } from "next/navigation";

import { getSession, signInWithPassword } from "@/auth";

async function loginAction(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const result = await signInWithPassword(email, password);

  if (!result.ok) {
    redirect(`/login?error=${encodeURIComponent(result.message)}`);
  }

  redirect(result.redirectTo);
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) {
    redirect(session.role === "WARGA" ? "/beranda" : "/admin/dashboard");
  }

  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.12),_transparent_40%),linear-gradient(180deg,#f8fffe_0%,#edf5f3_100%)] px-4 py-10">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[32px] border border-[var(--color-app-border)] bg-slate-950 p-8 text-white shadow-[0_25px_60px_rgba(15,23,42,0.25)] lg:p-10">
          <span className="inline-flex rounded-full bg-teal-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">
            MVP Enterprise RT/RW
          </span>
          <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-tight">
            Jejak Hijau Warga untuk pelaporan aksi transport, insentif, dan analitik lokal.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
            Satu aplikasi terpadu bagi warga dan admin RT/RW untuk mengukur estimasi pengurangan emisi, menjaga partisipasi warga, dan memantau target lingkungan tingkat lokal.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Leaf,
                title: "Self-report cepat",
                description: "Pelaporan jarak, moda aktual, baseline, dan estimasi CO2e.",
              },
              {
                icon: UserRound,
                title: "Gamifikasi terarah",
                description: "Poin, streak, badge, dan reward internal.",
              },
              {
                icon: ShieldCheck,
                title: "Kontrol admin",
                description: "Scope RT/RW, review anomali, dan dashboard program.",
              },
            ].map((item) => (
              <article key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <item.icon className="h-5 w-5 text-teal-200" />
                <h2 className="mt-4 text-lg font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-[var(--color-app-border)] bg-white p-8 shadow-[0_25px_60px_rgba(15,23,42,0.1)] lg:p-10">
          <h2 className="text-2xl font-semibold text-slate-950">Masuk ke aplikasi</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Gunakan akun demo seed: warga@demo.local, adminrt@demo.local, atau adminrw@demo.local dengan password demo1234.
          </p>
          {params.error ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {params.error}
            </div>
          ) : null}

          <form action={loginAction} className="mt-8 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                name="email"
                type="email"
                required
                placeholder="warga@demo.local"
                className="w-full rounded-2xl border border-[var(--color-app-border)] px-4 py-3 outline-none focus:border-teal-700"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <input
                name="password"
                type="password"
                required
                placeholder="demo1234"
                className="w-full rounded-2xl border border-[var(--color-app-border)] px-4 py-3 outline-none focus:border-teal-700"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-2xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              Masuk
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
