"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Check,
  ChevronRight,
  Plus,
  Trash2,
  Ruler,
  ShoppingBag,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronDown,
  UserPlus,
  Scissors,
  Pencil,
  Calendar,
  Wallet,
  FileText,
  Hourglass,
} from "lucide-react";
import type { PelangganOption, LayananOption } from "@/lib/data";
import { createOrder, type CreateOrderItemInput } from "@/lib/actions/order";

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

function getInitials(name: string): string {
  if (!name || !name.trim()) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

type UkuranSumber = "pelanggan" | "lain" | "tanpa";

interface ItemForm {
  id: string;
  nama_item: string;
  layanan_id: string | null;
  layanan_nama: string | null;
  jumlah: number;
  harga_item: number;
  ukuran_sumber: UkuranSumber;
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

interface OrderForm {
  pelanggan: PelangganOption | null;
  jenis_order: "Jahit Baru" | "Permak";
  items: ItemForm[];
  tanggal_deadline: string;
  total_harga_str: string;
  catatan_model: string;
}

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function formatDateIndo(dateStr: string): string {
  if (!dateStr) return "-";
  const [y, m, d] = dateStr.slice(0, 10).split("-").map(Number);
  const MONTHS = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

function getSisaHari(deadlineStr: string): number | null {
  if (!deadlineStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = deadlineStr.slice(0, 10).split("-").map(Number);
  const target = new Date(y, m - 1, d);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function parseMeasurement(v: string): number | null {
  const n = parseFloat(v.replace(",", "."));
  return isNaN(n) || n <= 0 ? null : n;
}

function newItem(): ItemForm {
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

function LayananDropdown({
  layananList,
  value,
  onChange,
}: {
  layananList: LayananOption[];
  value: { id: string | null; nama: string | null };
  onChange: (id: string | null, nama: string | null, harga: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#EDF4FF] text-sm text-left flex items-center justify-between gap-2 hover:border-gray-300 transition-colors cursor-pointer"
      >
        <span className={value.nama ? "text-gray-800 font-medium" : "text-gray-400"}>
          {value.nama ?? "Pilih layanan (opsional)"}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
      </button>
      {open && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
          <button
            type="button"
            onClick={() => { onChange(null, null, 0); setOpen(false); }}
            className="w-full px-3.5 py-2.5 text-sm text-left text-gray-400 hover:bg-gray-50 italic border-b border-gray-100"
          >
            Tanpa layanan
          </button>
          {layananList.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => { onChange(l.id, l.nama_layanan, l.harga_dasar); setOpen(false); }}
              className="w-full px-3.5 py-2.5 text-sm text-left hover:bg-gray-50 flex items-center justify-between gap-2 border-b border-gray-50 last:border-0"
            >
              <span className="font-medium text-gray-800">{l.nama_layanan}</span>
              <span className="text-xs text-gray-400 shrink-0">{formatRupiah(l.harga_dasar)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ItemCard({
  item,
  index,
  layananList,
  pelangganHasUkuran,
  showRemove,
  onChange,
  onRemove,
}: {
  item: ItemForm;
  index: number;
  layananList: LayananOption[];
  pelangganHasUkuran: boolean;
  showRemove: boolean;
  onChange: (updated: ItemForm) => void;
  onRemove: () => void;
}) {
  const upd = (patch: Partial<ItemForm>) => onChange({ ...item, ...patch });

  const measureFields: { key: keyof ItemForm; label: string }[] = [
    { key: "lingkar_dada", label: "Lingkar Dada" },
    { key: "lingkar_pinggang", label: "Lingkar Pinggang" },
    { key: "lingkar_pinggul", label: "Lingkar Pinggul" },
    { key: "panjang_bahu", label: "Panjang Bahu" },
    { key: "panjang_lengan", label: "Panjang Lengan" },
    { key: "panjang_baju", label: "Panjang Baju" },
    { key: "panjang_celana", label: "Panjang Celana" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-3.5">
      {/* Header */}
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
            onClick={onRemove}
            className="cursor-pointer p-1"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-500">Nama Barang *</label>
        <input
          type="text"
          value={item.nama_item}
          onChange={(e) => upd({ nama_item: e.target.value })}
          placeholder="cth: Baju Kebaya, Celana Panjang"
          className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#EDF4FF] text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#6B8F71] focus:ring-1 focus:ring-[#6B8F71]/20 transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-500">Layanan</label>
        <LayananDropdown
          layananList={layananList}
          value={{ id: item.layanan_id, nama: item.layanan_nama }}
          onChange={(id, nama, harga) =>
            upd({ layanan_id: id, layanan_nama: nama, harga_item: harga > 0 ? harga : item.harga_item })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-500">Jumlah *</label>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={item.jumlah}
            onChange={(e) => upd({ jumlah: Math.max(1, parseInt(e.target.value) || 1) })}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#EDF4FF] text-sm text-gray-800 focus:outline-none focus:border-[#6B8F71] focus:ring-1 focus:ring-[#6B8F71]/20 transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-500">Harga (Rp) *</label>
          <input
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

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-500">Sumber Ukuran</label>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: "pelanggan" as UkuranSumber, label: "Data Pelanggan" },
            { value: "lain" as UkuranSumber, label: "Ukuran Lain" },
            { value: "tanpa" as UkuranSumber, label: "Tanpa Ukuran" },
          ]).map((opt) => (
            <button
              key={opt.value}
              type="button"
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
          <p className="text-[11px] text-amber-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            Pelanggan belum punya data ukuran tersimpan
          </p>
        )}
      </div>

      {item.ukuran_sumber === "lain" && (
        <div className="flex flex-col gap-3 pt-1 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <Ruler className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Detail Ukuran (cm)</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">Ukuran untuk (nama)</label>
            <input
              type="text"
              value={item.ukuran_untuk}
              onChange={(e) => upd({ ukuran_untuk: e.target.value })}
              placeholder="cth: Ibu, Anak Sulung"
              className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-gray-200 bg-[#EDF4FF] text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#6B8F71] focus:ring-1 focus:ring-[#6B8F71]/20 transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {measureFields.map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-gray-400">{label}</label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={item[key] as string}
                    onChange={(e) => upd({ [key]: e.target.value })}
                    placeholder="–"
                    className="w-full min-h-[40px] pl-3 pr-8 py-2 rounded-xl border border-gray-200 bg-[#EDF4FF] text-sm placeholder:text-gray-300 focus:outline-none focus:border-[#6B8F71] focus:ring-1 focus:ring-[#6B8F71]/20 transition-colors"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-medium pointer-events-none">cm</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">Catatan Ukuran</label>
            <textarea
              rows={2}
              value={item.catatan_ukuran}
              onChange={(e) => upd({ catatan_ukuran: e.target.value })}
              placeholder="cth: Lengan agak panjang"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[#EDF4FF] text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#6B8F71] focus:ring-1 focus:ring-[#6B8F71]/20 transition-colors resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function TambahOrderClient({
  pelangganList,
  layananList,
}: {
  pelangganList: PelangganOption[];
  layananList: LayananOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const TOTAL_STEPS = 5;
  const STEP_TITLES = [
    "Pilih Pelanggan",
    "Pilih Jenis Order",
    "Daftar barang Pesanan",
    "Tanggal & Pembayaran",
    "Ringkasan Pesanan",
  ];

  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState<OrderForm>({
    pelanggan: null,
    jenis_order: "Jahit Baru",
    items: [newItem()],
    tanggal_deadline: "",
    total_harga_str: "",
    catatan_model: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const calcTotal = form.items.reduce((sum, i) => sum + i.harga_item * i.jumlah, 0);
  const sisaHari = getSisaHari(form.tanggal_deadline);

  const getFinalTotal = () => {
    const parsed = parseInt(form.total_harga_str);
    return isNaN(parsed) ? calcTotal : parsed;
  };

  const displayedPelanggan = search.trim()
    ? pelangganList.filter(
        (p) =>
          p.nama_pelanggan.toLowerCase().includes(search.toLowerCase()) ||
          p.no_hp.includes(search)
      )
    : pelangganList.slice(0, 5);

  const relevantLayanan = layananList.filter((l) =>
    form.jenis_order === "Jahit Baru" ? l.jenis === "Jahit" : l.jenis === "Permak"
  );

  const canNext: Record<number, boolean> = {
    1: !!form.pelanggan,
    2: true,
    3:
      form.items.length > 0 &&
      form.items.every((i) => i.nama_item.trim() && i.harga_item > 0),
    4: !!form.tanggal_deadline && form.tanggal_deadline >= getTodayStr(),
    5: true,
  };

  const handleNext = () => {
    setError(null);
    if (step === 3) {
      setForm((f) => ({
        ...f,
        total_harga_str: f.total_harga_str || String(calcTotal),
      }));
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep((s) => s - 1);
  };

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const items: CreateOrderItemInput[] = form.items.map((i) => ({
        layanan_id: i.layanan_id || null,
        nama_item: i.nama_item.trim(),
        jumlah: i.jumlah,
        harga_item: i.harga_item,
        ukuran_sumber: i.ukuran_sumber,
        ukuran_untuk: i.ukuran_sumber === "lain" ? i.ukuran_untuk || null : null,
        lingkar_dada: i.ukuran_sumber === "lain" ? parseMeasurement(i.lingkar_dada) : null,
        lingkar_pinggang: i.ukuran_sumber === "lain" ? parseMeasurement(i.lingkar_pinggang) : null,
        lingkar_pinggul: i.ukuran_sumber === "lain" ? parseMeasurement(i.lingkar_pinggul) : null,
        panjang_bahu: i.ukuran_sumber === "lain" ? parseMeasurement(i.panjang_bahu) : null,
        panjang_lengan: i.ukuran_sumber === "lain" ? parseMeasurement(i.panjang_lengan) : null,
        panjang_baju: i.ukuran_sumber === "lain" ? parseMeasurement(i.panjang_baju) : null,
        panjang_celana: i.ukuran_sumber === "lain" ? parseMeasurement(i.panjang_celana) : null,
        catatan_ukuran: i.ukuran_sumber === "lain" ? i.catatan_ukuran || null : null,
      }));

      const res = await createOrder({
        pelanggan_id: form.pelanggan!.id,
        jenis_order: form.jenis_order,
        tanggal_deadline: form.tanggal_deadline,
        total_harga: getFinalTotal(),
        status_pembayaran: "Belum Lunas",
        catatan_model: form.catatan_model.trim() || null,
        items,
      });

      if (!res.success) {
        setError(res.error ?? "Gagal menyimpan order");
        return;
      }

      setSuccess(res.nomorOrder ?? "Order berhasil disimpan");
    });
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-[#EFF3EE] flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-[#6B8F71]" />
        </div>
        <div>
          <p className="text-xl font-bold text-gray-800">Order Berhasil Dibuat!</p>
          <p className="text-sm text-gray-500 mt-1">{success}</p>
        </div>
        <div className="flex flex-col gap-2.5 w-full">
          <button
            type="button"
            onClick={() => router.push("/order")}
            className="w-full min-h-[48px] rounded-xl bg-[#6B8F71] hover:bg-[#5a7b5f] text-white font-semibold text-sm transition-all cursor-pointer"
          >
            Lihat Daftar Order
          </button>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="w-full min-h-[48px] rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition-all cursor-pointer"
          >
            Buat Order Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-4">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-gray-400">
          Langkah {step} dari {TOTAL_STEPS}
        </p>
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1.5 rounded-full transition-all duration-300"
              style={{ backgroundColor: i < step ? "#6B8F71" : "#DEE9F8" }}
            />
          ))}
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          {STEP_TITLES[step - 1]}
        </h2>
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

      {step === 1 && (
        <div className="flex flex-col gap-3">
          {/* Search bar */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau nomor HP..."
              className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#6B8F71] focus:ring-1 focus:ring-[#6B8F71]/20 transition-colors"
            />
          </div>

          <Link
            href="/pelanggan/baru"
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#EDF4FF] text-[#6B8F71] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#D0E4FF] transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4 shrink-0 text-[#6B8F71]" />
            <span>Tambah Pelanggan Baru</span>
          </Link>

          {!search.trim() && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">
              Riwayat Pelanggan
            </p>
          )}

          <div className="flex flex-col gap-2">
            {displayedPelanggan.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">
                Pelanggan tidak ditemukan
              </div>
            ) : (
              displayedPelanggan.map((p) => {
                const isSelected = form.pelanggan?.id === p.id;
                const avatar = getAvatarColors(p.nama_pelanggan + p.id);
                const initials = getInitials(p.nama_pelanggan);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, pelanggan: p }))}
                    className={`w-full flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all cursor-pointer text-left bg-white ${
                      isSelected
                        ? "border-[#6B8F71]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                        style={{ backgroundColor: avatar.bg, color: avatar.text }}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {p.nama_pelanggan}
                        </p>
                        <p className="text-xs text-gray-400">{p.no_hp}</p>
                        {p.has_ukuran && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-[#6B8F71] font-medium mt-0.5">
                            <Ruler className="w-2.5 h-2.5" /> Ada data ukuran
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? "bg-[#6B8F71] border-[#6B8F71]"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {form.pelanggan && (
            <div className="p-3.5 rounded-xl bg-white border border-[#6B8F71] flex items-center justify-between gap-3 mt-1 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                  style={{
                    backgroundColor: getAvatarColors(form.pelanggan.nama_pelanggan + form.pelanggan.id).bg,
                    color: getAvatarColors(form.pelanggan.nama_pelanggan + form.pelanggan.id).text,
                  }}
                >
                  {getInitials(form.pelanggan.nama_pelanggan)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-[#6B8F71] uppercase tracking-wide">
                    Pelanggan Terpilih
                  </p>
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {form.pelanggan.nama_pelanggan}
                  </p>
                  <p className="text-xs text-gray-400">{form.pelanggan.no_hp}</p>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-[#6B8F71] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          {form.pelanggan && (
            <div className="bg-white rounded-2xl border border-gray-200 p-3.5 flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                style={{
                  backgroundColor: getAvatarColors(form.pelanggan.nama_pelanggan + form.pelanggan.id).bg,
                  color: getAvatarColors(form.pelanggan.nama_pelanggan + form.pelanggan.id).text,
                }}
              >
                {getInitials(form.pelanggan.nama_pelanggan)}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 font-medium">Pelanggan Terpilih</p>
                <p className="text-sm font-bold text-gray-800 leading-tight truncate">
                  {form.pelanggan.nama_pelanggan}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{form.pelanggan.no_hp}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
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
                    <Scissors className="w-5 h-5" />
                  </span>
                ),
                desc: "Mengubah atau memperbaiki pakaian yang sudah ada.",
                contoh: "Potong celana panjang, kecilkan baju, tambah kancing",
              },
            ]).map((opt) => {
              const isSelected = form.jenis_order === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, jenis_order: opt.value }))}
                  className={`w-full text-left flex items-center gap-4 p-4 rounded-2xl border-2 relative overflow-hidden transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#6B8F71] bg-white"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  {isSelected && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 rounded-r-full bg-[#6B8F71]"
                      style={{ height: "80%" }}
                    />
                  )}

                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? "bg-[#6B8F71] border-[#6B8F71]"
                        : "border-[#D8E4F3] bg-white"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {opt.icon}
                      <span
                        className={`text-base font-bold ${
                          isSelected ? "text-gray-800" : "text-gray-700"
                        }`}
                      >
                        {opt.value}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-snug">{opt.desc}</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      cth: {opt.contoh}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-3">
          {form.items.map((item, idx) => (
            <ItemCard
              key={item.id}
              item={item}
              index={idx}
              layananList={relevantLayanan}
              pelangganHasUkuran={form.pelanggan?.has_ukuran ?? false}
              showRemove={form.items.length > 1}
              onChange={(updated) =>
                setForm((f) => ({
                  ...f,
                  items: f.items.map((i) => (i.id === updated.id ? updated : i)),
                }))
              }
              onRemove={() =>
                setForm((f) => ({
                  ...f,
                  items: f.items.filter((i) => i.id !== item.id),
                }))
              }
            />
          ))}

          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, items: [...f.items, newItem()] }))}
            className="w-full min-h-[44px] rounded-xl bg-[#EDF4FF] text-[#6B8F71] text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 hover:bg-[#D0E4FF]"
          >
            <Plus className="w-4 h-4 text-[#6B8F71]" />
            Tambah Barang Lain
          </button>

          <div className="px-4 py-3.5 rounded-xl bg-[#FFFFFF] border border-gray-200 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-sm font-bold text-[#6B8F71]">Total sementara</p>
              <p className="text-xs text-[#6B8F71]/70">({form.items.length} barang)</p>
            </div>
            <span className="text-base font-extrabold text-[#6B8F71]">
              {formatRupiah(calcTotal)}
            </span>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-3.5">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                Tanggal Masuk
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#EDF4FF] border border-[#DEE9F8] flex items-center justify-between">
              <div>
                <p className="text-base font-bold text-gray-800">
                  {formatDateIndo(getTodayStr())}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Sudah terisi otomatis
                </p>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/80 border border-[#D8E4F3] text-gray-600 font-medium shrink-0">
                Otomatis
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#B37402]" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                  Target Selesai (Deadline)
                </span>
              </div>
              <span className="text-xs font-bold text-red-500">
                Wajib
              </span>
            </div>

            <input
              type="date"
              min={getTodayStr()}
              value={form.tanggal_deadline}
              onChange={(e) =>
                setForm((f) => ({ ...f, tanggal_deadline: e.target.value }))
              }
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#EDF4FF] text-sm text-gray-800 focus:outline-none focus:border-[#6B8F71] focus:ring-1 focus:ring-[#6B8F71]/20 transition-colors cursor-pointer"
            />

            {form.tanggal_deadline && (
              <div className="pt-2.5 border-t border-gray-100 flex flex-col gap-2">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Tanggal yang Dipilih:</p>
                  <p className="text-xl font-extrabold text-gray-900 leading-tight">
                    {formatDateIndo(form.tanggal_deadline)}
                  </p>
                </div>
                {sisaHari !== null && (
                  <div className="flex items-center gap-2 text-base font-bold text-[#00210C] mt-0.5">
                    <Hourglass className="w-4 h-4 text-[#00210C] shrink-0" />
                    <span>
                      Sisa waktu pengerjaan:{" "}
                      {sisaHari === 0
                        ? "Hari ini"
                        : sisaHari < 0
                        ? "Sudah lewat"
                        : `${sisaHari} hari`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#6B8F71]" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                  Total Biaya Jahit
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6B8F71]">
                <Pencil className="w-3.5 h-3.5" />
                <span>Sesuaikan</span>
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 pointer-events-none">
                Rp
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={form.total_harga_str}
                onChange={(e) =>
                  setForm((f) => ({ ...f, total_harga_str: e.target.value }))
                }
                placeholder={String(calcTotal)}
                className="w-full min-h-[52px] pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-[#EDF4FF] text-lg font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-[#6B8F71] focus:ring-1 focus:ring-[#6B8F71]/20 transition-colors"
              />
            </div>
            <p className="text-[11px] text-gray-400">
              Dihitung dari total barang ({formatRupiah(calcTotal)}). Dapat diedit atau disesuaikan jika ada biaya tambahan atau diskon.
            </p>
            {form.total_harga_str && parseInt(form.total_harga_str) !== calcTotal && (
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, total_harga_str: String(calcTotal) }))
                }
                className="text-[11px] text-[#6B8F71] font-semibold text-left hover:underline cursor-pointer"
              >
                ↩ Kembalikan ke {formatRupiah(calcTotal)}
              </button>
            )}
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="flex flex-col gap-3.5">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
              Ringkasan Pesanan
            </p>

            {form.pelanggan && (
              <div className="p-3.5 rounded-xl bg-[#EDF4FF] border border-[#DEE9F8] flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                  style={{
                    backgroundColor: getAvatarColors(
                      form.pelanggan.nama_pelanggan + form.pelanggan.id
                    ).bg,
                    color: getAvatarColors(
                      form.pelanggan.nama_pelanggan + form.pelanggan.id
                    ).text,
                  }}
                >
                  {getInitials(form.pelanggan.nama_pelanggan)}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-[#6B8F71] uppercase tracking-wide">
                    Pelanggan
                  </p>
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {form.pelanggan.nama_pelanggan}
                  </p>
                  <p className="text-xs text-gray-500">{form.pelanggan.no_hp}</p>
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-[#EDF4FF] border border-[#DEE9F8] flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#D8E4F3]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-600">Jenis:</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white text-[#6B8F71] border border-[#D8E4F3]">
                    {form.jenis_order}
                  </span>
                </div>
                <span className="text-xs font-medium text-gray-500">
                  {form.items.length} Barang
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {form.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-white/80 border border-[#D8E4F3]/60 text-sm"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                        <p className="font-semibold text-gray-800 truncate">
                          {item.nama_item}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                        <span>{item.jumlah}× {formatRupiah(item.harga_item)}</span>
                        {item.layanan_nama && (
                          <span className="px-1.5 py-0.5 rounded bg-[#EFF3EE] text-[#6B8F71] font-medium text-[11px]">
                            {item.layanan_nama}
                          </span>
                        )}
                      </div>
                      {item.ukuran_sumber === "lain" && item.ukuran_untuk && (
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Ukuran: {item.ukuran_untuk}
                        </p>
                      )}
                      {item.ukuran_sumber === "pelanggan" && (
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Ukuran: Data Pelanggan
                        </p>
                      )}
                    </div>
                    <span className="font-bold text-gray-800 text-sm shrink-0">
                      {formatRupiah(item.harga_item * item.jumlah)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#EDF4FF] border border-[#DEE9F8] grid grid-cols-2 gap-3 items-center">
              <div>
                <p className="text-xs font-bold text-[#121D27]">
                  Tanggal Deadline
                </p>
                <p className="text-sm sm:text-base font-extrabold text-red-600 mt-0.5">
                  {formatDateIndo(form.tanggal_deadline)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs font-bold text-gray-500">
                  Total Biaya
                </p>
                <p className="text-base sm:text-lg font-extrabold text-[#6B8F71] mt-0.5">
                  {formatRupiah(getFinalTotal())}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                Catatan Tambahan
              </p>
            </div>
            <textarea
              rows={4}
              value={form.catatan_model}
              onChange={(e) =>
                setForm((f) => ({ ...f, catatan_model: e.target.value }))
              }
              placeholder="cth: Model A-line, kerah V, ada kantong samping, warna biru dongker"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#EDF4FF] text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#6B8F71] focus:ring-1 focus:ring-[#6B8F71]/20 transition-colors resize-none"
            />
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        {step > 1 && (
          <button
            type="button"
            disabled={isPending}
            onClick={handleBack}
            className="flex-1 min-h-[48px] rounded-xl bg-[#D8E4F3] hover:bg-[#c6d7ec] text-gray-700 font-semibold text-sm active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            Kembali
          </button>
        )}

        {step < TOTAL_STEPS ? (
          <button
            type="button"
            disabled={!canNext[step]}
            onClick={handleNext}
            className="flex-1 min-h-[48px] rounded-xl bg-[#6B8F71] hover:bg-[#5a7b5f] text-white font-semibold text-sm shadow-sm active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>Lanjut</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
          </button>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={handleSubmit}
            className="flex-1 min-h-[48px] rounded-xl bg-[#6B8F71] hover:bg-[#5a7b5f] text-white font-semibold text-sm shadow-sm active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Simpan Order</span>
              </>
            )}
          </button>
        )}
      </div>

      {step === 1 && !canNext[1] && (
        <p className="text-xs text-center text-gray-400">
          Pilih pelanggan untuk melanjutkan
        </p>
      )}
      {step === 3 && !canNext[3] && (
        <p className="text-xs text-center text-gray-400">
          Isi nama dan harga semua barang untuk melanjutkan
        </p>
      )}
      {step === 4 && !form.tanggal_deadline && (
        <p className="text-xs text-center text-gray-400">
          Pilih tanggal target selesai untuk melanjutkan
        </p>
      )}
      {step === 4 &&
        form.tanggal_deadline &&
        form.tanggal_deadline < getTodayStr() && (
          <p className="text-xs text-center text-amber-500">
            Target selesai tidak boleh sebelum hari ini
          </p>
        )}
    </div>
  );
}
