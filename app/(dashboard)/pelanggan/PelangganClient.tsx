"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Users,
  Ruler,
  Phone,
  MapPin,
  ChevronRight,
} from "lucide-react";
import type { PelangganItem } from "@/lib/data";

const AVATAR_PALETTES = [
  { bg: "#DCF8C6", text: "#075E54" },
  { bg: "#D0E4FF", text: "#004881" },
  { bg: "#FFE0B2", text: "#E65100" },
  { bg: "#FCE4EC", text: "#C2185B" },
  { bg: "#E8EAF6", text: "#283593" },
  { bg: "#E0F2F1", text: "#00695C" },
];

function getAvatarColors(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatDateIndo(dateStr: string | null) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.slice(0, 10).split("-").map(Number);
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

interface PelangganClientProps {
  initialPelanggan: PelangganItem[];
}

export default function PelangganClient({ initialPelanggan }: PelangganClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = initialPelanggan.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      p.nama_pelanggan.toLowerCase().includes(q) ||
      p.no_hp.includes(q) ||
      (p.alamat_singkat || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
          Daftar Pelanggan
        </h2>
        <p className="text-xs text-gray-400">
          {initialPelanggan.length} pelanggan terdaftar
        </p>
      </section>

      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama, nomor HP, atau alamat..."
          className="w-full bg-white border border-gray-200/90 rounded-xl pl-9.5 pr-8 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#6B8F71] focus:ring-1 focus:ring-[#6B8F71]/30 shadow-2xs transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center gap-3 py-16">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <Users className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-sm font-bold text-gray-700">
            {searchQuery
              ? `Tidak ditemukan untuk "${searchQuery}"`
              : "Belum ada pelanggan"}
          </p>
          <p className="text-xs text-gray-400 max-w-[250px] leading-relaxed">
            {searchQuery
              ? "Coba kata kunci lain atau tekan silang untuk membatalkan pencarian."
              : "Tambah pelanggan pertama dengan tombol di bawah."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((p) => {
            const avatar = getAvatarColors(p.nama_pelanggan + p.id);
            const initials = getInitials(p.nama_pelanggan);
            const hasUkuran = !!(
              p.lingkar_dada ||
              p.lingkar_pinggang ||
              p.lingkar_pinggul ||
              p.panjang_bahu ||
              p.panjang_lengan ||
              p.panjang_baju ||
              p.panjang_celana
            );
            const tglDiukur = formatDateIndo(p.tanggal_terakhir_diukur);

            return (
              <div
                key={p.id}
                onClick={() => router.push(`/pelanggan/${p.id}`)}
                className="bg-white rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3 p-3.5 transition-all hover:border-[#6B8F71]/60 hover:shadow-sm cursor-pointer group select-none active:scale-[0.99]"
              >
                <div
                  style={{ backgroundColor: avatar.bg, color: avatar.text }}
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs"
                >
                  {initials}
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <p className="text-sm font-bold text-gray-800 truncate group-hover:text-[#6B8F71] transition-colors">
                    {p.nama_pelanggan}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                    <span>{p.no_hp}</span>
                  </div>

                  {p.alamat_singkat && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                      <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="truncate">{p.alamat_singkat}</span>
                    </div>
                  )}

                  {hasUkuran && (
                    <div className="flex items-center gap-1 mt-1">
                      <Ruler className="w-3 h-3 text-[#6B8F71] shrink-0" />
                      <span className="text-[11px] text-[#6B8F71] font-semibold">
                        Ada ukuran
                      </span>
                    </div>
                  )}
                </div>

                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#6B8F71] shrink-0 transition-colors" />
              </div>
            );
          })}
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
