"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { formatRupiah } from "@/lib/utils/format";
import type { LayananOption } from "@/lib/data";

interface LayananDropdownProps {
  layananList: LayananOption[];
  value: { id: string | null; nama: string | null };
  onChange: (id: string | null, nama: string | null, harga: number) => void;
  placeholder?: string;
  id?: string;
}

export default function LayananDropdown({
  layananList,
  value,
  onChange,
  placeholder = "Pilih layanan (opsional)",
  id,
}: LayananDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#EDF4FF] text-sm text-left flex items-center justify-between gap-2 hover:border-gray-300 transition-colors cursor-pointer"
      >
        <span className={value.nama ? "text-gray-800 font-medium" : "text-gray-400"}>
          {value.nama ?? placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto"
        >
          {/* Opsi "Tanpa Layanan" */}
          <button
            type="button"
            role="option"
            aria-selected={value.id === null}
            onClick={() => {
              onChange(null, null, 0);
              setOpen(false);
            }}
            className="w-full px-3.5 py-2.5 text-sm text-left text-gray-400 hover:bg-gray-50 italic border-b border-gray-100 cursor-pointer"
          >
            Tanpa layanan
          </button>

          {layananList.length === 0 && (
            <p className="px-3.5 py-3 text-xs text-gray-400 text-center italic">
              Belum ada layanan tersedia
            </p>
          )}

          {layananList.map((l) => (
            <button
              key={l.id}
              type="button"
              role="option"
              aria-selected={value.id === l.id}
              onClick={() => {
                onChange(l.id, l.nama_layanan, l.harga_dasar);
                setOpen(false);
              }}
              className="w-full px-3.5 py-2.5 text-sm text-left hover:bg-gray-50 flex items-center justify-between gap-2 border-b border-gray-50 last:border-0 cursor-pointer"
            >
              <span className="font-medium text-gray-800 truncate">{l.nama_layanan}</span>
              <span className="text-xs text-gray-400 shrink-0">{formatRupiah(l.harga_dasar)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
