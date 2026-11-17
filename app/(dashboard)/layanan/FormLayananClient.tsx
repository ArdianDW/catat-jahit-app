"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Scissors,
  Tag,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Check,
  Plus,
  PowerOff,
  Power,
} from "lucide-react";
import {
  createLayanan,
  updateLayanan,
  type CreateLayananInput,
} from "@/lib/actions/layanan";
import { filterTextInput } from "@/lib/utils/sanitize";
import type { LayananItem } from "@/lib/data";

interface FormLayananClientProps {
  mode: "tambah" | "edit";
  layanan?: LayananItem;
}

const PRESET_PRICES: Record<"Jahit" | "Permak", number[]> = {
  Jahit: [50000, 75000, 80000, 90000, 100000, 120000],
  Permak: [10000, 15000, 20000, 25000, 35000, 50000],
};

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export default function FormLayananClient({
  mode,
  layanan,
}: FormLayananClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [jenis, setJenis] = useState<"Jahit" | "Permak">(
    layanan?.jenis ?? "Jahit"
  );
  const [namaLayanan, setNamaLayanan] = useState(layanan?.nama_layanan ?? "");
  const [hargaRaw, setHargaRaw] = useState<string>(
    layanan?.harga_dasar !== undefined ? layanan.harga_dasar.toString() : ""
  );
  const [deskripsi, setDeskripsi] = useState(layanan?.deskripsi ?? "");
  const [aktif, setAktif] = useState<boolean>(layanan?.aktif ?? true);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const numericHarga = parseInt(hargaRaw.replace(/\D/g, ""), 10) || 0;

  const handleHargaChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "");
    const clamped = cleaned ? Math.min(parseInt(cleaned), 10_000_000) : 0;
    setHargaRaw(clamped ? String(clamped) : cleaned);
  };

  const applyPresetPrice = (amount: number) => {
    setHargaRaw(amount.toString());
  };

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const errs: Record<string, string> = {};
    if (!namaLayanan.trim()) errs.namaLayanan = "Nama layanan tidak boleh kosong";
    if (isNaN(numericHarga) || numericHarga < 0) errs.harga = "Harga dasar harus berupa angka minimal 0";
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});

    startTransition(async () => {
      const input: CreateLayananInput = {
        nama_layanan: namaLayanan.trim(),
        harga_dasar: numericHarga,
        deskripsi: deskripsi.trim() || null,
        jenis,
        aktif,
      };

      if (mode === "edit" && layanan) {
        const result = await updateLayanan(layanan.id, input);
        if (!result.success) {
          setError(result.error || "Gagal memperbarui layanan");
          return;
        }
        setSuccess("Layanan berhasil diperbarui!");
      } else {
        const result = await createLayanan(input);
        if (!result.success) {
          setError(result.error || "Gagal menyimpan layanan");
          return;
        }
        setSuccess("Layanan baru berhasil ditambahkan!");
      }
    });
  };

  const handleAddAnother = () => {
    setSuccess(null);
    setNamaLayanan("");
    setHargaRaw("");
    setDeskripsi("");
    setError(null);
    setFieldErrors({});
  };

  return (
    <div className="flex flex-col min-h-full pb-8">
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center gap-4 z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-[#E8EFEA] flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-9 h-9 text-[#6B8F71]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-gray-900">
                {mode === "edit" ? "Perubahan Disimpan!" : "Layanan Tersimpan!"}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed px-2">
                {mode === "edit"
                  ? `Layanan "${namaLayanan}" telah berhasil diperbarui dan tersimpan di database.`
                  : `Layanan "${namaLayanan}" telah ditambahkan ke katalog dan siap digunakan dalam pembuatan order.`}
              </p>
            </div>

            <div className="w-full flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => router.push("/layanan")}
                className="w-full min-h-[46px] rounded-xl bg-[#6B8F71] hover:bg-[#5a7b5f] text-white font-semibold text-xs shadow-sm active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Lihat Katalog Layanan</span>
              </button>

              {mode === "tambah" && (
                <button
                  type="button"
                  onClick={handleAddAnother}
                  className="w-full min-h-[46px] rounded-xl bg-[#D8E4F3] hover:bg-[#c6d7ec] text-gray-700 font-medium text-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Layanan Lain</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3.5 py-3 rounded-2xl text-xs flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-700 p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 flex flex-col gap-4 shadow-xs">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700">
                Kategori Jenis Order
              </label>
              <span className="text-xs font-bold text-red-500">Wajib</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setJenis("Jahit")}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all cursor-pointer text-center gap-1.5 active:scale-95 ${
                  jenis === "Jahit"
                    ? "border-[#6B8F71] bg-[#6B8F71] text-white shadow-2xs"
                    : "border-gray-200 bg-[#EDF4FF] text-gray-600 hover:bg-[#D8E4F3]"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    jenis === "Jahit"
                      ? "bg-white/20 text-white"
                      : "bg-white text-gray-500"
                  }`}
                >
                  <Scissors className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs">Jahit Baru</span>
                <span
                  className={`text-[10px] line-clamp-1 ${
                    jenis === "Jahit" ? "text-white/80" : "text-gray-500"
                  }`}
                >
                  Pakaian & seragam baru
                </span>
              </button>

              <button
                type="button"
                onClick={() => setJenis("Permak")}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all cursor-pointer text-center gap-1.5 active:scale-95 ${
                  jenis === "Permak"
                    ? "border-[#1F3A5F] bg-[#1F3A5F] text-white shadow-2xs"
                    : "border-gray-200 bg-[#EDF4FF] text-gray-600 hover:bg-[#D8E4F3]"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    jenis === "Permak"
                      ? "bg-white/20 text-white"
                      : "bg-white text-gray-500"
                  }`}
                >
                  <Tag className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs">Permak / Reparasi</span>
                <span
                  className={`text-[10px] line-clamp-1 ${
                    jenis === "Permak" ? "text-white/80" : "text-gray-500"
                  }`}
                >
                  Potong, kecilkan, resleting
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700">
                Nama Layanan
              </label>
              <span className="text-xs font-bold text-red-500">Wajib</span>
            </div>

            <input
              type="text"
              value={namaLayanan}
              onChange={(e) => { setNamaLayanan(filterTextInput(e.target.value)); setFieldErrors((p) => ({ ...p, namaLayanan: "" })); }}
              maxLength={100}
              placeholder={
                jenis === "Jahit"
                  ? "cth: Jahit Seragam SD, Jahit Gamis Dewasa"
                  : "cth: Permak Celana Levis, Ganti Resleting"
              }
              className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border bg-[#EDF4FF] text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 transition-colors ${fieldErrors.namaLayanan ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "border-gray-200 focus:border-[#6B8F71] focus:ring-[#6B8F71]/20"}`}
            />
            {fieldErrors.namaLayanan && (
              <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {fieldErrors.namaLayanan}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700">
                Harga Dasar
              </label>
              <span className="text-xs font-bold text-red-500">Wajib</span>
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-sm font-bold text-gray-500 select-none">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={numericHarga ? numericHarga.toLocaleString("id-ID") : ""}
                onChange={(e) => { handleHargaChange(e.target.value); setFieldErrors((p) => ({ ...p, harga: "" })); }}
                placeholder="0"
                className={`w-full min-h-[44px] pl-10 pr-3.5 py-2.5 rounded-xl border bg-[#EDF4FF] text-sm font-bold text-gray-800 focus:outline-none focus:ring-1 transition-colors ${fieldErrors.harga ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "border-gray-200 focus:border-[#6B8F71] focus:ring-[#6B8F71]/20"}`}
              />
            </div>
            {fieldErrors.harga && (
              <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {fieldErrors.harga}
              </p>
            )}

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {PRESET_PRICES[jenis].map((price) => (
                <button
                  key={price}
                  type="button"
                  onClick={() => applyPresetPrice(price)}
                  className={`text-[11px] px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer active:scale-95 ${
                    numericHarga === price
                      ? "bg-[#6B8F71] text-white shadow-2xs"
                      : "bg-[#EDF4FF] border border-gray-200 text-gray-700 hover:bg-[#D8E4F3]"
                  }`}
                >
                  {formatRupiah(price)}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-gray-500 pt-0.5">
              Bisa disesuaikan lagi saat membuat order
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700">
                Deskripsi Singkat
              </label>
              <span className="text-xs font-medium text-gray-400">Opsional</span>
            </div>

            <textarea
              rows={3}
              value={deskripsi}
              onChange={(e) => setDeskripsi(filterTextInput(e.target.value))}
              maxLength={500}
              placeholder="cth: Termasuk obras dan kancing standar, kain dari pelanggan"
              className="w-full p-3.5 rounded-xl border border-gray-200 bg-[#EDF4FF] text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#6B8F71] focus:ring-1 focus:ring-[#6B8F71]/20 transition-colors resize-none leading-relaxed"
            />
          </div>

          {mode === "edit" && (
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700">
                  Status Layanan
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setAktif(true)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                    aktif
                      ? "bg-[#6B8F71] text-white shadow-2xs"
                      : "bg-[#EDF4FF] border border-gray-200 text-gray-600 hover:bg-[#D8E4F3]"
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span>Aktif</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAktif(false)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                    !aktif
                      ? "bg-[#707973] text-white shadow-2xs"
                      : "bg-[#EDF4FF] border border-gray-200 text-gray-600 hover:bg-[#D8E4F3]"
                  }`}
                >
                  <PowerOff className="w-4 h-4" />
                  <span>Nonaktif</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2.5 mt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full min-h-[48px] rounded-xl bg-[#6B8F71] hover:bg-[#5a7b5f] text-white font-bold text-sm shadow-sm active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 select-none"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan Layanan...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>
                  {mode === "edit" ? "Simpan Perubahan" : "Simpan Layanan"}
                </span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleBack}
            disabled={isPending}
            className="w-full min-h-[48px] rounded-xl bg-[#D8E4F3] hover:bg-[#c6d7ec] text-gray-700 font-medium text-sm active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center disabled:opacity-50 select-none"
          >
            Batal & Kembali
          </button>
        </div>
      </form>
    </div>
  );
}
