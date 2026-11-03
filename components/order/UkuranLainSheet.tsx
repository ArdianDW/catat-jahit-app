"use client";

import { useEffect, useRef } from "react";
import { X, Ruler } from "lucide-react";
import MeasurementForm, { type MeasurementValues, EMPTY_MEASUREMENTS } from "./MeasurementForm";

export interface UkuranLainData extends MeasurementValues {
  ukuran_untuk: string;
}

export const EMPTY_UKURAN_LAIN: UkuranLainData = {
  ukuran_untuk: "",
  ...EMPTY_MEASUREMENTS,
};

interface UkuranLainSheetProps {
  isOpen: boolean;
  onClose: () => void;
  data: UkuranLainData;
  onChange: (updated: Partial<UkuranLainData>) => void;
  onConfirm: () => void;
  title?: string;
  namaBarang?: string;
  idPrefix?: string;
}

export default function UkuranLainSheet({
  isOpen,
  onClose,
  data,
  onChange,
  onConfirm,
  title = "Ukuran Lain",
  namaBarang,
  idPrefix = "ukuran-lain-sheet",
}: UkuranLainSheetProps) {
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const t = setTimeout(() => firstInputRef.current?.focus(), 120);
      return () => {
        clearTimeout(t);
        document.body.style.overflow = "";
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const measurementValues: MeasurementValues = {
    lingkar_dada: data.lingkar_dada,
    lingkar_pinggang: data.lingkar_pinggang,
    lingkar_pinggul: data.lingkar_pinggul,
    panjang_bahu: data.panjang_bahu,
    panjang_lengan: data.panjang_lengan,
    panjang_baju: data.panjang_baju,
    panjang_celana: data.panjang_celana,
    catatan_ukuran: data.catatan_ukuran,
  };

  const isValid = data.ukuran_untuk.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Sheet ukuran: ${title}`}
    >
      <div className="w-full max-h-[92dvh] bg-white rounded-t-3xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EFF3EE] flex items-center justify-center">
              <Ruler className="w-4 h-4 text-[#6B8F71]" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{title}</p>
              {namaBarang && (
                <p className="text-[11px] text-gray-400 truncate max-w-[180px]">
                  untuk: {namaBarang}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup sheet"
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`${idPrefix}-untuk`}
              className="text-xs font-semibold text-gray-600"
            >
              Untuk Siapa? *
            </label>
            <input
              id={`${idPrefix}-untuk`}
              ref={firstInputRef}
              type="text"
              value={data.ukuran_untuk}
              onChange={(e) => onChange({ ukuran_untuk: e.target.value })}
              placeholder="cth: Anak Pertama, Suami, Kakak"
              className="w-full min-h-[48px] px-3.5 py-3 rounded-xl border border-gray-200 bg-[#EDF4FF] text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#6B8F71] focus:ring-1 focus:ring-[#6B8F71]/20 transition-colors"
            />
            <p className="text-[11px] text-gray-400">
              Isi nama anggota keluarga pemilik ukuran ini
            </p>
          </div>

          <MeasurementForm
            values={measurementValues}
            onChange={(patch) => onChange(patch as Partial<UkuranLainData>)}
            showHeader={true}
            showCatatan={true}
            idPrefix={`${idPrefix}-measure`}
          />
        </div>

        <div className="px-5 py-4 border-t border-gray-100 shrink-0 bg-white">
          <button
            type="button"
            onClick={onConfirm}
            disabled={!isValid}
            className="w-full min-h-[52px] rounded-2xl bg-[#6B8F71] hover:bg-[#5a7b5f] text-white font-bold text-base shadow-sm active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Pakai untuk Barang Ini
          </button>
        </div>
      </div>
    </div>
  );
}
