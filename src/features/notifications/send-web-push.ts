import { db } from "@/lib/db";
import { env } from "@/lib/env";

type PushPayload = {
  title: string;
  body: string;
  href?: string;
};

export async function sendWebPush(userIds: string[], payload: PushPayload) {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY || !userIds.length) {
    return { sent: 0, skipped: true };
  }

  const subscriptions = await db.pushSubscription.findMany({
    where: {
      userId: { in: userIds },
    },
  });

  if (!subscriptions.length) {
    return { sent: 0, skipped: true };
  }

  const webPush = (await import("web-push")).default;
  webPush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);

  const message = JSON.stringify(payload);
  let sent = 0;
  for (const subscription of subscriptions) {
    try {
      await webPush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        message,
      );
      sent += 1;
    } catch {
      // Inbox in-app tetap menjadi kanal utama ketika push gagal.
    }
  }

  return { sent, skipped: false };
}
