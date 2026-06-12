const fallbackSecret = "demo-auth-secret-jejak-hijau-rt-rw-2026";

export const env = {
  DATABASE_URL: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  AUTH_SECRET: process.env.AUTH_SECRET ?? fallbackSecret,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? "Jejak Hijau Warga",
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "",
  VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY ?? "",
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY ?? "",
  VAPID_SUBJECT: process.env.VAPID_SUBJECT ?? "mailto:admin@example.local",
};
