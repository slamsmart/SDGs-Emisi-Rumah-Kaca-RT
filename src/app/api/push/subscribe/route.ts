import { NextResponse } from "next/server";

import { requireUser } from "@/auth";
import { db } from "@/lib/db";

type PushSubscriptionPayload = {
  endpoint: string;
  expirationTime?: number | null;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

export async function POST(request: Request) {
  const user = await requireUser(["WARGA"]);
  const payload = (await request.json()) as PushSubscriptionPayload;

  if (!payload.endpoint || !payload.keys?.p256dh || !payload.keys?.auth) {
    return NextResponse.json({ ok: false, message: "Payload subscription tidak valid." }, { status: 400 });
  }

  await db.pushSubscription.upsert({
    where: { endpoint: payload.endpoint },
    update: {
      p256dh: payload.keys.p256dh,
      auth: payload.keys.auth,
    },
    create: {
      userId: user.id,
      endpoint: payload.endpoint,
      p256dh: payload.keys.p256dh,
      auth: payload.keys.auth,
    },
  });

  return NextResponse.json({ ok: true });
}
