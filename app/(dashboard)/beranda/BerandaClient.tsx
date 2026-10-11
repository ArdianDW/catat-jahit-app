"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Plus,
  UserPlus,
  Loader2,
  ArrowRight,
} from "lucide-react";
import type { RingkasanBeranda, DeadlineOrderItem } from "@/lib/data";
import { advanceOrderStatus } from "@/lib/actions/order";

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
  const idx = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[idx];
}

function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatDeadlineInfo(deadlineStr: string) {
  if (!deadlineStr) {
    return {
      sisaDeadline: "-",
      formattedDate: "",
      diffDays: 0,
      statusTextColor: "#727971",
      isOverdue: false,
    };
  }

  const [year, month, day] = deadlineStr.split("-").map(Number);
  const deadlineDate = new Date(year, month - 1, day);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let sisaDeadline = "";
  let statusTextColor = "#BA1A1A";
  let isOverdue = false;

  if (diffDays < 0) {
    isOverdue = true;
    const overdue = Math.abs(diffDays);
    sisaDeadline = `lewat ${overdue} hari`;
    statusTextColor = "#BA1A1A";
  } else if (diffDays === 0) {
    sisaDeadline = "hari ini";
    statusTextColor = "#BA1A1A";
  } else if (diffDays === 1) {
    sisaDeadline = "besok";
    statusTextColor = "#BA1A1A";
  } else if (diffDays === 2) {
    sisaDeadline = "2 hari lagi";
    statusTextColor = "#BA1A1A";
  } else if (diffDays === 3) {
    sisaDeadline = "3 hari lagi";
    statusTextColor = "#805200";
  } else {
    sisaDeadline = `${diffDays} hari lagi`;
    statusTextColor = "#727971";
  }

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  const formattedDate = `(${day} ${monthNames[month - 1]})`;

  return { sisaDeadline, formattedDate, diffDays, statusTextColor, isOverdue };
}

const emptySubscribe = () => () => { };

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

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
        };
      })
    );

    setRingkasan((prev) => {
      let orderAktif = prev.orderAktif;
      let siapDiambil = prev.siapDiambil;

      if (currentStatus === "Antri") {
      } else if (currentStatus === "Dikerjakan") {
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
          <span className="text-2xl font-bold leading-tight text-[#6B8F71]">
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
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
              <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
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
              const initials = getInitials(customerName);
              const avatarColor = getAvatarColors(customerName + order.id);

              const itemsDisplay =
                order.item_order && order.item_order.length > 0
                  ? order.item_order.map((it) => it.nama_item).join(", ")
                  : order.jenis_order || order.nomor_order;

              const { sisaDeadline, formattedDate, statusTextColor } =
                formatDeadlineInfo(order.tanggal_deadline);

              const isUpdating = updatingId === order.id;

              return (
                <div
                  key={order.id}
                  className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs flex flex-col gap-3.5 transition-all hover:border-[#6B8F71]/60"
                >
                  <div className="flex items-start gap-3">
                    <div
                      style={{
                        backgroundColor: avatarColor.bg,
                        color: avatarColor.text,
                      }}
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0 select-none shadow-xs"
                    >
                      {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {customerName}
                        </p>

                        <div className="flex items-center gap-1 text-xs font-bold shrink-0">
                          {order.status === "Dikerjakan" && (
                            <Scissors className="w-3.5 h-3.5 text-[#6B8F71] shrink-0 stroke-[2.2]" />
                          )}
                          {order.status === "Antri" && (
                            <Clock className="w-3.5 h-3.5 text-gray-500 shrink-0 stroke-[2.2]" />
                          )}
                          {order.status === "Selesai" && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#6B8F71] shrink-0 stroke-[2.4]" />
                          )}
                          <span style={{ color: statusTextColor }}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 mt-1 font-medium truncate">
                        {itemsDisplay} - {sisaDeadline}
                      </p>

                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {order.nomor_order} • {formattedDate}
                      </p>
                    </div>
                  </div>

                  {order.status === "Antri" && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() =>
                        handleAdvanceStatus(order.id, order.status)
                      }
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-[#465F86] hover:bg-[#384c6c] disabled:opacity-60 text-white font-medium text-xs shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-1.5 cursor-pointer select-none"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4 shrink-0 stroke-[2.2]" />
                          <span>Lanjut ke: Dikerjakan</span>
                        </>
                      )}
                    </button>
                  )}

                  {order.status === "Dikerjakan" && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() =>
                        handleAdvanceStatus(order.id, order.status)
                      }
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-[#6B8F71] hover:bg-[#5a7b5f] disabled:opacity-60 text-white font-medium text-xs shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-1.5 cursor-pointer select-none"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 shrink-0 stroke-[2.2]" />
                          <span>Lanjut ke: Selesai</span>
                        </>
                      )}
                    </button>
                  )}

                  {order.status === "Selesai" && (
                    <div className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-medium text-xs flex items-center justify-center gap-1.5 border border-emerald-100 select-none">
                      <CheckCircle2 className="w-4 h-4 shrink-0 stroke-[2.4]" />
                      <span>Pesanan Telah Selesai</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
