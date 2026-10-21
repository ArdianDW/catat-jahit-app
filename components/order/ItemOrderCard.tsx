"use client";

import { AlertCircle, ShoppingBag, Trash2 } from "lucide-react";
import LayananDropdown from "./LayananDropdown";
import MeasurementForm, { type MeasurementValues } from "./MeasurementForm";
import type { LayananOption } from "@/lib/data";
import type { TUkuranSumber } from "@/types";

export interface ItemForm {
  id: string;
  nama_item: string;
  layanan_id: string | null;
  layanan_nama: string | null;
  jumlah: number;
  harga_item: number;
  ukuran_sumber: TUkuranSumber;
  ukuran_untuk: string;
  lingkar_dada: string;
  lingkar_pinggang: string;
  lingkar_pinggul: string;
  panjang_bahu: string;
  panjang_lengan: string;
  panjang_baju: string;
  panjang_celana: string;
  catatan_ukuran: string;
}

export function createNewItem(): ItemForm {
  return {
    id: crypto.randomUUID(),
    nama_item: "",
    layanan_id: null,
    layanan_nama: null,
    jumlah: 1,
    harga_item: 0,
    ukuran_sumber: "pelanggan",
    ukuran_untuk: "",
    lingkar_dada: "",
    lingkar_pinggang: "",
    lingkar_pinggul: "",
    panjang_bahu: "",
    panjang_lengan: "",
    panjang_baju: "",
    panjang_celana: "",
    catatan_ukuran: "",
  };
}

interface ItemOrderCardProps {
  item: ItemForm;
  index: number;
  layananList: LayananOption[];
  /** Apakah pelanggan yang dipilih punya data ukuran tersimpan */
  pelangganHasUkuran: boolean;
  /** Tampilkan tombol hapus jika true */
  showRemove: boolean;
  onChange: (updated: ItemForm) => void;
  onRemove: () => void;
}

const UKURAN_SUMBER_OPTIONS: { value: TUkuranSumber; label: string }[] = [
  { value: "pelanggan", label: "Data Pelanggan" },
  { value: "lain", label: "Ukuran Lain" },
  { value: "tanpa", label: "Tanpa Ukuran" },
];

