# AGENT

## Aturan kerja

- Ikuti `SYSTEM_MAP.md` untuk lokasi file, entrypoint, dan alur sistem.
- Jangan ubah model domain tanpa alasan kuat dan tanpa menyelaraskan seed serta analytics.
- Semua mutasi penting harus dibungkus transaksi database:
  - approval laporan
  - redeem reward
  - refund reward
  - proses review admin
- Semua query admin wajib mengikuti scope RT/RW dari `src/lib/scope.ts`.
- Semua angka emisi ditampilkan sebagai `estimasi CO2e`, bukan inventaris resmi.
- Web push tidak boleh menjadi dependensi inti aplikasi. Jika gagal, notification center tetap harus bekerja.

## Urutan aman saat mengubah sistem

1. cek `schema.prisma`
2. cek seed dan enum terkait
3. cek feature action yang melakukan mutasi
4. cek halaman warga/admin yang membaca datanya
5. jalankan verifikasi di path tanpa spasi bila install lokal Windows bermasalah

## Catatan environment

- Path workspace utama mengandung spasi dan sempat memicu masalah `npm install` pada Windows.
- Verifikasi teknis berhasil di salinan kerja sementara tanpa spasi.
- Jika perlu install ulang dependency secara lokal, lebih aman jalankan proyek dari path tanpa spasi atau pastikan lockfile dan cache npm bersih.
