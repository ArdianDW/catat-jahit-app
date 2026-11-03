"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Loader2,
  AlertCircle,
  Phone,
  MessageCircle,
  FileText,
  ShoppingBag,
  X,
  History,
  Pencil,
  PackageCheck,
  Ruler,
  ChevronRight,
} from "lucide-react";
import type { OrderDetail, StatusOrder } from "@/lib/data";
import { advanceOrderStatus } from "@/lib/actions/order";
import { formatRupiah, formatDateIndo } from "@/lib/utils/format";
import { formatWhatsAppUrl, formatTelUrl } from "@/lib/utils/phone";
import Avatar from "@/components/ui/Avatar";
import StatusBadge from "@/components/ui/StatusBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import MeasurementTableView from "@/components/order/MeasurementTableView";
import { PackageCheck as PackageCheckIcon } from "lucide-react";

function formatDateTimeIndo(dateTimeStr: string) {
  if (!dateTimeStr) return "-";
  const d = new Date(dateTimeStr);
  const dateFormatted = d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeFormatted = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateFormatted}, ${timeFormatted}`;
}

function formatDeadlineStatus(deadlineStr: string) {
  if (!deadlineStr) return { sisa: "-", urgent: false };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = deadlineStr.slice(0, 10).split("-").map(Number);
  const target = new Date(y, m - 1, d);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { sisa: `Lewat ${Math.abs(diffDays)} hari`, urgent: true };
  if (diffDays === 0) return { sisa: "Hari ini", urgent: true };
  if (diffDays === 1) return { sisa: "Besok", urgent: true };
  if (diffDays <= 3) return { sisa: `${diffDays} hari lagi`, urgent: true };
  return { sisa: `${diffDays} hari lagi`, urgent: false };
}

type MeasurementItem = {
  nama_item: string;
  lingkar_dada?: number | null;
  lingkar_pinggang?: number | null;
  lingkar_pinggul?: number | null;
  panjang_bahu?: number | null;
  panjang_lengan?: number | null;
  panjang_baju?: number | null;
  panjang_celana?: number | null;
  catatan_ukuran?: string | null;
};

function UkuranBadanModal({
  item,
  onClose,
}: {
  item: MeasurementItem;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EFF3EE] flex items-center justify-center shrink-0">
              <Ruler className="w-4 h-4 text-[#6D726D]" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm leading-tight">Ukuran Badan</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">{item.nama_item}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="px-5 py-4">
          <MeasurementTableView
            data={item}
            title=""
            emptyMessage="Tidak ada ukuran tercatat"
          />
        </div>

        <div className="px-5 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[44px] rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DetailOrderClient({ initialOrder }: { initialOrder: OrderDetail }) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail>(initialOrder);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedMeasurementItem, setSelectedMeasurementItem] = useState<MeasurementItem | null>(null);
  const [, startTransition] = useTransition();

  const customerName = order.pelanggan?.nama_pelanggan || "Pelanggan";
  const deadlineInfo = formatDeadlineStatus(order.tanggal_deadline);

  const nextStatusMap: Record<StatusOrder, StatusOrder | null> = {
    Antri: "Dikerjakan",
    Dikerjakan: "Selesai",
    Selesai: "Diambil",
    Diambil: null,
  };
  const nextStatus = nextStatusMap[order.status];

  const handleAdvance = async () => {
    if (order.status === "Selesai") {
      setShowConfirmModal(true);
      return;
    }
    await doAdvance();
  };

  const doAdvance = async () => {
    if (!nextStatus) return;
    setIsUpdating(true);
    setErrorMessage(null);

    const previousOrder = order;
    setOrder((prev) => ({
      ...prev,
      status: nextStatus,
      status_pembayaran: nextStatus === "Diambil" ? "Lunas" : prev.status_pembayaran,
      riwayat_status: [
        {
          id: "temp-" + Date.now(),
          order_id: prev.id,
          status: nextStatus,
          tanggal: new Date().toISOString(),
        },
        ...prev.riwayat_status,
      ],
    }));

    const res = await advanceOrderStatus(order.id);
    setIsUpdating(false);

    if (!res.success) {
      setErrorMessage(res.error || "Gagal mengubah status pesanan");
      setOrder(previousOrder);
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  };

  const waUrl = formatWhatsAppUrl(order.pelanggan?.no_hp || "");
  const telUrl = formatTelUrl(order.pelanggan?.no_hp || "");

  return (
    <>
      <ConfirmDialog
        isOpen={showConfirmModal}
        title="Pesanan Sudah Diambil?"
        subtitle={`${order.nomor_order} · ${customerName}`}
        description="Status akan diubah menjadi Diambil. Setelah diambil, status pesanan tidak dapat diubah kembali."
        confirmLabel="Ya, Sudah Diambil"
        confirmColor="#6B8F71"
        confirmHoverColor="#5a7b5f"
        onConfirm={async () => {
          setShowConfirmModal(false);
          await doAdvance();
        }}
        onCancel={() => setShowConfirmModal(false)}
        isLoading={isUpdating}
        position="center"
      />

      {selectedMeasurementItem && (
        <UkuranBadanModal
          item={selectedMeasurementItem}
          onClose={() => setSelectedMeasurementItem(null)}
        />
      )}

      <div className="flex flex-col gap-4 pb-20">
        {errorMessage && (
          <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button type="button" onClick={() => setErrorMessage(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-gray-800 tracking-tight">
                {order.nomor_order}
              </span>
              {order.jenis_order && (
                <span className="text-[11px] font-medium text-[#465F86] bg-[#D8E4F3] px-2 py-0.5 rounded-md">
                  {order.jenis_order}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={order.status} />
            </div>
          </div>

          <div className="bg-[#EDF4FF] rounded-xl p-3.5 flex flex-col gap-3 border border-[#D0E4FF]/60">
            <div className="flex items-center gap-3">
              <Avatar name={customerName} seedId={order.id} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{customerName}</p>
                <p className="text-xs font-medium text-gray-600 mt-0.5">
                  {order.pelanggan?.no_hp || "-"}
                </p>
              </div>
            </div>

            {order.pelanggan?.no_hp ? (
              <div className="flex gap-2 pt-0.5">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 min-h-[40px] rounded-xl bg-[#6B8F71] hover:bg-[#5a7b5f] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-[0.98]"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                  <span>Kirim WhatsApp</span>
                </a>
                <a
                  href={telUrl}
                  className="min-w-[48px] px-3.5 min-h-[40px] rounded-xl bg-[#465F86] hover:bg-[#384c6c] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-[0.98]"
                >
                  <Phone className="w-4 h-4 text-white" />
                  <span>Telepon</span>
                </a>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => router.push(`/order/${order.id}/edit`)}
              className="w-full min-h-[42px] rounded-xl bg-white hover:bg-gray-50 border border-gray-200/90 text-gray-700 hover:text-gray-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <Pencil className="w-4 h-4 text-[#465F86]" />
              <span>Edit Data Pesanan</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-[#EDF4FF] rounded-xl p-3 flex flex-col justify-center border border-[#D0E4FF]/60 text-[#121D27]">
              <span className="text-[11px] font-semibold opacity-75">Tanggal Masuk</span>
              <span className="text-xs sm:text-sm font-bold mt-0.5">
                {formatDateIndo(order.tanggal_masuk)}
              </span>
            </div>

            <div className="bg-[#FFDDB5] rounded-xl p-3 flex flex-col justify-center border border-[#F4CCA1]/60 text-[#2A1800]">
              <span className="text-[11px] font-semibold opacity-75">Target Selesai</span>
              <span className="text-xs sm:text-sm font-bold mt-0.5">
                {formatDateIndo(order.tanggal_deadline)}
              </span>
              <span className="text-[11px] font-semibold mt-0.5 opacity-85">
                {deadlineInfo.sisa}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex flex-col gap-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Rincian Barang & Ukuran
          </span>

          <div className="flex flex-col gap-3 divide-y divide-gray-100">
            {order.item_order.map((item, index) => {
              const hasMeasurements =
                item.lingkar_dada ||
                item.lingkar_pinggang ||
                item.lingkar_pinggul ||
                item.panjang_bahu ||
                item.panjang_lengan ||
                item.panjang_baju ||
                item.panjang_celana;

              return (
                <div key={item.id} className={index > 0 ? "pt-3 flex flex-col gap-2" : "flex flex-col gap-2"}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                        <ShoppingBag className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 leading-snug">
                          {item.nama_item}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.jumlah} × {formatRupiah(item.harga_item)}
                          {item.layanan && (
                            <span className="text-gray-400"> · Layanan: {item.layanan.nama_layanan}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-800 shrink-0">
                      {formatRupiah(item.harga_item * item.jumlah)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500 pl-9">
                    <Ruler className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>Sumber Ukuran:</span>
                    <span className="font-semibold text-gray-700">
                      {item.ukuran_sumber === "pelanggan" && "Ukuran Pelanggan"}
                      {item.ukuran_sumber === "lain" && `Ukuran Lain (${item.ukuran_untuk || "Nama tidak diisi"})`}
                      {item.ukuran_sumber === "tanpa" && "Tanpa Ukuran"}
                    </span>
                  </div>

                  {hasMeasurements && (
                    <button
                      type="button"
                      onClick={() => setSelectedMeasurementItem(item)}
                      className="mt-1 ml-9 w-[calc(100%-2.25rem)] p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 hover:border-gray-200 active:scale-[0.99] transition-all cursor-pointer text-left flex items-center justify-between gap-2 group"
                    >
                      <div className="flex items-center gap-2">
                        <Ruler className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <div>
                          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Ukuran Badan (cm)</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {[
                              item.lingkar_dada && `LD: ${item.lingkar_dada}`,
                              item.lingkar_pinggang && `LP: ${item.lingkar_pinggang}`,
                              item.panjang_baju && `PB: ${item.panjang_baju}`,
                            ].filter(Boolean).join(" · ") || "Tap untuk lihat detail"}
                            {(item.lingkar_dada || item.lingkar_pinggang || item.panjang_baju) && " · ..."}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 shrink-0 transition-colors" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-600">Total Harga</span>
            <span className="text-base font-extrabold text-gray-900">
              {formatRupiah(order.total_harga)}
            </span>
          </div>

          <div className="pt-2.5 flex items-center justify-between border-t border-dashed border-gray-200">
            <span className="text-xs text-gray-500 font-medium">Status Pembayaran</span>
            <div>
              {order.status_pembayaran === "Lunas" ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold text-white bg-[#465F86] shadow-2xs">
                  Sudah Lunas
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold text-white bg-[#BA1A1A] shadow-2xs">
                  Belum Lunas
                </span>
              )}
            </div>
          </div>
        </div>

        {order.catatan_model && (
          <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-gray-400" />
              <span>Catatan Model / Desain</span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-amber-50/50 p-3 rounded-xl border border-amber-100/60">
              {order.catatan_model}
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex flex-col gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <History className="w-3.5 h-3.5 text-gray-400" />
            <span>Riwayat Pengerjaan Pesanan</span>
          </div>

          <div className="flex flex-col relative pl-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
            {order.riwayat_status && order.riwayat_status.length > 0 ? (
              order.riwayat_status.map((item, idx) => {
                const isLatest = idx === 0;
                return (
                  <div key={item.id} className="relative pb-4 last:pb-0">
                    <div
                      className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        isLatest ? "bg-[#6B8F71] ring-2 ring-[#6B8F71]/30" : "bg-gray-300"
                      }`}
                    />
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={`text-xs font-bold ${isLatest ? "text-gray-800" : "text-gray-500"}`}>
                        Status: {item.status}
                      </p>
                      <span className="text-[11px] text-gray-400">
                        {formatDateTimeIndo(item.tanggal)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-400 italic">Belum ada riwayat tercatat</p>
            )}
          </div>
        </div>

        {nextStatus ? (
          <button
            type="button"
            disabled={isUpdating}
            onClick={handleAdvance}
            className={`w-full min-h-[48px] px-4 py-3 rounded-2xl font-bold text-sm text-white shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 ${
              order.status === "Antri"
                ? "bg-[#6D726D] hover:bg-[#575c57]"
                : order.status === "Dikerjakan"
                ? "bg-[#B37402] hover:bg-[#8f5d02]"
                : order.status === "Selesai"
                ? "bg-[#465F86] hover:bg-[#384c6c]"
                : "bg-[#BA1A1A] hover:bg-[#93000A]"
            }`}
          >
            {isUpdating ? (
              <><Loader2 className="w-5 h-5 animate-spin shrink-0" /><span>Menyimpan...</span></>
            ) : (
              <><ArrowRight className="w-5 h-5 shrink-0 stroke-[2.4]" /><span>Lanjut ke: {nextStatus}</span></>
            )}
          </button>
        ) : (
          <div className="w-full min-h-[46px] px-4 py-3 rounded-2xl bg-[#6B8F71] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs select-none">
            <PackageCheck className="w-5 h-5 text-white shrink-0 stroke-[2.2]" />
            <span>Pesanan Telah Diambil</span>
          </div>
        )}
      </div>
    </>
  );
}
