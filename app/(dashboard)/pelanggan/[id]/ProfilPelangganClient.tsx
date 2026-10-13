"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Phone,
  MessageCircle,
  MapPin,
  Ruler,
  Calendar,
  Pencil,
  Plus,
  Scissors,
  Clock,
  CheckCircle2,
  PackageCheck,
  ChevronRight,
  FileText,
  AlertCircle,
  Trash2,
  Loader2,
} from "lucide-react";
import type { PelangganItem, PelangganOrderItem, StatusOrder } from "@/lib/data";
import { deletePelanggan } from "@/lib/actions/pelanggan";

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

function formatRupiah(amount: number) {
  return "Rp " + amount.toLocaleString("id-ID");
}

function formatDateIndo(dateStr: string | null) {
  if (!dateStr) return "-";
  const [year, month, day] = dateStr.slice(0, 10).split("-").map(Number);
  const MONTHS = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

function StatusBadge({ status }: { status: StatusOrder }) {
  switch (status) {
    case "Antri":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#BA1A1A] text-white">
          <Clock className="w-3 h-3 text-white" />
          <span>Antri</span>
        </span>
      );
    case "Dikerjakan":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#424842] text-white">
          <Scissors className="w-3 h-3 text-white" />
          <span>Dikerjakan</span>
        </span>
      );
    case "Selesai":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#465F86] text-white">
          <CheckCircle2 className="w-3 h-3 text-white" />
          <span>Selesai</span>
        </span>
      );
    case "Diambil":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#6B8F71] text-white">
          <PackageCheck className="w-3 h-3 text-white" />
          <span>Diambil</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-500 text-white">
          <span>{status}</span>
        </span>
      );
  }
}

interface ProfilPelangganClientProps {
  pelanggan: PelangganItem;
  riwayatOrder: PelangganOrderItem[];
}