export default function ItemOrderCard({
  item,
  index,
  layananList,
  pelangganHasUkuran,
  showRemove,
  onChange,
  onRemove,
}: ItemOrderCardProps) {
  const upd = (patch: Partial<ItemForm>) => onChange({ ...item, ...patch });

  const measurementValues: MeasurementValues = {
    lingkar_dada: item.lingkar_dada,
    lingkar_pinggang: item.lingkar_pinggang,
    lingkar_pinggul: item.lingkar_pinggul,
    panjang_bahu: item.panjang_bahu,
    panjang_lengan: item.panjang_lengan,
    panjang_baju: item.panjang_baju,
    panjang_celana: item.panjang_celana,
    catatan_ukuran: item.catatan_ukuran,
  };

  const subtotal = item.harga_item * item.jumlah;
  const idPrefix = `item-${item.id}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-3.5 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#EFF3EE] flex items-center justify-center shrink-0">
            <ShoppingBag className="w-3.5 h-3.5 text-[#6B8F71]" />
          </div>
          <span className="text-sm font-bold text-gray-700">Barang {index + 1}</span>
        </div>
        {showRemove && (
          <button
            type="button"
            aria-label={`Hapus barang ${index + 1}`}
            onClick={onRemove}
            className="cursor-pointer p-1 text-red-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${idPrefix}-nama`} className="text-xs font-semibold text-gray-500">
          Nama Barang *
        </label>
        <input
          id={`${idPrefix}-nama`}
          type="text"
          value={item.nama_item}
          onChange={(e) => upd({ nama_item: e.target.value })}
          placeholder="cth: Baju Kebaya, Celana Panjang"
          className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#EDF4FF] text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#6B8F71] focus:ring-1 focus:ring-[#6B8F71]/20 transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${idPrefix}-layanan`} className="text-xs font-semibold text-gray-500">
          Layanan
        </label>
        <LayananDropdown
          id={`${idPrefix}-layanan`}
          layananList={layananList}
          value={{ id: item.layanan_id, nama: item.layanan_nama }}
          onChange={(id, nama, harga) =>
            upd({
              layanan_id: id,
              layanan_nama: nama,
              harga_item: harga > 0 ? harga : item.harga_item,
            })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${idPrefix}-jumlah`} className="text-xs font-semibold text-gray-500">
            Jumlah *
          </label>
          <input
            id={`${idPrefix}-jumlah`}
            type="number"
            inputMode="numeric"
            min={1}
            value={item.jumlah}
            onChange={(e) => upd({ jumlah: Math.max(1, parseInt(e.target.value) || 1) })}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#EDF4FF] text-sm text-gray-800 focus:outline-none focus:border-[#6B8F71] focus:ring-1 focus:ring-[#6B8F71]/20 transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${idPrefix}-harga`} className="text-xs font-semibold text-gray-500">
            Harga Satuan (Rp) *
          </label>
          <input
            id={`${idPrefix}-harga`}
            type="number"
            inputMode="numeric"
            min={0}
            value={item.harga_item || ""}
            onChange={(e) => upd({ harga_item: Math.max(0, parseInt(e.target.value) || 0) })}
            placeholder="0"
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#EDF4FF] text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#6B8F71] focus:ring-1 focus:ring-[#6B8F71]/20 transition-colors"
          />
        </div>
      </div>

      {subtotal > 0 && (
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#EFF3EE] border border-[#D5E4D7]">
          <span className="text-xs text-gray-500">
            {item.jumlah} × Rp {item.harga_item.toLocaleString("id-ID")}
          </span>
          <span className="text-sm font-bold text-[#6B8F71]">
            Rp {subtotal.toLocaleString("id-ID")}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-gray-500">Sumber Ukuran</span>
        <div className="grid grid-cols-3 gap-2">
          {UKURAN_SUMBER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              aria-pressed={item.ukuran_sumber === opt.value}
              onClick={() => upd({ ukuran_sumber: opt.value })}
              className={`py-2 px-2 rounded-lg border text-xs font-medium transition-all cursor-pointer text-center leading-tight ${
                item.ukuran_sumber === opt.value
                  ? "bg-[#6B8F71] border-[#6B8F71] text-white shadow-sm"
                  : "bg-[#EDF4FF] border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {item.ukuran_sumber === "pelanggan" && !pelangganHasUkuran && (
          <p className="text-[11px] text-amber-600 flex items-center gap-1 mt-0.5">
            <AlertCircle className="w-3 h-3 shrink-0" />
            Pelanggan belum punya data ukuran tersimpan
          </p>
        )}
      </div>

      {item.ukuran_sumber === "lain" && (
        <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`${idPrefix}-ukuran-untuk`}
              className="text-xs font-semibold text-gray-600"
            >
              Ukuran untuk (nama orang) *
            </label>
            <input
              id={`${idPrefix}-ukuran-untuk`}
              type="text"
              value={item.ukuran_untuk}
              onChange={(e) => upd({ ukuran_untuk: e.target.value })}
              placeholder="cth: Ibu, Anak Sulung, Kakak"
              className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-gray-200 bg-[#EDF4FF] text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#6B8F71] focus:ring-1 focus:ring-[#6B8F71]/20 transition-colors"
            />
          </div>

          {/* 7 field ukuran + catatan */}
          <MeasurementForm
            values={measurementValues}
            onChange={(patch) => upd(patch as Partial<ItemForm>)}
            showHeader={true}
            showCatatan={true}
            idPrefix={`${idPrefix}-measure`}
          />
        </div>
      )}
    </div>
  );
}
