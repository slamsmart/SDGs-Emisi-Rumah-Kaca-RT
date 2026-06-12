"use client";

import { useState } from "react";

function base64ToUint8Array(base64: string) {
  const normalized = base64.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const raw = atob(padded);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

export function PushOptInCard({ vapidPublicKey }: { vapidPublicKey: string }) {
  const [status, setStatus] = useState("Opt-in browser untuk pengingat program.");

  async function handleEnablePush() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("Browser ini belum mendukung web push.");
      return;
    }

    if (!vapidPublicKey) {
      setStatus("Kunci VAPID belum dikonfigurasi. In-app inbox tetap aktif.");
      return;
    }

    const registration = await navigator.serviceWorker.register("/sw.js");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setStatus("Izin notifikasi tidak diberikan.");
      return;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ToUint8Array(vapidPublicKey),
    });

    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription.toJSON()),
    });

    setStatus("Push notification aktif untuk perangkat ini.");
  }

  return (
    <section className="rounded-[28px] border border-[var(--color-app-border)] bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Push notification</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Aktifkan notifikasi browser untuk reminder pelaporan, update reward, dan broadcast program.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={handleEnablePush}
          className="rounded-2xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
        >
          Aktifkan push
        </button>
        <p className="text-sm text-slate-500">{status}</p>
      </div>
    </section>
  );
}
