import type { UserRole } from "@prisma/client";

export const adminRoles: UserRole[] = ["ADMIN_RT", "ADMIN_RW"];

export function isAdmin(role: UserRole) {
  return adminRoles.includes(role);
}

export function assertRole(role: UserRole, allowed: UserRole[]) {
  if (!allowed.includes(role)) {
    throw new Error("Akses ditolak untuk peran ini.");
  }
}
