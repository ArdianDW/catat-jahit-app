"use client";

import { Ruler } from "lucide-react";

export interface MeasurementValues {
  lingkar_dada: string;
  lingkar_pinggang: string;
  lingkar_pinggul: string;
  panjang_bahu: string;
  panjang_lengan: string;
  panjang_baju: string;
  panjang_celana: string;
  catatan_ukuran: string;
}

export const EMPTY_MEASUREMENTS: MeasurementValues = {
  lingkar_dada: "",
  lingkar_pinggang: "",
  lingkar_pinggul: "",
  panjang_bahu: "",
  panjang_lengan: "",
  panjang_baju: "",
  panjang_celana: "",
  catatan_ukuran: "",
};

const MEASURE_FIELDS: { key: keyof Omit<MeasurementValues, "catatan_ukuran">; label: string }[] = [
  { key: "lingkar_dada", label: "Lingkar Dada" },
  { key: "lingkar_pinggang", label: "Lingkar Pinggang" },
  { key: "lingkar_pinggul", label: "Lingkar Pinggul" },
  { key: "panjang_bahu", label: "Panjang Bahu" },
  { key: "panjang_lengan", label: "Panjang Lengan" },
  { key: "panjang_baju", label: "Panjang Baju" },
  { key: "panjang_celana", label: "Panjang Celana/Rok" },
];

interface MeasurementFormProps {
  values: MeasurementValues;
  onChange: (updated: Partial<MeasurementValues>) => void;
  showHeader?: boolean;
  showCatatan?: boolean;
  idPrefix?: string;
}

export default function MeasurementForm({
  values,
  onChange,
  showHeader = true,
  showCatatan = true,
  idPrefix = "ukuran",
}: MeasurementFormProps) {
  return (
    <div className="flex flex-col gap-3">
      {showHeader && (
        <div className="flex items-center gap-1.5">
          <Ruler className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            Detail Ukuran (cm)
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        {MEASURE_FIELDS.map(({ key, label }) => (
          <div key={key} className="flex flex-col gap-1">
            <label
              htmlFor={`${idPrefix}-${key}`}
              className="text-[11px] font-medium text-gray-500"
            >
              {label}
            </label>
            <div className="relative">
              <input
                id={`${idPrefix}-${key}`}
                type="number"
                inputMode="decimal"
                min={0}
                max={300}
                step="0.5"
                value={values[key]}
                onChange={(e) => onChange({ [key]: e.target.value })}
                placeholder="–"
                className="w-full min-h-[40px] pl-3 pr-8 py-2 rounded-xl border border-gray-200 bg-[#EDF4FF] text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#6B8F71] focus:ring-1 focus:ring-[#6B8F71]/20 transition-colors"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-medium pointer-events-none">
                cm
              </span>
            </div>
          </div>
        ))}
      </div>

      {showCatatan && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`${idPrefix}-catatan`}
            className="text-xs font-medium text-gray-500"
          >
            Catatan Ukuran
          </label>
          <textarea
            id={`${idPrefix}-catatan`}
            rows={2}
            value={values.catatan_ukuran}
            onChange={(e) => onChange({ catatan_ukuran: e.target.value })}
            placeholder="cth: Lengan agak panjang, pinggang longgar sedikit"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[#EDF4FF] text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#6B8F71] focus:ring-1 focus:ring-[#6B8F71]/20 transition-colors resize-none"
          />
        </div>
      )}
    </div>
  );
}
