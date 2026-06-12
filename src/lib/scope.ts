import type { Prisma, User } from "@prisma/client";

export type RequestScope = {
  villageId: string;
  rwId?: string | null;
  rtId?: string | null;
  role: User["role"];
};

export function resolveScope(user: Pick<User, "role" | "villageId" | "rwId" | "rtId">) {
  return {
    villageId: user.villageId,
    rwId: user.rwId,
    rtId: user.rtId,
    role: user.role,
  } satisfies RequestScope;
}

export function applyUserScope(scope: RequestScope): Prisma.UserWhereInput {
  if (scope.role === "ADMIN_RT") {
    return { villageId: scope.villageId, rwId: scope.rwId ?? undefined, rtId: scope.rtId ?? undefined };
  }

  if (scope.role === "ADMIN_RW") {
    return { villageId: scope.villageId, rwId: scope.rwId ?? undefined };
  }

  return { id: "__never__" };
}

export function applyReportScope(scope: RequestScope): Prisma.TransportReportWhereInput {
  const base: Prisma.TransportReportWhereInput = {
    user: {
      villageId: scope.villageId,
    },
  };

  if (scope.role === "ADMIN_RT") {
    base.user = {
      villageId: scope.villageId,
      rwId: scope.rwId ?? undefined,
      rtId: scope.rtId ?? undefined,
    };
  }

  if (scope.role === "ADMIN_RW") {
    base.user = {
      villageId: scope.villageId,
      rwId: scope.rwId ?? undefined,
    };
  }

  return base;
}
