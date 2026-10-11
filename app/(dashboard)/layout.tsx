"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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
  const isFormPage = isTambahOrder || isTambahPelanggan || isTambahLayanan;

  const formTitle = isTambahOrder
    ? "Tambah Order"
    : isTambahPelanggan
    ? "Tambah Pelanggan"
    : isTambahLayanan
    ? "Tambah Layanan"
    : "";

  const singlePageFab = isOrder
    ? { label: "Tambah Order", href: "/order/baru", colorClass: "bg-[#6B8F71] hover:bg-[#5a7b5f]" }
    : isPelanggan
    ? { label: "Tambah Pelanggan", href: "/pelanggan/baru", colorClass: "bg-[#6B8F71] hover:bg-[#5a7b5f]" }
    : isLayanan
    ? { label: "Tambah Layanan", href: "/layanan/baru", colorClass: "bg-[#6B8F71] hover:bg-[#5a7b5f]" }
    : null;

  const handleHeaderBack = () => {
    router.back();
  };

  const navItems = [
    { label: "Beranda", href: "/beranda", icon: "🏠" },
    { label: "Order", href: "/order", icon: "📋" },
    { label: "Pelanggan", href: "/pelanggan", icon: "👤" },
    { label: "Layanan", href: "/layanan", icon: "✂️" },
  ];

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-[#FAF6EE] border-x border-gray-200 relative overflow-hidden">
      {/* Top Header Bar */}
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
            {/* Icon Gunting */}
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

      {/* Main Content (Scrollable) */}
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {children}
      </main>

      {/* Floating Action Button (FAB) khusus di Beranda */}
      {isBeranda && (
        <>
          {/* Backdrop ketika FAB dibuka */}
          {fabOpen && (
            <div
              className="absolute inset-0 bg-black/25 z-20 transition-opacity backdrop-blur-[1px]"
              onClick={() => setFabOpen(false)}
            />
          )}

          <div className="absolute bottom-20 right-4 flex flex-col items-end gap-2.5 z-30">
            {/* Opsi 1: Tambah Order */}
            <div
              className={`flex items-center gap-2 transition-all duration-300 ease-out origin-bottom-right ${
                fabOpen
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

            {/* Opsi 2: Tambah Pelanggan */}
            <div
              className={`flex items-center gap-2 transition-all duration-300 delay-75 ease-out origin-bottom-right ${
                fabOpen
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

            {/* Tombol Utama (+) dengan Animasi Rotasi */}
            <button
              type="button"
              onClick={() => setFabOpen((prev) => !prev)}
              aria-label="Tambah baru"
              className={`w-14 h-14 bg-[#6B8F71] text-white rounded-full shadow-xl flex items-center justify-center text-3xl font-light hover:bg-[#5a7b5f] active:scale-95 transition-transform duration-300 cursor-pointer ${
                fabOpen ? "rotate-45 bg-[#5a7b5f]" : "rotate-0"
              }`}
            >
              +
            </button>
          </div>
        </>
      )}

      {/* Floating Action Button untuk Order, Pelanggan, dan Layanan */}
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

      {/* Bottom Navigation */}
      <nav className="shrink-0 bg-white border-t border-gray-200 grid grid-cols-4 z-10 min-h-[64px]">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
                isActive
                  ? "text-[#6B8F71] font-semibold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="text-xl leading-none mb-1">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
