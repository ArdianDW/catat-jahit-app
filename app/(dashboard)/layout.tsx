"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Scissors, Users, Tag } from "lucide-react";
import NetworkStatusBanner from "@/components/NetworkStatusBanner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [fabOpen, setFabOpen] = useState(false);

  const isBeranda = pathname === "/beranda";
  const isOrder = pathname === "/order";
  const isPelanggan = pathname === "/pelanggan";
  const isLayanan = pathname === "/layanan";

  const isTambahOrder = pathname.startsWith("/order/baru");
  const isTambahPelanggan = pathname.startsWith("/pelanggan/baru");
  const isTambahLayanan = pathname.startsWith("/layanan/baru");
  const isEditPelanggan = /^\/pelanggan\/[^/]+\/edit/.test(pathname);
  const isEditOrder = /^\/order\/[^/]+\/edit/.test(pathname);
  const isDetailPelanggan = /^\/pelanggan\/[^/]+$/.test(pathname) && !isTambahPelanggan;
  const isDetailOrder = pathname.startsWith("/order/") && !isTambahOrder && !isEditOrder;
  const isFormPage =
    isTambahOrder ||
    isTambahPelanggan ||
    isTambahLayanan ||
    isDetailPelanggan ||
    isDetailOrder ||
    isEditPelanggan ||
    isEditOrder;

  const formTitle = isTambahOrder
    ? "Tambah Order"
    : isTambahPelanggan
      ? "Tambah Pelanggan"
      : isTambahLayanan
        ? "Tambah Layanan"
        : isEditPelanggan
          ? "Edit Pelanggan"
          : isEditOrder
            ? "Edit Order"
            : isDetailPelanggan
              ? "Profil Pelanggan"
              : isDetailOrder
                ? "Detail Order"
                : "";

  const singlePageFab = isOrder
    ? { label: "Tambah Order", href: "/order/baru", colorClass: "bg-[#6B8F71] hover:bg-[#5a7b5f]" }
    : isPelanggan
      ? { label: "Tambah Pelanggan", href: "/pelanggan/baru", colorClass: "bg-[#6B8F71] hover:bg-[#5a7b5f]" }
      : isLayanan
        ? { label: "Tambah Layanan", href: "/layanan/baru", colorClass: "bg-[#6B8F71] hover:bg-[#5a7b5f]" }
        : null;

  const handleHeaderBack = () => {
    document.documentElement.setAttribute("data-nav-direction", "back");
    if ("startViewTransition" in document) {
      (document as Document & { startViewTransition: (cb: () => void) => void })
        .startViewTransition(() => {
          router.back();
        });
    } else {
      router.back();
    }
  };

  const navItems = [
    { label: "Beranda", href: "/beranda", icon: Home },
    { label: "Order", href: "/order", icon: Scissors },
    { label: "Pelanggan", href: "/pelanggan", icon: Users },
    { label: "Layanan", href: "/layanan", icon: Tag },
  ];

  return (
    <div className="flex flex-col h-dvh w-full max-w-md mx-auto bg-[#FAF6EE] border-x border-gray-200 relative overflow-hidden">
      <header className="bg-[#6B8F71] text-white px-4 py-3.5 shadow-sm shrink-0 flex items-center justify-between relative z-10 min-h-[56px]">
        {isFormPage ? (
          <>
            <button
              type="button"
              onClick={handleHeaderBack}
              className="flex items-center gap-1.5 text-white hover:text-white/80 active:scale-95 transition-all cursor-pointer font-medium text-sm py-1 z-10"
            >
              <svg
                className="w-5 h-5 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              <span>Kembali</span>
            </button>
            <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold tracking-wide text-white pointer-events-none whitespace-nowrap">
              {formTitle}
            </h1>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-white shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <circle cx="6" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <line x1="20" y1="4" x2="8.12" y2="15.88" />
              <line x1="14.47" y1="14.48" x2="20" y2="20" />
              <line x1="8.12" y1="8.12" x2="12" y2="12" />
            </svg>
            <h1 className="text-lg font-semibold tracking-wide">
              CatatJahit
            </h1>
          </div>
        )}
      </header>

      <NetworkStatusBanner />

      <main className="flex-1 overflow-y-auto p-4 pb-24 overscroll-y-contain">
        {children}
      </main>

      {isBeranda && (
        <>
          {fabOpen && (
            <div
              className="absolute inset-0 bg-black/25 z-20 transition-opacity backdrop-blur-[1px]"
              onClick={() => setFabOpen(false)}
            />
          )}

          <div className="absolute bottom-20 right-4 flex flex-col items-end gap-2.5 z-30">
            <div
              className={`flex items-center gap-2 transition-all duration-300 ease-out origin-bottom-right ${fabOpen
                ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                : "opacity-0 translate-y-4 scale-75 pointer-events-none"
                }`}
            >
              <span className="bg-white/95 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-md shadow-md border border-gray-100">
                Order
              </span>
              <Link
                href="/order/baru"
                onClick={() => setFabOpen(false)}
                aria-label="Tambah Order"
                className="w-12 h-12 rounded-full bg-[#6B8F71] hover:bg-[#5a7b5f] text-white shadow-lg flex items-center justify-center transition-all active:scale-95"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.3"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </Link>
            </div>

            <div
              className={`flex items-center gap-2 transition-all duration-300 delay-75 ease-out origin-bottom-right ${fabOpen
                ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                : "opacity-0 translate-y-4 scale-75 pointer-events-none"
                }`}
            >
              <span className="bg-white/95 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-md shadow-md border border-gray-100">
                Pelanggan
              </span>
              <Link
                href="/pelanggan/baru"
                onClick={() => setFabOpen(false)}
                aria-label="Tambah Pelanggan"
                className="w-12 h-12 rounded-full bg-[#6B8F71] hover:bg-[#5a7b5f] text-white shadow-lg flex items-center justify-center transition-all active:scale-95"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 7.5v6m3-3h-6m-1.5 7.5a6 6 0 11-12 0 6 6 0 0112 0zm-6-8.25a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z"
                  />
                </svg>
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setFabOpen((prev) => !prev)}
              aria-label="Tambah baru"
              className={`w-14 h-14 bg-[#6B8F71] text-white rounded-full shadow-xl flex items-center justify-center text-3xl font-light hover:bg-[#5a7b5f] active:scale-95 transition-transform duration-300 cursor-pointer ${fabOpen ? "rotate-45 bg-[#5a7b5f]" : "rotate-0"
                }`}
            >
              +
            </button>
          </div>
        </>
      )}

      {singlePageFab && (
        <div className="absolute bottom-20 right-4 z-30">
          <Link
            href={singlePageFab.href}
            aria-label={singlePageFab.label}
            className={`flex items-center gap-1.5 px-4 py-3 rounded-full text-white font-medium text-sm shadow-xl active:scale-95 transition-all cursor-pointer ${singlePageFab.colorClass}`}
          >
            <span className="text-base font-semibold leading-none">+</span>
            <span>{singlePageFab.label}</span>
          </Link>
        </div>
      )}

      <nav className="shrink-0 bg-white border-t border-gray-200 grid grid-cols-4 z-10 min-h-[64px] shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-h-[56px] py-1.5 transition-all select-none active:scale-95 ${isActive
                ? "text-[#6B8F71] font-semibold"
                : "text-gray-400 hover:text-gray-600"
                }`}
            >
              <Icon
                className={`w-5 h-5 mb-1 transition-transform duration-200 ${isActive ? "scale-110" : ""
                  }`}
                strokeWidth={isActive ? 2.3 : 1.8}
              />
              <span className={`text-[11px] leading-tight ${isActive ? "font-semibold" : "font-medium"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
