import type { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createSessionToken, sessionCookieName, verifySessionToken } from "@/auth.config";
import { db } from "@/lib/db";

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  return verifySessionToken(token);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return db.user.findUnique({
    where: { id: session.userId },
    include: {
      rw: true,
      rt: true,
      village: true,
    },
  });
}

export async function requireUser(roles?: UserRole[]) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  if (roles && !roles.includes(user.role)) {
    redirect(user.role === "WARGA" ? "/beranda" : "/admin/dashboard");
  }

  return user;
}

export async function startSession(user: {
  id: string;
  role: UserRole;
  villageId: string;
  rwId?: string | null;
  rtId?: string | null;
  fullName: string;
}) {
  const cookieStore = await cookies();
  const token = await createSessionToken({
    userId: user.id,
    role: user.role,
    villageId: user.villageId,
    rwId: user.rwId,
    rtId: user.rtId,
    name: user.fullName,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
  });

  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function signInWithPassword(email: string, password: string) {
  const user = await db.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return { ok: false as const, message: "Email tidak ditemukan." };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { ok: false as const, message: "Password salah." };
  }

  await startSession(user);

  return {
    ok: true as const,
    redirectTo: user.role === "WARGA" ? "/beranda" : "/admin/dashboard",
  };
}
