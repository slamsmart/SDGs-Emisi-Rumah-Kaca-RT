"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Pendaftaran worker bersifat best-effort untuk MVP.
      });
    }
  }, []);

  return null;
}
