# SYSTEM_MAP

## Ringkasan

`Jejak Hijau Warga` adalah aplikasi web monolith berbasis `Next.js App Router` untuk warga dan admin RT/RW. Sistem berfokus pada pelaporan aksi transport, estimasi pengurangan emisi, gamifikasi poin, reward internal, notification center, dan dashboard analitik lokal.

## Entry points

- `src/app/page.tsx`
  Redirect root berdasarkan sesi login.
- `src/app/(public)/login/page.tsx`
  Halaman login untuk akun demo dan akun produksi.
- `src/app/(warga)/*`
  Area warga: beranda, lapor, riwayat, reward, notifikasi, profil.
- `src/app/admin/*`
  Area admin RT/RW: dashboard, review laporan, reward, pengguna, master data, notifikasi.
- `src/app/api/push/*`
  Endpoint subscribe dan unsubscribe web push.

## Alur runtime

1. User login menggunakan email dan password.
2. Sistem membuat session cookie bertanda tangan HMAC.
3. `middleware.ts` membatasi akses route berdasarkan role.
4. Warga mengirim laporan transport.
5. Server action menghitung emisi aktual, baseline, dan emisi terhindarkan.
6. Jika lolos rule dasar, laporan `APPROVED` dan poin diproses.
7. Jika terdeteksi anomali ringan, laporan `PENDING_REVIEW`.
8. Admin RT/RW memantau KPI, review laporan, dan memproses reward.

## Folder penting

- `prisma/`
  Schema, seed, dan data dasar demo.
- `src/lib/`
  Utility database, env, RBAC, scope, dan formatting.
- `src/features/`
  Logika domain: emission, reports, gamification, analytics, rewards, notifications.
- `src/components/`
  UI reusable untuk chart, form, layout, reward, dan PWA.
- `public/`
  Asset PWA seperti `sw.js`, icon, badge, dan manifest.

## Batasan implementasi saat ini

- Development lokal divalidasi dengan `SQLite`.
- Production tetap diasumsikan bisa dipindah ke `PostgreSQL` bila diperlukan.
- Web push bersifat enhancement; notification center tetap kanal utama.
- `middleware.ts` masih dipakai walau Next.js 16 sudah memberi peringatan migrasi ke `proxy`.
