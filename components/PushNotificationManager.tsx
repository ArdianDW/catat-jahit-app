"use client";

import { useState, useSyncExternalStore } from "react";
import { Bell, BellRing, Loader2, X } from "lucide-react";
import { savePushSubscription } from "@/lib/actions/push";

const emptySubscribe = () => () => {};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager() {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [overridePermission, setOverridePermission] = useState<NotificationPermission | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  const isSupported =
    isClient &&
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  const permission =
    overridePermission ??
    (isClient && typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "default");

  const dismissed =
    isDismissed ||
    (isClient && typeof window !== "undefined"
      ? sessionStorage.getItem("catatjahit_push_dismissed") === "true"
      : false);

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    setErrorMsg(null);

    try {
      const perm = await Notification.requestPermission();
      setOverridePermission(perm);

      if (perm !== "granted") {
        setIsSubscribing(false);
        return;
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        throw new Error("VAPID public key tidak ditemukan");
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
      }

      const subJson = subscription.toJSON();
      if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
        throw new Error("Format subscription browser tidak valid");
      }

      const res = await savePushSubscription({
        endpoint: subJson.endpoint,
        keys: {
          p256dh: subJson.keys.p256dh,
          auth: subJson.keys.auth,
        },
      });

      if (!res.success) {
        throw new Error(res.error || "Gagal menyimpan langganan notifikasi");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengaktifkan notifikasi";
      setErrorMsg(`Gagal: ${msg}`);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("catatjahit_push_dismissed", "true");
    }
  };

  if (!isClient || !isSupported) return null;

  if (permission === "default" && !dismissed) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EBE4D8] mb-4 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EFF3EE] flex items-center justify-center shrink-0">
            <BellRing className="w-5 h-5 text-[#6B8F71]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-gray-800">
                Pengingat Deadline Otomatis
              </h4>
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Tutup saran notifikasi"
                className="text-gray-400 hover:text-gray-600 p-1 -mr-1 -mt-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              Dapatkan notifikasi di HP setiap jam <strong>08:00 WIB</strong> untuk pesanan yang mendekati deadline (H-3 s.d Hari H).
            </p>

            {errorMsg && (
              <p className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded-lg border border-red-100">
                {errorMsg}
              </p>
            )}

            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={handleSubscribe}
                disabled={isSubscribing}
                className="px-3.5 py-1.5 rounded-lg bg-[#6B8F71] hover:bg-[#5a7b5f] text-white font-semibold text-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubscribing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengaktifkan...</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-3.5 h-3.5" />
                    <span>Aktifkan Notifikasi</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="px-2.5 py-1.5 rounded-lg text-gray-500 hover:text-gray-700 text-xs font-medium"
              >
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
