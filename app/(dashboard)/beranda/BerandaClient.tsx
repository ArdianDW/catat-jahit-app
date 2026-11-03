"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  AlertCircle,
  Plus,
  UserPlus,
  Loader2,
  ArrowRight,
  PackageCheck,
  CheckCircle2,
} from "lucide-react";
import type { RingkasanBeranda, DeadlineOrderItem } from "@/lib/data";
import { advanceOrderStatus } from "@/lib/actions/order";
import { formatDeadline } from "@/lib/utils/format";
import { getAvatarColors, getInitials } from "@/lib/utils/avatar";
import Avatar from "@/components/ui/Avatar";
import StatusBadge from "@/components/ui/StatusBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PushNotificationManager from "@/components/PushNotificationManager";
import TestNotificationButton from "@/components/TestNotificationButton";

const emptySubscribe = () => () => {};

function getClientDate() {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface BerandaClientProps {
  initialRingkasan: RingkasanBeranda;
  initialOrders: DeadlineOrderItem[];
}

export default function BerandaClient({
  initialRingkasan,
  initialOrders,
}: BerandaClientProps) {
  const router = useRouter();
  const currentDate = useSyncExternalStore(
    emptySubscribe,
    getClientDate,
    () => ""
  );

  const [orders, setOrders] = useState<DeadlineOrderItem[]>(initialOrders);
  const [ringkasan, setRingkasan] = useState<RingkasanBeranda>(initialRingkasan);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmOrder, setConfirmOrder] = useState<DeadlineOrderItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleAdvance = (order: DeadlineOrderItem) => {
    if (order.status === "Selesai") {
      setConfirmOrder(order);
      return;
    }
    handleAdvanceStatus(order.id, order.status);
  };

  const handleAdvanceStatus = async (orderId: string, currentStatus: string) => {
    setUpdatingId(orderId);
    setErrorMessage(null);

    const nextStatus =
      currentStatus === "Antri"
        ? "Dikerjakan"
        : currentStatus === "Dikerjakan"
          ? "Selesai"
          : "Diambil";

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          status: nextStatus as DeadlineOrderItem["status"],
          status_pembayaran: nextStatus === "Diambil" ? "Lunas" : order.status_pembayaran,
        };
      })
    );

    setRingkasan((prev) => {
      let orderAktif = prev.orderAktif;
      let siapDiambil = prev.siapDiambil;

      if (currentStatus === "Dikerjakan") {
        orderAktif = Math.max(0, orderAktif - 1);
        siapDiambil += 1;
      }
      return { ...prev, orderAktif, siapDiambil };
    });

    const res = await advanceOrderStatus(orderId);
    setUpdatingId(null);

    if (!res.success) {
      setErrorMessage(res.error || "Gagal mengubah status pesanan");
      setOrders(initialOrders);
      setRingkasan(initialRingkasan);
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <>
      <ConfirmDialog
        isOpen={!!confirmOrder}
        title="Pesanan Sudah Diambil?"
        subtitle={
          confirmOrder
            ? `${confirmOrder.nomor_order} · ${confirmOrder.pelanggan?.nama_pelanggan ?? "?"}`
            : ""
        }
        description="Status akan berubah menjadi Diambil dan tidak bisa dikembalikan. Yakin pesanan ini sudah diambil pelanggan?"
        confirmLabel="Ya, Sudah Diambil"
        confirmColor="#6B8F71"
        confirmHoverColor="#5a7b5f"
        icon={<PackageCheck className="w-5 h-5 text-[#6B8F71]" />}
        iconBg="#E8EFEA"
        onConfirm={async () => {
          const o = confirmOrder!;
          setConfirmOrder(null);
          await handleAdvanceStatus(o.id, o.status);
        }}
        onCancel={() => setConfirmOrder(null)}
        isLoading={confirmOrder ? updatingId === confirmOrder.id : false}
        position="bottom"
      />

      <div className="flex flex-col gap-5">
        <section className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
            Halo, Bu Rusliyati!
          </h2>
          <div className="text-sm text-gray-500 font-medium min-h-[20px] flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
            <span>{currentDate}</span>
          </div>
        </section>

        <PushNotificationManager />

        <section className="flex flex-col gap-3">
          <Link
            href="/order/baru"
            className="flex items-center justify-center gap-2 min-h-[48px] px-4 py-3 rounded-xl bg-[#6B8F71] hover:bg-[#5a7b5f] text-white font-medium text-sm shadow-sm transition-all active:scale-[0.98] cursor-pointer w-full select-none"
          >
            <Plus className="w-4 h-4 shrink-0 stroke-[2.5]" />
            <span>Tambah Order</span>
          </Link>

          <Link
            href="/pelanggan/baru"
            className="flex items-center justify-center gap-2 min-h-[48px] px-4 py-3 rounded-xl bg-[#465F86] hover:bg-[#384c6c] text-white font-medium text-sm shadow-sm transition-all active:scale-[0.98] cursor-pointer w-full select-none"
          >
            <UserPlus className="w-4 h-4 shrink-0 stroke-[2.2]" />
            <span>Tambah Pelanggan</span>
          </Link>

          <TestNotificationButton />
        </section>

        <section className="grid grid-cols-3 gap-2.5">
          <div className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-white border border-gray-100 shadow-xs min-h-[94px]">
            <span className="text-2xl font-bold leading-tight text-[#465F86]">
              {ringkasan.orderAktif}
            </span>
            <span className="text-xs font-bold text-gray-800 leading-tight mt-0.5">
              Order Aktif
            </span>
            <span className="text-[10px] font-medium text-gray-500 leading-tight mt-0.5">
              Antri &amp; Dikerjakan
            </span>
          </div>

          <div className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-[#FFDAD6] border border-[#FFDAD6] shadow-xs min-h-[94px]">
            <span className="text-2xl font-bold leading-tight text-[#93000A]">
              {ringkasan.mendekatiDeadline}
            </span>
            <span className="text-xs font-bold text-[#93000A] leading-tight mt-0.5">
              Mendekati Deadline
            </span>
            <span className="text-[10px] font-medium text-[#93000A] leading-tight mt-0.5">
              &lt; 3 hari
            </span>
          </div>

          <div className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-white border border-gray-100 shadow-xs min-h-[94px]">
            <span className="text-2xl font-bold leading-tight text-[#465F86]">
              {ringkasan.siapDiambil}
            </span>
            <span className="text-xs font-bold text-gray-800 leading-tight mt-0.5">
              Siap Diambil
            </span>
            <span className="text-[10px] font-medium text-gray-500 leading-tight mt-0.5">
              Selesai
            </span>
          </div>
        </section>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-500 font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 stroke-[2.2]" />
              <h3 className="text-lg font-extrabold text-gray-800 tracking-tight">
                Order Mendekati Deadline
              </h3>
            </div>
            <span className="text-xs font-semibold text-[#93000A] bg-[#FFDAD6] px-2.5 py-1 rounded-full border border-[#FFDAD6]">
              {orders.length} pesanan
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="p-6 bg-white rounded-2xl border border-gray-200/80 shadow-xs flex flex-col items-center justify-center text-center gap-2 min-h-[160px]">
              <div className="w-12 h-12 rounded-full bg-[#E8EFEA] text-[#6B8F71] flex items-center justify-center mb-1">
                <CheckCircle2 className="w-6 h-6 stroke-[2.2] text-[#6B8F71]" />
              </div>
              <p className="text-sm font-bold text-gray-800">
                Tidak ada order mendekati deadline
              </p>
              <p className="text-xs text-gray-500 max-w-[260px] leading-relaxed">
                Semua pesanan masih memiliki waktu pengerjaan yang aman atau sudah siap diambil.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {orders.map((order) => {
                const customerName =
                  order.pelanggan?.nama_pelanggan || "Pelanggan";

                const itemsDisplay =
                  order.item_order && order.item_order.length > 0
                    ? order.item_order.map((it) => it.nama_item).join(", ")
                    : order.jenis_order || order.nomor_order;

                const deadline = formatDeadline(order.tanggal_deadline);

                const sisaText =
                  deadline.status === "lewat"
                    ? `lewat ${Math.abs(deadline.sisaHari ?? 0)} hari`
                    : deadline.status === "hari-h"
                      ? "hari ini"
                      : deadline.status === "mendesak"
                        ? deadline.sisaHari === 1
                          ? "besok"
                          : `${deadline.sisaHari} hari lagi`
                        : `${deadline.sisaHari} hari lagi`;

                const statusTextColor =
                  deadline.status === "lewat" || deadline.status === "hari-h"
                    ? "#BA1A1A"
                    : deadline.status === "mendesak"
                      ? "#805200"
                      : "#727971";

                const isUpdating = updatingId === order.id;

                const NEXT_LABEL: Record<string, string> = {
                  Antri: "Dikerjakan",
                  Dikerjakan: "Selesai",
                  Selesai: "Diambil",
                };

                const BTN_COLOR: Record<string, string> = {
                  Antri: "bg-[#6D726D] hover:bg-[#575c57]",
                  Dikerjakan: "bg-[#B37402] hover:bg-[#8f5d02]",
                  Selesai: "bg-[#465F86] hover:bg-[#384c6c]",
                };

                return (
                  <div
                    key={order.id}
                    className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs flex flex-col gap-3.5 transition-all hover:border-[#6B8F71]/60"
                  >
                    <Link
                      href={`/order/${order.id}`}
                      className="flex items-start gap-3 cursor-pointer group"
                    >
                      <Avatar
                        name={customerName}
                        seedId={order.id}
                        size="lg"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-gray-800 truncate group-hover:text-[#6B8F71] transition-colors">
                            {customerName}
                          </p>
                          <StatusBadge status={order.status as Parameters<typeof StatusBadge>[0]["status"]} size="sm" />
                        </div>

                        <p className="text-xs text-gray-600 mt-1 font-medium truncate">
                          {itemsDisplay} -{" "}
                          <span style={{ color: statusTextColor }}>{sisaText}</span>
                        </p>

                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {order.nomor_order} • ({deadline.label})
                        </p>
                      </div>
                    </Link>

                    {order.status !== "Diambil" && NEXT_LABEL[order.status] && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleAdvance(order)}
                        className={`w-full min-h-[40px] px-3 py-2 rounded-xl disabled:opacity-60 text-white font-medium text-xs shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-1.5 cursor-pointer select-none ${BTN_COLOR[order.status]}`}
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                            <span>Menyimpan...</span>
                          </>
                        ) : (
                          <>
                            <ArrowRight className="w-4 h-4 shrink-0 stroke-[2.2]" />
                            <span>Lanjut ke: {NEXT_LABEL[order.status]}</span>
                          </>
                        )}
                      </button>
                    )}

                    {order.status === "Diambil" && (
                      <div className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-[#6B8F71] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs select-none">
                        <PackageCheck className="w-4 h-4 shrink-0 stroke-[2.4] text-white" />
                        <span>Pesanan Sudah Diambil</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
