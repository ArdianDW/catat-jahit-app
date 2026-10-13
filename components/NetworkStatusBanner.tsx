"use client";

import { useEffect, useState } from "react";

export default function NetworkStatusBanner() {
  const [status, setStatus] = useState<"online" | "offline" | "restored" | null>(null);

  useEffect(() => {
    if (!navigator.onLine) {
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
      restoreTimer = setTimeout(() => setStatus(null), 3000);
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
      className="fixed bottom-[72px] inset-x-0 z-[9998] flex justify-center px-4 pointer-events-none"
    >
      <div
        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-lg text-white text-sm font-medium transition-all duration-300 pointer-events-auto max-w-xs w-full justify-center ${
          isOffline
            ? "bg-[#B3261E]"
            : "bg-[#2E7D32]"
        }`}
        style={{
          animation: "slide-up-fade-in 0.3s ease-out both",
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
                d="M18.364 5.636a9 9 0 010 12.728M5.636 5.636a9 9 0 000 12.728M12 12h.01M9.172 9.172A4 4 0 0112 8m0 0a4 4 0 012.828 1.172M12 8V3m0 9v.01"
              />
            </svg>
            <span>Tidak ada koneksi internet</span>
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
            <span>Terhubung kembali</span>
          </>
        )}
      </div>

      <style>{`
        @keyframes slide-up-fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
