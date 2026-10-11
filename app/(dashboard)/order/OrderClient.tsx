"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  Scissors,
  CheckCircle2,
  PackageCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  X,
  Check,
  CreditCard,
  Banknote,
  Calendar,
  Filter,
  ShoppingBag,
  Search,
  ChevronRight,
} from "lucide-react";
import type { OrderItem, StatusOrder } from "@/lib/data";
import { advanceOrderStatus } from "@/lib/actions/order";

const FILTER_TABS: { label: string; value: StatusOrder | "Semua" }[] = [
  { label: "Semua", value: "Semua" },
  { label: "Antri", value: "Antri" },
  { label: "Dikerjakan", value: "Dikerjakan" },
  { label: "Selesai", value: "Selesai" },
  { label: "Diambil", value: "Diambil" },
];

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

function formatDeadline(deadlineStr: string) {
  if (!deadlineStr) return { label: "-", sisa: "-", urgent: false };
  const [year, month, day] = deadlineStr.slice(0, 10).split("-").map(Number);
  const deadlineDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const label = `${day} ${MONTHS[month - 1]} ${year}`;

  let sisa = "";
  let urgent = false;
  if (diffDays < 0) { sisa = `Lewat ${Math.abs(diffDays)} hari`; urgent = true; }
  else if (diffDays === 0) { sisa = "Hari ini"; urgent = true; }
  else if (diffDays === 1) { sisa = "Besok"; urgent = true; }
  else if (diffDays <= 3) { sisa = `${diffDays} hari lagi`; urgent = true; }
  else { sisa = `${diffDays} hari lagi`; }

  return { label, sisa, urgent };
}

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function StatusBadge({ status }: { status: StatusOrder }) {
  const map: Record<StatusOrder, { icon: React.ReactNode; label: string; cls: string }> = {
    Antri: { icon: <Clock className="w-3.5 h-3.5" />, label: "Antri", cls: "bg-[#BA1A1A] text-white" },
    Dikerjakan: { icon: <Scissors className="w-3.5 h-3.5" />, label: "Dikerjakan", cls: "bg-[#424842] text-white" },
    Selesai: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: "Selesai", cls: "bg-[#465F86] text-white" },
    Diambil: { icon: <PackageCheck className="w-3.5 h-3.5" />, label: "Diambil", cls: "bg-[#6B8F71] text-white" },
  };
  const item = map[status] || { icon: null, label: status, cls: "bg-[#BA1A1A] text-white" };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-2xs ${item.cls}`}>
      {item.icon}{item.label}
    </span>
  );
}

interface OrderClientProps {
  initialOrders: OrderItem[];
}

function KonfirmasiDiambilDialog({
  order,
  onConfirm,
  onCancel,
  isLoading,
}: {
  order: OrderItem;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 flex flex-col gap-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#E8EFEA] flex items-center justify-center shrink-0">
            <PackageCheck className="w-5 h-5 text-[#6B8F71]" />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">Pesanan Sudah Diambil?</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {order.nomor_order} · {order.pelanggan?.nama_pelanggan ?? "?"}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">
          Status akan berubah menjadi <span className="font-bold text-[#6B8F71]">Diambil</span> dan tidak bisa dikembalikan. Yakin pesanan ini sudah diambil pelanggan?
        </p>

        <div className="flex gap-2.5 mt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 min-h-[44px] rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer select-none disabled:opacity-50"
          >
            Belum
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 min-h-[44px] rounded-xl bg-[#6B8F71] hover:bg-[#5a7b5f] text-white font-bold text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer select-none disabled:opacity-50"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /><span>Menyimpan...</span></>
            ) : (
              <><Check className="w-4 h-4" /><span>Ya, Sudah Diambil</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrderClient({ initialOrders }: OrderClientProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [activeFilter, setActiveFilter] = useState<StatusOrder | "Semua">("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmOrder, setConfirmOrder] = useState<OrderItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = orders.filter((o) => {
    if (activeFilter !== "Semua" && o.status !== activeFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
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
    if (!next) { setUpdatingId(null); return; }

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

    const res = await advanceOrderStatus(orderId);
    setUpdatingId(null);

    if (!res.success) {
      setErrorMessage(res.error || "Gagal mengubah status");
      setOrders(initialOrders);
      return;
    }

    startTransition(() => { router.refresh(); });
  };

  const handleConfirmDiambil = async () => {
    if (!confirmOrder) return;
    const orderId = confirmOrder.id;
    setConfirmOrder(null);
    await doAdvance(orderId, "Selesai");
  };

  return (
    <>
      {confirmOrder && (
        <KonfirmasiDiambilDialog
          order={confirmOrder}
          onConfirm={handleConfirmDiambil}
          onCancel={() => setConfirmOrder(null)}
          isLoading={updatingId === confirmOrder.id}
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
                ? `Tidak ditemukan untuk "${searchQuery}"`
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
              const initials = getInitials(customerName);
              const avatarColor = getAvatarColors(customerName + order.id);
              const { label: deadlineLabel, sisa, urgent } = formatDeadline(order.tanggal_deadline);
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
                      style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}
                      className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 select-none shadow-2xs"
                    >
                      {initials}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-gray-800 truncate group-hover:text-[#6B8F71] transition-colors">
                          {customerName}
                        </p>
                        <span className={`text-xs font-bold shrink-0 ${urgent ? "text-[#BA1A1A]" : "text-[#465F86]"}`}>
                          {sisa}
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
                        <span>{deadlineLabel}</span>
                      </div>
                    </div>
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
                      disabled={isUpdating}
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
                        <><Loader2 className="w-4 h-4 animate-spin shrink-0" /><span>Menyimpan...</span></>
                      ) : (
                        <><ArrowRight className="w-4 h-4 shrink-0 stroke-[2.2]" /><span>Lanjut ke: {nextLabel[order.status]}</span></>
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
