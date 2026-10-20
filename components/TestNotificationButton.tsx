"use client";

import { useState } from "react";
import { BellRing, Loader2, Check, AlertCircle } from "lucide-react";
import { savePushSubscription, sendTestPushNotification } from "@/lib/actions/push";

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

export default function TestNotificationButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleTest = async () => {
    setIsLoading(true);
    setFeedback(null);

    try {
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        "serviceWorker" in navigator &&
        "PushManager" in window
      ) {
        let perm = Notification.permission;
        if (perm === "default") {
          perm = await Notification.requestPermission();
        }

        if (perm === "granted") {
          const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          if (vapidKey) {
            try {
              const registration = await navigator.serviceWorker.ready;
              let subscription = await registration.pushManager.getSubscription();
              if (!subscription) {
                subscription = await registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: urlBase64ToUint8Array(vapidKey),
                });
              }

              const subJson = subscription.toJSON();
              if (subJson.endpoint && subJson.keys?.p256dh && subJson.keys?.auth) {
                await savePushSubscription({
                  endpoint: subJson.endpoint,
                  keys: {
                    p256dh: subJson.keys.p256dh,
                    auth: subJson.keys.auth,
                  },
                });
              }
            } catch (swErr) {
              console.warn("ServiceWorker subscription error:", swErr);
            }
          }
        } else if (perm === "denied") {
          setFeedback({
            type: "error",
            text: "Izin notifikasi diblokir. Mohon izinkan notifikasi di pengaturan browser Anda.",
          });
          setIsLoading(false);
          return;
        }
      }

      const res = await sendTestPushNotification();

      if (res.success) {
        setFeedback({
          type: "success",
          text: res.message || "Notifikasi tes berhasil dikirim!",
        });
      } else {
        setFeedback({
          type: "error",
          text: res.message || "Gagal mengirim notifikasi tes.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setFeedback({
        type: "error",
        text: `Error: ${msg}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleTest}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 min-h-[46px] px-4 py-2.5 rounded-xl border border-dashed border-[#805200]/30 bg-[#FFF9F2] hover:bg-[#FFF3E5] active:scale-[0.98] text-[#805200] font-medium text-sm transition-all cursor-pointer w-full select-none disabled:opacity-60 shadow-2xs"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-[#805200]" />
            <span>Mengirim Notifikasi...</span>
          </>
        ) : (
          <>
            <BellRing className="w-4 h-4 shrink-0 text-[#805200]" />
            <span>Tes Kirim Notifikasi</span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#FFE0B2] text-[#805200]">
              Demo
            </span>
          </>
        )}
      </button>

      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center justify-between transition-all animate-in fade-in ${
            feedback.type === "success"
              ? "bg-[#EFF3EE] border border-[#6B8F71]/30 text-[#2D4733]"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <Check className="w-4 h-4 text-[#6B8F71] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="leading-tight">{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer font-bold ml-2 shrink-0"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
