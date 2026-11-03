"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type ProgressState = "idle" | "navigating" | "completing";

export default function NavigationProgress() {
  const pathname = usePathname();
  const [state, setState] = useState<ProgressState>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;

      if (timerRef.current) clearTimeout(timerRef.current);
      setState("completing");

      timerRef.current = setTimeout(() => {
        setState("idle");
      }, 400);
    }
  }, [pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("http") ||
        href.startsWith("javascript")
      )
        return;
      if (href === pathname) return;

      if (timerRef.current) clearTimeout(timerRef.current);
      setState("navigating");
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);

  if (state === "idle") return null;

  return (
    <>
      <style>{`
        @keyframes nav-progress {
          from { width: 5%; }
          to   { width: 82%; }
        }
      `}</style>
      <div
        role="progressbar"
        aria-label="Memuat halaman"
        className="fixed top-0 left-0 z-[9999] h-[3px] pointer-events-none"
        style={
          state === "navigating"
            ? {
                animation: "nav-progress 8s cubic-bezier(0.1, 0.05, 0.0, 1) forwards",
                background: "linear-gradient(90deg, #a8d5b0, #6B8F71, #4a7a52)",
                boxShadow: "0 0 8px rgba(107,143,113,0.6)",
                borderRadius: "0 2px 2px 0",
              }
            : {
                width: "100%",
                transition: "width 0.25s ease-out",
                background: "linear-gradient(90deg, #a8d5b0, #6B8F71, #4a7a52)",
                boxShadow: "0 0 8px rgba(107,143,113,0.6)",
                borderRadius: "0 2px 2px 0",
                opacity: 0,
                transitionProperty: "width, opacity",
                transitionDuration: "0.25s, 0.3s",
                transitionDelay: "0s, 0.1s",
              }
        }
      />
    </>
  );
}