export default function ProfilPelangganClient({
  pelanggan,
  riwayatOrder,
}: ProfilPelangganClientProps) {
  const router = useRouter();
  const [isDeleting, startTransition] = useTransition();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const avatar = getAvatarColors(pelanggan.nama_pelanggan + pelanggan.id);
  const initials = getInitials(pelanggan.nama_pelanggan);

  const cleanPhone = (pelanggan.no_hp || "").replace(/\D/g, "");
  const waNumber = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;

  const handleDelete = () => {
    setDeleteError(null);
    startTransition(async () => {
      const res = await deletePelanggan(pelanggan.id);
      if (!res.success) {
        setDeleteError(res.error ?? "Gagal menghapus pelanggan");
        return;
      }
      setShowDeleteModal(false);
      router.push("/pelanggan");
      router.refresh();
    });
  };

  const measurements = [
    { label: "Lingkar Dada", value: pelanggan.lingkar_dada },
    { label: "Lingkar Pinggang", value: pelanggan.lingkar_pinggang },
    { label: "Lingkar Pinggul", value: pelanggan.lingkar_pinggul },
    { label: "Panjang Bahu", value: pelanggan.panjang_bahu },
    { label: "Panjang Lengan", value: pelanggan.panjang_lengan },
    { label: "Panjang Baju", value: pelanggan.panjang_baju },
    { label: "Panjang Celana", value: pelanggan.panjang_celana },
  ].filter((m) => m.value !== null && m.value !== undefined);

  const hasMeasurements = measurements.length > 0;

  return (
    <div className="flex flex-col gap-4 pb-20">
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div
            style={{ backgroundColor: avatar.bg, color: avatar.text }}
            className="w-16 h-16 rounded-full flex items-center justify-center font-extrabold text-xl shrink-0 shadow-sm"
          >
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight truncate">
              {pelanggan.nama_pelanggan}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
              <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{pelanggan.no_hp}</span>
            </div>
          </div>
        </div>

        {pelanggan.no_hp && (
          <div className="flex gap-2 pt-1 border-t border-gray-100">
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 min-h-[42px] rounded-xl bg-[#6B8F71] hover:bg-[#5a7b5f] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-[0.98]"
            >
              <MessageCircle className="w-4 h-4 text-white" />
              <span>Kirim WhatsApp</span>
            </a>
            <a
              href={`tel:${pelanggan.no_hp}`}
              className="min-w-[100px] px-3 min-h-[42px] rounded-xl bg-[#465F86] hover:bg-[#384c6c] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-[0.98]"
            >
              <Phone className="w-4 h-4 text-white" />
              <span>Telepon</span>
            </a>
          </div>
        )}

        {pelanggan.alamat_singkat && (
          <div className="p-3 rounded-xl bg-[#EDF4FF] border border-[#DEE9F8] flex items-start gap-2.5 text-xs text-gray-700">
            <MapPin className="w-4 h-4 text-[#465F86] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-gray-800">Alamat: </span>
              <span className="text-gray-600">{pelanggan.alamat_singkat}</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#EFF3EE] flex items-center justify-center shrink-0">
              <Ruler className="w-3.5 h-3.5 text-[#6B8F71]" />
            </div>
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
              Data Ukuran Badan
            </span>
          </div>

          {pelanggan.tanggal_terakhir_diukur && (
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDateIndo(pelanggan.tanggal_terakhir_diukur)}
            </span>
          )}
        </div>

        {hasMeasurements ? (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              {measurements.map(({ label, value }) => (
                <div
                  key={label}
                  className="p-2.5 rounded-xl bg-[#EDF4FF] border border-[#DEE9F8] flex items-center justify-between"
                >
                  <span className="text-xs text-gray-500">{label}</span>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-sm font-extrabold text-gray-800">
                      {value}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">cm</span>
                  </div>
                </div>
              ))}
            </div>

            {pelanggan.catatan_ukuran && (
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-100 flex items-start gap-2">
                <FileText className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">
                    Catatan Ukuran
                  </p>
                  <p className="text-xs text-amber-900 mt-0.5 leading-relaxed">
                    {pelanggan.catatan_ukuran}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-center flex flex-col items-center gap-1.5">
            <AlertCircle className="w-5 h-5 text-gray-400" />
            <p className="text-xs font-semibold text-gray-600">
              Belum ada ukuran badan tersimpan
            </p>
            <p className="text-[11px] text-gray-400 max-w-[240px]">
              Ukuran badan dapat ditambahkan melalui menu Edit Profil di bawah.
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#EDF4FF] flex items-center justify-center shrink-0">
              <Scissors className="w-3.5 h-3.5 text-[#465F86]" />
            </div>
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
              Riwayat Pesanan ({riwayatOrder.length})
            </span>
          </div>

          <Link
            href="/order/baru"
            className="text-xs font-bold text-[#6B8F71] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Order Baru</span>
          </Link>
        </div>

        {riwayatOrder.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {riwayatOrder.map((order) => (
              <Link
                key={order.id}
                href={`/order/${order.id}`}
                className="p-3.5 rounded-xl border border-gray-200/90 bg-white hover:border-[#6B8F71]/60 hover:shadow-xs transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-800 group-hover:text-[#6B8F71] transition-colors">
                      {order.nomor_order}
                    </span>
                    <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      {order.jenis_order}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Deadline: {formatDateIndo(order.tanggal_deadline)}</span>
                    <span>·</span>
                    <span className="font-bold text-gray-700">
                      {formatRupiah(order.total_harga)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={order.status} />
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#6B8F71] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-center">
            <p className="text-xs text-gray-400">Belum ada riwayat pesanan untuk pelanggan ini.</p>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 flex flex-col gap-4 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-900 text-sm">Hapus Pelanggan?</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{pelanggan.nama_pelanggan}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus pelanggan <span className="font-bold text-gray-800">{pelanggan.nama_pelanggan}</span>? Tindakan ini tidak dapat dibatalkan.
            </p>

            {deleteError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{deleteError}</span>
              </div>
            )}

            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 min-h-[44px] rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                style={{ backgroundColor: "#BA1A1A" }}
                className="flex-1 min-h-[44px] rounded-xl text-white font-bold text-sm hover:brightness-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2.5 pt-2">
        <Link
          href={`/pelanggan/${pelanggan.id}/edit`}
          className="w-full min-h-[48px] rounded-xl bg-[#6B8F71] hover:bg-[#5a7b5f] text-white font-bold text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Pencil className="w-4 h-4" />
          <span>Edit Profil Pelanggan</span>
        </Link>
        <button
          type="button"
          onClick={() => {
            setDeleteError(null);
            setShowDeleteModal(true);
          }}
          style={{ backgroundColor: "#BA1A1A" }}
          className="w-full min-h-[48px] rounded-xl text-white font-bold text-sm shadow-md hover:brightness-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Trash2 className="w-4 h-4 text-white" />
          <span>Hapus Pelanggan</span>
        </button>
      </div>
    </div>
  );
}
