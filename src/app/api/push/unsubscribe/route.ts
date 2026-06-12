import { NextResponse } from "next/server";

import { requireUser } from "@/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const user = await requireUser(["WARGA"]);
  const payload = (await request.json()) as { endpoint?: string };

  if (!payload.endpoint) {
    return NextResponse.json({ ok: false, message: "Endpoint wajib diisi." }, { status: 400 });
  }

  await db.pushSubscription.deleteMany({
    where: {
      userId: user.id,
      endpoint: payload.endpoint,
    },
  });

  return NextResponse.json({ ok: true });
}
