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
  ChevronRight,
  FileText,
  AlertCircle,
  Trash2,
  Loader2,
} from "lucide-react";
import type { PelangganItem, PelangganOrderItem } from "@/lib/data";
import { deletePelanggan } from "@/lib/actions/pelanggan";
import { formatRupiah, formatDateIndo } from "@/lib/utils/format";
import { formatWhatsAppUrl, formatTelUrl } from "@/lib/utils/phone";
import Avatar from "@/components/ui/Avatar";
import StatusBadge from "@/components/ui/StatusBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import MeasurementTableView from "@/components/order/MeasurementTableView";

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

  const measurements = {
    lingkar_dada: pelanggan.lingkar_dada ?? null,
    lingkar_pinggang: pelanggan.lingkar_pinggang ?? null,
    lingkar_pinggul: pelanggan.lingkar_pinggul ?? null,
    panjang_bahu: pelanggan.panjang_bahu ?? null,
    panjang_lengan: pelanggan.panjang_lengan ?? null,
    panjang_baju: pelanggan.panjang_baju ?? null,
    panjang_celana: pelanggan.panjang_celana ?? null,
    catatan_ukuran: pelanggan.catatan_ukuran ?? null,
  };

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

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* Kartu Profil */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={pelanggan.nama_pelanggan} seedId={pelanggan.id} size="lg" />

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
              href={formatWhatsAppUrl(pelanggan.no_hp)}
              target="_blank"
              rel="noreferrer"
              className="flex-1 min-h-[42px] rounded-xl bg-[#6B8F71] hover:bg-[#5a7b5f] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-[0.98]"
            >
              <MessageCircle className="w-4 h-4 text-white" />
              <span>Kirim WhatsApp</span>
            </a>
            <a
              href={formatTelUrl(pelanggan.no_hp)}
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

      {/* Kartu Ukuran Badan */}
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
              {formatDateIndo(pelanggan.tanggal_terakhir_diukur, "long")}
            </span>
          )}
        </div>

        <MeasurementTableView measurements={measurements} />
      </div>

      {/* Riwayat Pesanan */}
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
                    <span>Deadline: {formatDateIndo(order.tanggal_deadline, "long")}</span>
                    <span>·</span>
                    <span className="font-bold text-gray-700">
                      {formatRupiah(order.total_harga)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={order.status} size="sm" />
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#6B8F71] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-center flex flex-col items-center gap-2">
            <FileText className="w-5 h-5 text-gray-300" />
            <p className="text-xs text-gray-400">Belum ada riwayat pesanan untuk pelanggan ini.</p>
          </div>
        )}
      </div>

      {/* Tombol Aksi */}
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
          className="w-full min-h-[48px] rounded-xl bg-[#BA1A1A] hover:bg-[#9c1515] text-white font-bold text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Trash2 className="w-4 h-4 text-white" />
          <span>Hapus Pelanggan</span>
        </button>
      </div>

      {/* Dialog Hapus */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        title="Hapus Pelanggan?"
        subtitle={pelanggan.nama_pelanggan}
        description={`Apakah Anda yakin ingin menghapus pelanggan ${pelanggan.nama_pelanggan}? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        confirmColor="#BA1A1A"
        confirmHoverColor="#9c1515"
        icon={<Trash2 className="w-5 h-5 text-red-600" />}
        iconBg="#FEE2E2"
        onConfirm={handleDelete}
        onCancel={() => !isDeleting && setShowDeleteModal(false)}
        isLoading={isDeleting}
        position="center"
        errorMessage={deleteError ?? undefined}
      />
    </div>
  );
}
