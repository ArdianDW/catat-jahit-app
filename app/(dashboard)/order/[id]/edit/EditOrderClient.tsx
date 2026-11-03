"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Scissors,
  Pencil,
  Ruler,
  Calendar,
  Wallet,
  FileText,
  Hourglass,
  Check,
  AlertCircle,
  X,
  Loader2,
  Plus,
} from "lucide-react";
import type { OrderDetail, LayananOption } from "@/lib/data";
import { updateOrder, type CreateOrderItemInput } from "@/lib/actions/order";
import { formatRupiah, formatDateIndo, getSisaHari, parseMeasurement } from "@/lib/utils/format";
import Avatar from "@/components/ui/Avatar";
import ItemOrderCard, { type ItemForm, createNewItem } from "@/components/order/ItemOrderCard";

interface EditOrderClientProps {
  order: OrderDetail;
  layananList: LayananOption[];
}

export default function EditOrderClient({ order, layananList }: EditOrderClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [jenisOrder, setJenisOrder] = useState<"Jahit Baru" | "Permak">(order.jenis_order);
  const [deadline, setDeadline] = useState(order.tanggal_deadline.slice(0, 10));
  const [catatan, setCatatan] = useState(order.catatan_model ?? "");
  const [error, setError] = useState<string | null>(null);

  const [items, setItems] = useState<ItemForm[]>(() => {
    if (!order.item_order || order.item_order.length === 0) {
      return [createNewItem()];
    }
    return order.item_order.map((i) => ({
      id: i.id || crypto.randomUUID(),
      nama_item: i.nama_item,
      layanan_id: i.layanan_id,
      layanan_nama: i.layanan?.nama_layanan || null,
      jumlah: i.jumlah,
      harga_item: i.harga_item,
      ukuran_sumber: (i.ukuran_sumber || "pelanggan") as ItemForm["ukuran_sumber"],
      ukuran_untuk: i.ukuran_untuk || "",
      lingkar_dada: i.lingkar_dada != null ? String(i.lingkar_dada) : "",
      lingkar_pinggang: i.lingkar_pinggang != null ? String(i.lingkar_pinggang) : "",
      lingkar_pinggul: i.lingkar_pinggul != null ? String(i.lingkar_pinggul) : "",
      panjang_bahu: i.panjang_bahu != null ? String(i.panjang_bahu) : "",
      panjang_lengan: i.panjang_lengan != null ? String(i.panjang_lengan) : "",
      panjang_baju: i.panjang_baju != null ? String(i.panjang_baju) : "",
      panjang_celana: i.panjang_celana != null ? String(i.panjang_celana) : "",
      catatan_ukuran: i.catatan_ukuran || "",
    }));
  });

  const [totalHargaStr, setTotalHargaStr] = useState(String(order.total_harga));

  const customerName = order.pelanggan?.nama_pelanggan || "Pelanggan";
  const sisaHari = getSisaHari(deadline);

  const pelangganHasUkuran = Boolean(
    order.pelanggan?.lingkar_dada ||
    order.pelanggan?.lingkar_pinggang ||
    order.pelanggan?.lingkar_pinggul ||
    order.pelanggan?.panjang_bahu ||
    order.pelanggan?.panjang_lengan ||
    order.pelanggan?.panjang_baju ||
    order.pelanggan?.panjang_celana
  );

  const relevantLayanan = layananList.filter((l) =>
    jenisOrder === "Jahit Baru" ? l.jenis === "Jahit" : l.jenis === "Permak"
  );

  const calcTotal = items.reduce((sum, i) => sum + i.harga_item * i.jumlah, 0);
  const parsedTotal = parseInt(totalHargaStr);
  const finalTotal = isNaN(parsedTotal) ? calcTotal : parsedTotal;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!deadline) {
      setError("Target selesai (deadline) wajib diisi");
      return;
    }
    if (items.length === 0) {
      setError("Minimal 1 barang harus dimasukkan");
      return;
    }
    for (let idx = 0; idx < items.length; idx++) {
      const it = items[idx];
      if (!it.nama_item.trim()) {
        setError(`Nama barang #${idx + 1} wajib diisi`);
        return;
      }
      if (it.ukuran_sumber === "lain" && !it.ukuran_untuk.trim()) {
        setError(`Nama orang untuk ukuran pada barang #${idx + 1} ("${it.nama_item}") wajib diisi`);
        return;
      }
    }
    if (isNaN(parsedTotal) || parsedTotal < 0) {
      setError("Total biaya jahit tidak valid");
      return;
    }

    startTransition(async () => {
      const mappedItems: CreateOrderItemInput[] = items.map((i) => ({
        layanan_id: i.layanan_id || null,
        nama_item: i.nama_item.trim(),
        jumlah: i.jumlah,
        harga_item: i.harga_item,
        ukuran_sumber: i.ukuran_sumber,
        ukuran_untuk: i.ukuran_sumber === "lain" ? i.ukuran_untuk.trim() || null : null,
        lingkar_dada: i.ukuran_sumber === "lain" ? parseMeasurement(i.lingkar_dada) : null,
        lingkar_pinggang: i.ukuran_sumber === "lain" ? parseMeasurement(i.lingkar_pinggang) : null,
        lingkar_pinggul: i.ukuran_sumber === "lain" ? parseMeasurement(i.lingkar_pinggul) : null,
        panjang_bahu: i.ukuran_sumber === "lain" ? parseMeasurement(i.panjang_bahu) : null,
        panjang_lengan: i.ukuran_sumber === "lain" ? parseMeasurement(i.panjang_lengan) : null,
        panjang_baju: i.ukuran_sumber === "lain" ? parseMeasurement(i.panjang_baju) : null,
        panjang_celana: i.ukuran_sumber === "lain" ? parseMeasurement(i.panjang_celana) : null,
        catatan_ukuran: i.ukuran_sumber === "lain" ? i.catatan_ukuran.trim() || null : null,
      }));

      const res = await updateOrder(order.id, {
        jenis_order: jenisOrder,
        tanggal_deadline: deadline,
        total_harga: finalTotal,
        catatan_model: catatan.trim() || null,
        items: mappedItems,
      });

      if (!res.success) {
        setError(res.error ?? "Gagal menyimpan perubahan order");
        return;
      }

      router.push(`/order/${order.id}`);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-20">
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-gray-400">Nomor Order</span>
          <p className="text-base font-extrabold text-gray-900 leading-tight">{order.nomor_order}</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-gray-400">Tanggal Masuk</span>
          <p className="text-xs font-bold text-gray-700 mt-0.5">{formatDateIndo(order.tanggal_masuk)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 shadow-xs flex items-center gap-3">
        <Avatar name={customerName} seedId={order.id} size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-gray-400 font-medium">Pelanggan</p>
          <p className="text-sm font-bold text-gray-900 leading-tight truncate">{customerName}</p>
          <p className="text-xs text-gray-500 mt-0.5">{order.pelanggan?.no_hp || "-"}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError(null)} className="shrink-0 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex flex-col gap-3">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Jenis Order</label>
        <div className="flex flex-col gap-2.5">
          {([
            {
              value: "Jahit Baru" as const,
              icon: (
                <span className="flex items-center gap-1 text-[#6B8F71]">
                  <Pencil className="w-4 h-4" />
                  <Ruler className="w-4 h-4" />
                </span>
              ),
              desc: "Membuat pakaian baru sesuai desain dan ukuran pelanggan.",
              contoh: "Gamis, Seragam, Kebaya, Rok",
            },
            {
              value: "Permak" as const,
              icon: (
                <span className="text-[#6B8F71]">
                  <Scissors className="w-4 h-4" />
                </span>
              ),
              desc: "Mengubah atau memperbaiki pakaian yang sudah ada.",
              contoh: "Potong celana panjang, kecilkan baju, pasang kancing",
            },
          ]).map((opt) => {
            const isSelected = jenisOrder === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setJenisOrder(opt.value)}
                className={`w-full text-left flex items-center gap-3.5 p-3.5 rounded-xl border-2 relative overflow-hidden transition-all cursor-pointer ${
                  isSelected ? "border-[#6B8F71] bg-white shadow-xs" : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                {isSelected && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 rounded-r-full bg-[#6B8F71]"
                    style={{ height: "80%" }}
                  />
                )}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  isSelected ? "bg-[#6B8F71] border-[#6B8F71]" : "border-gray-300 bg-white"
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {opt.icon}
                    <span className="text-sm font-bold text-gray-800">{opt.value}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-snug">{opt.desc}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">cth: {opt.contoh}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            Daftar Barang Pesanan ({items.length})
          </span>
          <span className="text-xs text-gray-400">Bisa diedit / ditambah</span>
        </div>

        {items.map((item, idx) => (
          <ItemOrderCard
            key={item.id}
            item={item}
            index={idx}
            layananList={relevantLayanan}
            pelangganHasUkuran={pelangganHasUkuran}
            showRemove={items.length > 1}
            onChange={(updated) => setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))}
            onRemove={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
          />
        ))}

        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, createNewItem()])}
          className="w-full min-h-[44px] rounded-xl bg-[#EDF4FF] text-[#6B8F71] text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 hover:bg-[#D0E4FF] active:scale-[0.99]"
        >
          <Plus className="w-4 h-4 text-[#6B8F71]" />
          <span>Tambah Barang Lain</span>
        </button>

        <div className="px-4 py-3 rounded-xl bg-white border border-gray-200/90 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-xs font-bold text-[#6B8F71]">Total hitungan barang</p>
            <p className="text-[11px] text-gray-400">({items.length} jenis barang)</p>
          </div>
          <span className="text-base font-extrabold text-[#6B8F71]">{formatRupiah(calcTotal)}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#B37402]" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Target Selesai (Deadline)
            </span>
          </div>
          <span className="text-xs font-bold text-red-500">Wajib</span>
        </div>

        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#EDF4FF] text-sm text-gray-800 focus:outline-none focus:border-[#6B8F71] focus:ring-1 focus:ring-[#6B8F71]/20 transition-colors cursor-pointer"
        />

        {deadline && (
          <div className="pt-2.5 border-t border-gray-100 flex flex-col gap-2">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Tanggal yang Dipilih:</p>
              <p className="text-lg font-extrabold text-gray-900 leading-tight">{formatDateIndo(deadline)}</p>
            </div>
            {sisaHari !== null && (
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#00210C] bg-[#C5ECC9] px-3.5 py-2.5 rounded-xl">
                <Hourglass className="w-4 h-4 text-[#00210C] shrink-0" />
                <span>
                  Sisa waktu pengerjaan:{" "}
                  {sisaHari === 0 ? "Hari ini" : sisaHari < 0 ? `Lewat ${Math.abs(sisaHari)} hari` : `${sisaHari} hari`}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[#6B8F71]" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Biaya Jahit</span>
          </div>
          {parsedTotal !== calcTotal && (
            <button
              type="button"
              onClick={() => setTotalHargaStr(String(calcTotal))}
              className="text-xs font-semibold text-[#6B8F71] hover:underline cursor-pointer"
            >
              Samakan ke {formatRupiah(calcTotal)}
            </button>
          )}
        </div>

        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 pointer-events-none">
            Rp
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={totalHargaStr}
            onChange={(e) => setTotalHargaStr(e.target.value)}
            className="w-full min-h-[52px] pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-[#EDF4FF] text-lg font-bold text-gray-800 focus:outline-none focus:border-[#6B8F71] focus:ring-1 focus:ring-[#6B8F71]/20 transition-colors"
          />
        </div>
        <p className="text-[11px] text-gray-400">
          Dihitung dari total harga barang ({formatRupiah(calcTotal)}). Dapat disesuaikan bila ada diskon atau biaya tambahan.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Catatan Model / Desain</span>
        </div>
        <textarea
          rows={3}
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="cth: Model A-line, kerah V, ada kantong samping, warna biru dongker"
          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#EDF4FF] text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#6B8F71] focus:ring-1 focus:ring-[#6B8F71]/20 transition-colors resize-none"
        />
      </div>

      <div className="flex gap-2.5 pt-1">
        <button
          type="button"
          disabled={isPending}
          onClick={() => router.back()}
          className="flex-1 min-h-[48px] rounded-xl bg-[#D8E4F3] hover:bg-[#c6d7ec] text-gray-700 font-semibold text-sm active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
        >
          Batal
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="flex-1 min-h-[48px] rounded-xl bg-[#6B8F71] hover:bg-[#5a7b5f] text-white font-bold text-sm shadow-md active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /><span>Menyimpan...</span></>
          ) : (
            <><Check className="w-4 h-4" /><span>Simpan Perubahan</span></>
          )}
        </button>
      </div>
    </form>
  );
}
