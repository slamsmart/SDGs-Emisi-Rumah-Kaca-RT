# Jejak Hijau Warga

Aplikasi web enterprise-grade untuk program pengurangan emisi tingkat lokal dengan fokus pada aksi transport warga, gamifikasi poin, reward internal, notifikasi, dan dashboard admin RT/RW.

## Stack

- Next.js App Router
- TypeScript
- Prisma ORM
- SQLite untuk development lokal
- Session auth kustom berbasis signed cookie
- Recharts untuk dashboard

## Fitur inti

- Login warga dan admin RT/RW
- Self-report aksi transport
- Estimasi emisi aktual, baseline, dan emisi terhindarkan
- Poin, streak, dan badge
- Reward internal dan proses redemption
- Dashboard warga
- Dashboard admin RT/RW
- Notification center dan web push dasar

## Menjalankan lokal

1. Salin `.env.example` menjadi `.env`
2. Install dependency
3. Generate Prisma client
4. Push schema
5. Seed data demo
6. Jalankan server dev

Perintah:

```bash
npm install
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

## Akun demo

- `warga@demo.local` / `demo1234`
- `adminrt@demo.local` / `demo1234`
- `adminrw@demo.local` / `demo1234`

## Catatan Windows

Jika `npm install` bermasalah pada folder dengan spasi di path, jalankan proyek dari path kerja tanpa spasi. Kode aplikasi sudah diverifikasi build pada salinan kerja tanpa spasi.
