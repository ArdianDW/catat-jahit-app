"use client";

import { useState, useEffect, useTransition, useDeferredValue } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Loader2,
  AlertCircle,
  X,
  Filter,
  ShoppingBag,
  Search,
  PackageCheck,
} from "lucide-react";
import type { OrderItem, StatusOrder } from "@/lib/data";
import { advanceOrderStatus } from "@/lib/actions/order";
import { formatRupiah, formatDeadline } from "@/lib/utils/format";
import { getAvatarColors, getInitials } from "@/lib/utils/avatar";
import StatusBadge from "@/components/ui/StatusBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Toast from "@/components/ui/Toast";

const FILTER_TABS: { label: string; value: StatusOrder | "Semua" }[] = [
  { label: "Semua", value: "Semua" },
  { label: "Antri", value: "Antri" },
  { label: "Dikerjakan", value: "Dikerjakan" },
  { label: "Selesai", value: "Selesai" },
  { label: "Diambil", value: "Diambil" },
];

interface OrderClientProps {
  initialOrders: OrderItem[];
}

export default function OrderClient({ initialOrders }: OrderClientProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [activeFilter, setActiveFilter] = useState<StatusOrder | "Semua">("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmOrder, setConfirmOrder] = useState<OrderItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const filtered = orders.filter((o) => {
    if (activeFilter !== "Semua" && o.status !== activeFilter) return false;
    if (!deferredSearch.trim()) return true;
    const q = deferredSearch.toLowerCase().trim();
    const matchNomor = o.nomor_order.toLowerCase().includes(q);
    const matchNama = (o.pelanggan?.nama_pelanggan || "").toLowerCase().includes(q);
    const matchItem = (o.item_order || []).some((it) => it.nama_item.toLowerCase().includes(q));
    return matchNomor || matchNama || matchItem;
  });

  const counts: Record<StatusOrder | "Semua", number> = {
    Semua: orders.length,
    Antri: orders.filter((o) => o.status === "Antri").length,
    Dikerjakan: orders.filter((o) => o.status === "Dikerjakan").length,
    Selesai: orders.filter((o) => o.status === "Selesai").length,
    Diambil: orders.filter((o) => o.status === "Diambil").length,
  };

  const handleAdvance = async (order: OrderItem) => {
    if (order.status === "Selesai") {
      setConfirmOrder(order);
      return;
    }
    await doAdvance(order.id, order.status);
  };

  const doAdvance = async (orderId: string, currentStatus: StatusOrder) => {
    setUpdatingId(orderId);
    setErrorMessage(null);

    const nextStatus: Record<StatusOrder, StatusOrder | null> = {
      Antri: "Dikerjakan",
      Dikerjakan: "Selesai",
      Selesai: "Diambil",
      Diambil: null,
    };
    const next = nextStatus[currentStatus];
    if (!next) {
      setUpdatingId(null);
      return;
    }

    const res = await advanceOrderStatus(orderId);
    setUpdatingId(null);

    if (!res.success) {
      setErrorMessage(res.error || "Gagal mengubah status");
      return;
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: next,
              status_pembayaran: next === "Diambil" ? "Lunas" : o.status_pembayaran,
            }
          : o
      )
    );
    setActiveFilter(next);
    setToastMessage("Status berhasil diperbarui");
    startTransition(() => {
      router.refresh();
    });
  };

  const handleConfirmDiambil = async () => {
    if (!confirmOrder) return;
    const orderId = confirmOrder.id;
    await doAdvance(orderId, "Selesai");
    setConfirmOrder(null);
  };

  return (
    <>
      <ConfirmDialog
        isOpen={!!confirmOrder}
        title="Pesanan Sudah Diambil?"
        subtitle={confirmOrder ? `${confirmOrder.nomor_order} · ${confirmOrder.pelanggan?.nama_pelanggan ?? "?"}` : ""}
        description="Status akan berubah menjadi Diambil dan tidak bisa dikembalikan. Yakin pesanan ini sudah diambil pelanggan?"
        confirmLabel="Ya, Sudah Diambil"
        confirmColor="#6B8F71"
        confirmHoverColor="#5a7b5f"
        onConfirm={handleConfirmDiambil}
        onCancel={() => setConfirmOrder(null)}
        isLoading={confirmOrder ? updatingId === confirmOrder.id : false}
        position="bottom"
      />

      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
          duration={3000}
        />
      )}

      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
            Daftar Order
          </h2>
        </section>

        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
          <input
            id="order-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari order, pelanggan, atau barang..."
            className="w-full bg-white border border-gray-200/90 rounded-xl pl-9.5 pr-8 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#6B8F71] focus:ring-1 focus:ring-[#6B8F71]/30 shadow-2xs transition-all"
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

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.value;
            const count = counts[tab.value];
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveFilter(tab.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer select-none active:scale-95 ${
                  isActive
                    ? "bg-[#6B8F71] text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-[#6B8F71]/40"
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                    isActive ? "bg-white/30 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {errorMessage && (
          <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button type="button" onClick={() => setErrorMessage(null)} className="shrink-0 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center gap-3 py-16">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
              <Filter className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-sm font-bold text-gray-700">
              {searchQuery
                ? `Tidak ditemukan untuk "${deferredSearch}"`
                : activeFilter === "Semua"
                ? "Belum ada order"
                : `Tidak ada order "${activeFilter}"`}
            </p>
            <p className="text-xs text-gray-400 max-w-[250px] leading-relaxed">
              {searchQuery
                ? "Periksa kata kunci atau tekan silang untuk membatalkan pencarian."
                : activeFilter === "Semua"
                ? "Belum ada order tersimpan di database."
                : "Coba pilih filter status lainnya."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((order) => {
              const customerName = order.pelanggan?.nama_pelanggan ?? "Pelanggan";
              const avatarColors = getAvatarColors(customerName + order.id);
              const initials = getInitials(customerName);
              const deadline = formatDeadline(order.tanggal_deadline);
              const isUpdating = updatingId === order.id;
              const nextLabel: Record<StatusOrder, string | null> = {
                Antri: "Dikerjakan",
                Dikerjakan: "Selesai",
                Selesai: "Diambil",
                Diambil: null,
              };
              const canAdvance = order.status !== "Diambil";

              return (
                <div
                  key={order.id}
                  onClick={() => router.push(`/order/${order.id}`)}
                  className="bg-white rounded-2xl border border-gray-200/80 shadow-xs flex flex-col gap-3 p-4 transition-all hover:border-[#6B8F71]/60 hover:shadow-sm cursor-pointer group select-none active:scale-[0.99]"
                >
                  <div className="flex items-start gap-3">
                    <div
                      style={{ backgroundColor: avatarColors.bg, color: avatarColors.text }}
                      className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 select-none shadow-2xs"
                    >
                      {initials}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-gray-800 truncate group-hover:text-[#6B8F71] transition-colors">
                          {customerName}
                        </p>
                        <span className={`text-xs font-bold shrink-0 ${
                          deadline.status === "lewat" || deadline.status === "hari-h" || deadline.status === "mendesak"
                            ? "text-[#BA1A1A]"
                            : "text-[#465F86]"
                        }`}>
                          {deadline.label}
                        </span>
                      </div>

                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          {order.jenis_order}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium mt-0.5">
                        <span>{order.nomor_order}</span>
                        <span>•</span>
                        <span>{order.tanggal_deadline.slice(0, 10).split("-").reverse().join(" ")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <StatusBadge status={order.status} size="sm" />
                    <span className="text-sm font-bold text-gray-800">
                      {formatRupiah(order.total_harga)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-1">
                    {order.item_order.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">Tidak ada barang</p>
                    ) : (
                      order.item_order.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <ShoppingBag className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="text-xs text-gray-700 truncate">
                              {item.jumlah}× {item.nama_item}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 shrink-0 font-medium">
                            {formatRupiah(item.harga_item * item.jumlah)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="bg-[#EDF4FF] rounded-xl p-3 flex items-center justify-between border border-[#D0E4FF]/60">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-gray-600 font-medium leading-none">
                        Total Biaya
                      </span>
                      <span className="text-sm font-bold text-gray-900 mt-1">
                        {formatRupiah(order.total_harga)}
                      </span>
                    </div>

                    <div>
                      {order.status_pembayaran === "Lunas" ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold text-white bg-[#465F86] shadow-xs">
                          Sudah Lunas
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold text-white bg-[#BA1A1A] shadow-xs">
                          Belum Lunas
                        </span>
                      )}
                    </div>
                  </div>

                  {canAdvance && (
                    <button
                      type="button"
                      disabled={updatingId !== null}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdvance(order);
                      }}
                      className={`w-full min-h-[40px] px-3 py-2 rounded-xl font-medium text-xs text-white shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-1.5 cursor-pointer select-none disabled:opacity-60 ${
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
                        <>
                          <Loader2 className="w-4 h-4 animate-spin shrink-0 text-white" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4 shrink-0 stroke-[2.2]" />
                          <span>Lanjut ke: {nextLabel[order.status]}</span>
                        </>
                      )}
                    </button>
                  )}

                  {order.status === "Diambil" && (
                    <div className="w-full min-h-[38px] px-3 py-2 rounded-xl bg-[#6B8F71] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs select-none">
                      <PackageCheck className="w-4 h-4 text-white shrink-0 stroke-[2.2]" />
                      <span>Pesanan Sudah Diambil</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="h-4" />
      </div>
    </>
  );
}
