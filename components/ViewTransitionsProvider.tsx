"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ViewTransitionsProvider() {
  const router = useRouter();

  useEffect(() => {
    if (!("startViewTransition" in document)) return;

    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("http") ||
        href.startsWith("javascript:") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.hasAttribute("download") ||
        anchor.getAttribute("target") === "_blank"
      ) {
        return;
      }

      e.preventDefault();

      const currentPath = window.location.pathname;
      const isGoingBack = href === currentPath.split("/").slice(0, -1).join("/");
      document.documentElement.setAttribute(
        "data-nav-direction",
        isGoingBack ? "back" : "forward"
      );

      (document as Document & { startViewTransition: (cb: () => void) => void })
        .startViewTransition(() => {
          router.push(href);
        });
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [router]);

  return null;
}
