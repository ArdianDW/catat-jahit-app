"use client";

import { getAvatarColors, getInitials } from "@/lib/utils/avatar";

type AvatarSize = "xs" | "sm" | "md" | "lg";

interface AvatarProps {
  name: string;
  seedId?: string;
  size?: AvatarSize;
  className?: string;
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: "w-8 h-8 text-xs",
  sm: "w-9 h-9 text-xs",
  md: "w-11 h-11 text-sm",
  lg: "w-12 h-12 text-sm",
};

export default function Avatar({ name, seedId, size = "md", className = "" }: AvatarProps) {
  const seed = seedId ? name + seedId : name;
  const { bg, text } = getAvatarColors(seed);
  const initials = getInitials(name);

  return (
    <div
      style={{ backgroundColor: bg, color: text }}
      className={`rounded-full flex items-center justify-center font-bold shrink-0 select-none shadow-xs ${SIZE_CLASSES[size]} ${className}`}
      aria-label={`Avatar ${name}`}
    >
      {initials}
    </div>
  );
}
