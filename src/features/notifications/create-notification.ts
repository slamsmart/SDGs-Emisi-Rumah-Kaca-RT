import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

export async function createNotification(params: {
  villageId: string;
  title: string;
  body: string;
  href?: string;
  userIds?: string[];
  client?: Prisma.TransactionClient;
}) {
  const client = params.client ?? db;

  if (params.userIds?.length) {
    await client.notification.createMany({
      data: params.userIds.map((userId) => ({
        userId,
        villageId: params.villageId,
        title: params.title,
        body: params.body,
        href: params.href,
        channel: "IN_APP",
      })),
    });
    return;
  }

  await client.notification.create({
    data: {
      villageId: params.villageId,
      title: params.title,
      body: params.body,
      href: params.href,
      channel: "IN_APP",
    },
  });
}
