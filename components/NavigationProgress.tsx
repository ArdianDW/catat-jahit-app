"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      setWidth(100);
      timerRef.current = setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 300);
    }
  }, [pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("javascript")) return;
      if (href === pathname) return;

      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);

      setVisible(true);
      setWidth(10);

      let progress = 10;
      intervalRef.current = setInterval(() => {
        progress += Math.random() * 12;
        if (progress >= 85) {
          progress = 85;
          clearInterval(intervalRef.current!);
        }
        setWidth(progress);
      }, 200);
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      role="progressbar"
      aria-label="Memuat halaman"
      className="fixed top-0 left-0 z-[9999] h-[3px] pointer-events-none"
      style={{
        width: `${width}%`,
        background: "linear-gradient(90deg, #a8d5b0, #6B8F71, #4a7a52)",
        transition: width === 100 ? "width 0.2s ease-out" : "width 0.4s ease-out",
        boxShadow: "0 0 8px rgba(107,143,113,0.6)",
        borderRadius: "0 2px 2px 0",
      }}
    />
  );
}
