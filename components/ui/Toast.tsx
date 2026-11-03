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
  { icon: React.ReactNode; bgClass: string; textClass: string; borderClass: string }
> = {
  success: {
    icon: <CheckCircle2 className="w-4 h-4 shrink-0" />,
    bgClass: "bg-[#E8EFEA]",
    textClass: "text-[#2D4A2F]",
    borderClass: "border-[#6B8F71]/30",
  },
  error: {
    icon: <AlertCircle className="w-4 h-4 shrink-0" />,
    bgClass: "bg-red-50",
    textClass: "text-red-700",
    borderClass: "border-red-200",
  },
  info: {
    icon: <AlertCircle className="w-4 h-4 shrink-0" />,
    bgClass: "bg-blue-50",
    textClass: "text-blue-700",
    borderClass: "border-blue-200",
  },
};

export default function Toast({
  message,
  type = "success",
  onClose,
  duration = 3500,
}: ToastProps) {
  const { icon, bgClass, textClass, borderClass } = TYPE_CONFIG[type];

  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[9998] flex items-center gap-2.5 px-4 py-3 rounded-2xl border shadow-lg w-[calc(100%-2rem)] max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-200 ${bgClass} ${textClass} ${borderClass}`}
    >
      {icon}
      <span className="text-sm font-medium flex-1 leading-snug">{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup notifikasi"
        className="shrink-0 rounded-full p-0.5 hover:bg-black/10 transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
