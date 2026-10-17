"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Tag,
  Scissors,
  Pencil,
  PowerOff,
  Power,
  Plus,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { LayananItem } from "@/lib/data";
import { toggleStatusLayanan, seedContohLayanan } from "@/lib/actions/layanan";

interface LayananClientProps {
  initialLayanan: LayananItem[];
}

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export default function LayananClient({ initialLayanan }: LayananClientProps) {
  const router = useRouter();
  const [layananList, setLayananList] = useState<LayananItem[]>(initialLayanan);
  const [prevInitialLayanan, setPrevInitialLayanan] = useState(initialLayanan);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"Semua" | "Jahit" | "Permak">("Semua");
  const [statusFilter, setStatusFilter] = useState<"Semua" | "Aktif" | "Nonaktif">("Semua");

  if (initialLayanan !== prevInitialLayanan) {
    setPrevInitialLayanan(initialLayanan);
    setLayananList(initialLayanan);
  }

  const [confirmItem, setConfirmItem] = useState<LayananItem | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const counts = {
    semua: layananList.length,
    jahit: layananList.filter((l) => l.jenis === "Jahit").length,
    permak: layananList.filter((l) => l.jenis === "Permak").length,
    aktif: layananList.filter((l) => l.aktif).length,
    nonaktif: layananList.filter((l) => !l.aktif).length,
  };

  const filtered = layananList.filter((item) => {
    if (categoryFilter !== "Semua" && item.jenis !== categoryFilter) {
      return false;
    }
    if (statusFilter === "Aktif" && !item.aktif) return false;
    if (statusFilter === "Nonaktif" && item.aktif) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const matchNama = item.nama_layanan.toLowerCase().includes(q);
    const matchDesc = (item.deskripsi || "").toLowerCase().includes(q);
    const matchHarga = item.harga_dasar.toString().includes(q);
    return matchNama || matchDesc || matchHarga;
  });

  const handleToggleAktif = async (item: LayananItem) => {
    if (item.aktif) {
      setConfirmItem(item);
      return;
    }

    await executeToggle(item, true);
  };

  const executeToggle = async (item: LayananItem, targetAktif: boolean) => {
    setIsUpdating(true);
    setErrorMessage(null);

    setLayananList((prev) =>
      prev.map((l) => (l.id === item.id ? { ...l, aktif: targetAktif } : l))
    );

    const result = await toggleStatusLayanan(item.id, targetAktif);
    setIsUpdating(false);
    setConfirmItem(null);

    if (result.success) {
      showToast(
        targetAktif
          ? `Layanan "${item.nama_layanan}" diaktifkan kembali`
          : `Layanan "${item.nama_layanan}" dinonaktifkan`
      );
      startTransition(() => {
        router.refresh();
      });
    } else {
      setLayananList((prev) =>
        prev.map((l) => (l.id === item.id ? { ...l, aktif: item.aktif } : l))
      );
      setErrorMessage(result.error || "Gagal mengubah status layanan");
    }
  };

  const handleSeedContoh = () => {
    setIsUpdating(true);
    setErrorMessage(null);

    startTransition(async () => {
      const result = await seedContohLayanan();
      setIsUpdating(false);
      if (result.success) {
        showToast("Contoh katalog layanan berhasil dimuat!");
        router.refresh();
      } else {
        setErrorMessage(result.error || "Gagal memuat contoh layanan");
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm bg-[#2E5A36] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span className="flex-1">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-white/20 rounded-md text-white/80"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-700 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <section className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
            Katalog Layanan
          </h2>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#6B8F71] text-white shadow-2xs">
            {counts.aktif} Aktif
          </span>
        </div>
        <p className="text-xs text-gray-500">
          Katalog jenis pengerjaan & harga dasar untuk pengisian cepat pesanan
        </p>
      </section>

      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari layanan (misal: Seragam, Celana, Gamis)..."
          className="w-full bg-white border border-gray-200 rounded-xl pl-9.5 pr-8 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#6B8F71] focus:ring-1 focus:ring-[#6B8F71]/30 shadow-2xs transition-all"
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

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setCategoryFilter("Semua")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-all active:scale-95 ${
              categoryFilter === "Semua"
                ? "bg-[#6B8F71] text-white shadow-2xs"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Semua ({counts.semua})
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter("Jahit")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-all active:scale-95 ${
              categoryFilter === "Jahit"
                ? "bg-[#2E5A36] text-white shadow-2xs"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Jahit ({counts.jahit})</span>
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter("Permak")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-all active:scale-95 ${
              categoryFilter === "Permak"
                ? "bg-[#1F3A5F] text-white shadow-2xs"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Permak ({counts.permak})</span>
          </button>
        </div>

        {counts.nonaktif > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 pt-0.5">
            <span className="font-medium text-gray-400">Filter status:</span>
            <button
              type="button"
              onClick={() => setStatusFilter("Semua")}
              className={`px-2.5 py-0.5 rounded-md cursor-pointer transition-all font-semibold ${
                statusFilter === "Semua"
                  ? "bg-gray-700 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("Aktif")}
              className={`px-2.5 py-0.5 rounded-md cursor-pointer transition-all font-semibold ${
                statusFilter === "Aktif"
                  ? "bg-[#6B8F71] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Aktif Saja
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("Nonaktif")}
              className={`px-2.5 py-0.5 rounded-md cursor-pointer transition-all font-semibold ${
                statusFilter === "Nonaktif"
                  ? "bg-[#707973] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Nonaktif ({counts.nonaktif})
            </button>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        layananList.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center gap-3.5 py-14 px-4 bg-white rounded-2xl border border-gray-200/80 shadow-2xs mt-2">
            <div className="w-14 h-14 rounded-2xl bg-[#E8EFEA] flex items-center justify-center shadow-inner">
              <Tag className="w-7 h-7 text-[#6B8F71]" />
            </div>
            <div className="space-y-1 max-w-xs">
              <p className="font-bold text-gray-800 text-base">
                Katalog Layanan Masih Kosong
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Tambahkan daftar layanan Jahit dan Permak untuk memudahkan pengisian harga dasar saat mencatat pesanan.
              </p>
            </div>

            <div className="flex flex-col w-full max-w-xs gap-2 pt-2">
              <Link
                href="/layanan/baru"
                className="w-full min-h-[44px] rounded-xl bg-[#6B8F71] hover:bg-[#5a7b5f] text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Layanan Baru</span>
              </Link>

              <button
                type="button"
                onClick={handleSeedContoh}
                disabled={isUpdating || isPending}
                className="w-full min-h-[44px] rounded-xl bg-[#F0F4EE] hover:bg-[#e4ede1] text-[#2E5A36] font-semibold text-xs border border-[#6B8F71]/30 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isUpdating || isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memuat Contoh Layanan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Muat Contoh Layanan Standar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center gap-3 py-14 px-4 bg-white rounded-2xl border border-gray-100 shadow-2xs mt-2">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-gray-800 text-sm">
                Layanan tidak ditemukan
              </p>
              <p className="text-xs text-gray-400">
                Tidak ada layanan yang cocok dengan kata kunci & filter yang dipilih.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("Semua");
                setStatusFilter("Semua");
              }}
              className="text-xs text-[#6B8F71] font-semibold hover:underline mt-1 cursor-pointer"
            >
              Reset Pencarian & Filter
            </button>
          </div>
        )
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((item) => {
            const isJahit = item.jenis === "Jahit";
            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl p-4 border transition-all shadow-2xs flex flex-col gap-3 relative ${
                  item.aktif
                    ? "border-gray-200/80 hover:border-[#6B8F71]/50"
                    : "border-gray-200 bg-gray-50/60 opacity-80"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isJahit
                          ? "bg-[#E8EFEA] text-[#2E5A36]"
                          : "bg-[#E8EEF5] text-[#1F3A5F]"
                      }`}
                    >
                      {isJahit ? (
                        <Scissors className="w-3 h-3" />
                      ) : (
                        <Tag className="w-3 h-3" />
                      )}
                      <span>{item.jenis}</span>
                    </span>

                    {item.aktif ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#6B8F71] text-white shadow-2xs">
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#707973] text-white shadow-2xs">
                        Nonaktif
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-gray-400 block leading-tight">
                      Harga Dasar
                    </span>
                    <span className="text-sm font-bold text-[#2E5A36]">
                      {formatRupiah(item.harga_dasar)}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-snug">
                    {item.nama_layanan}
                  </h3>
                  {item.deskripsi ? (
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {item.deskripsi}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 italic mt-0.5">
                      Tanpa catatan deskripsi
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 mt-0.5">
                  <div className="flex items-center gap-1.5">
                    {item.aktif ? (
                      <button
                        type="button"
                        onClick={() => handleToggleAktif(item)}
                        disabled={isUpdating}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#707973] hover:bg-[#5b635e] cursor-pointer transition-all active:scale-95 disabled:opacity-50 shadow-2xs"
                      >
                        <PowerOff className="w-3.5 h-3.5" />
                        <span>Nonaktifkan</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleAktif(item)}
                        disabled={isUpdating}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#6B8F71] hover:bg-[#5a7b5f] cursor-pointer transition-all active:scale-95 disabled:opacity-50 shadow-2xs"
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>Aktifkan Kembali</span>
                      </button>
                    )}
                  </div>

                  <Link
                    href={`/layanan/${item.id}/edit`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-xs transition-all active:scale-95 border border-gray-200/70"
                  >
                    <Pencil className="w-3.5 h-3.5 text-gray-500" />
                    <span>Edit</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirmItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setConfirmItem(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 flex flex-col gap-4 z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <PowerOff className="w-5 h-5 text-[#707973]" />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">
                  Nonaktifkan Layanan?
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {confirmItem.nama_layanan}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Layanan ini akan disembunyikan dari pilihan saat membuat order baru.
              <span className="block mt-1 font-medium text-gray-700">
                Data pada order lama yang sudah tercatat tidak akan rusak atau berubah. Anda dapat mengaktifkannya kembali sewaktu-waktu.
              </span>
            </p>

            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                onClick={() => setConfirmItem(null)}
                disabled={isUpdating}
                className="flex-1 min-h-[44px] rounded-xl border border-gray-200 text-gray-600 font-medium text-xs hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => executeToggle(confirmItem, false)}
                disabled={isUpdating}
                className="flex-1 min-h-[44px] rounded-xl bg-[#707973] hover:bg-[#5b635e] text-white font-bold text-xs active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <PowerOff className="w-4 h-4" />
                    <span>Ya, Nonaktifkan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
