"use client";

import { Clock, Scissors, CheckCircle2, PackageCheck } from "lucide-react";
import type { StatusOrder } from "@/lib/data";

type BadgeSize = "sm" | "md";

interface StatusBadgeProps {
  status: StatusOrder;
  size?: BadgeSize;
  className?: string;
}

const STATUS_CONFIG: Record<
  StatusOrder,
  { icon: React.ReactNode; label: string; cls: string }
> = {
  Antri: {
    icon: <Clock className="w-3.5 h-3.5" />,
    label: "Antri",
    cls: "bg-[#BA1A1A] text-white",
  },
  Dikerjakan: {
    icon: <Scissors className="w-3.5 h-3.5" />,
    label: "Dikerjakan",
    cls: "bg-[#424842] text-white",
  },
  Selesai: {
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    label: "Selesai",
    cls: "bg-[#465F86] text-white",
  },
  Diambil: {
    icon: <PackageCheck className="w-3.5 h-3.5" />,
    label: "Diambil",
    cls: "bg-[#6B8F71] text-white",
  },
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-xs",
};

export default function StatusBadge({ status, size = "sm", className = "" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    icon: null,
    label: status,
    cls: "bg-gray-400 text-white",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold shadow-2xs ${config.cls} ${SIZE_CLASSES[size]} ${className}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
