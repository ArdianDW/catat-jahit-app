"use client";

import { useEffect, useState } from "react";

export default function NetworkStatusBanner() {
  const [status, setStatus] = useState<"offline" | "restored" | null>(null);

  useEffect(() => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setStatus("offline");
    }

    let restoreTimer: ReturnType<typeof setTimeout>;

    const handleOffline = () => {
      clearTimeout(restoreTimer);
      setStatus("offline");
    };

    const handleOnline = () => {
      clearTimeout(restoreTimer);
      setStatus("restored");
      restoreTimer = setTimeout(() => {
        setStatus(null);
      }, 3000);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      clearTimeout(restoreTimer);
    };
  }, []);

  if (!status) return null;

  const isOffline = status === "offline";

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`shrink-0 w-full px-4 py-2 flex items-center justify-center gap-2 text-white text-xs sm:text-sm font-medium z-20 transition-all duration-300 shadow-sm ${
        isOffline ? "bg-[#B3261E]" : "bg-[#2E7D32]"
      }`}
      style={{
        animation: "bannerSlideDown 0.25s ease-out both",
      }}
    >
      {isOffline ? (
        <>
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3l18 18M8.288 8.288A5.25 5.25 0 0112 7.5c1.38 0 2.632.532 3.563 1.4M5.106 11.856a9 9 0 0113.788 0M1.924 8.674c2.292-2.293 5.28-3.674 8.576-3.674m12 12a9 9 0 01-2.652 6.348"
            />
          </svg>
          <span className="tracking-wide">Tidak ada koneksi internet</span>
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          <span className="tracking-wide">Terhubung kembali ke internet</span>
        </>
      )}

      <style>{`
        @keyframes bannerSlideDown {
          from {
            opacity: 0;
            max-height: 0;
            padding-top: 0;
            padding-bottom: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            max-height: 48px;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
