"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

const TYPE_CONFIG: Record<
  ToastType,
  { icon: React.ReactNode; bgClass: string; textClass: string }
> = {
  success: {
    icon: <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />,
    bgClass: "bg-[#6B8F71]",
    textClass: "text-white",
  },
  error: {
    icon: <AlertCircle className="w-4 h-4 shrink-0 text-white" />,
    bgClass: "bg-[#BA1A1A]",
    textClass: "text-white",
  },
  info: {
    icon: <AlertCircle className="w-4 h-4 shrink-0 text-white" />,
    bgClass: "bg-[#465F86]",
    textClass: "text-white",
  },
};

export default function Toast({
  message,
  type = "success",
  onClose,
  duration = 3500,
}: ToastProps) {
  const { icon, bgClass, textClass } = TYPE_CONFIG[type];

  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[9998] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl w-[calc(100%-2rem)] max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-200 ${bgClass} ${textClass}`}
    >
      {icon}
      <span className="text-sm font-semibold flex-1 leading-snug">{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup notifikasi"
        className="shrink-0 rounded-full p-1 text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
