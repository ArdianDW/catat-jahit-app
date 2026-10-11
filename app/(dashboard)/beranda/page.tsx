"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";

type OrderStatus = "Dikerjakan" | "Antri" | "Selesai";

interface DeadlineOrder {
  id: string;
  pelanggan: string;
  initials: string;
  avatarBg: string;
  avatarTextColor: string;
  namaBarang: string;
  sisaDeadline: string;
  deadlineDate: string;
  status: OrderStatus;
  statusTextColor: string;
}

// Data dummy 3 order mendekati deadline
const initialDeadlineOrders: DeadlineOrder[] = [
  {
    id: "1",
    pelanggan: "Ibu Sari",
    initials: "IS",
    avatarBg: "#DCF8C6",
    avatarTextColor: "#075E54",
    namaBarang: "Jahit Seragam Anak Sekolah",
    sisaDeadline: "besok",
    deadlineDate: "(30 okt)",
    status: "Dikerjakan",
    statusTextColor: "#BA1A1A",
  },
  {
    id: "2",
    pelanggan: "Ibu Dewi",
    initials: "ID",
    avatarBg: "#D0E4FF",
    avatarTextColor: "#004881",
    namaBarang: "Permak Celana Kerja",
    sisaDeadline: "2 hari lagi",
    deadlineDate: "(31 okt)",
    status: "Antri",
    statusTextColor: "#BA1A1A",
  },
  {
    id: "3",
    pelanggan: "Ibu Rina",
    initials: "IR",
    avatarBg: "#FFE0B2",
    avatarTextColor: "#E65100",
    namaBarang: "Jahit Baju Kondangan",
    sisaDeadline: "3 hari lagi",
    deadlineDate: "(1 nov)",
    status: "Dikerjakan",
    statusTextColor: "#805200",
  },
];

const emptySubscribe = () => () => {};

function getClientDate() {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BerandaPage() {
  const currentDate = useSyncExternalStore(
    emptySubscribe,
    getClientDate,
    () => ""
  );

  const [orders, setOrders] = useState<DeadlineOrder[]>(initialDeadlineOrders);

  // Aksi cepat untuk memajukan status order
  const handleAdvanceStatus = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        if (order.status === "Antri") {
          return { ...order, status: "Dikerjakan" };
        }
        if (order.status === "Dikerjakan") {
          return { ...order, status: "Selesai" };
        }
        return order;
      })
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Sapaan & Tanggal (Task 4 & Task 5) */}
      <section className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
          Halo, Bu Rusliyati!
        </h2>
        <div className="text-sm text-gray-500 font-medium min-h-[20px] flex items-center gap-1.5">
          {/* Icon Kalender */}
          <svg
            className="w-4 h-4 text-gray-500 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="3" y1="10" y2="10" />
          </svg>
          <span>{currentDate}</span>
        </div>
      </section>

      {/* 2. Tombol Aksi (Task 6) */}
      <section className="flex flex-col gap-3">
        <Link
          href="/order/baru"
          className="flex items-center justify-center gap-2 min-h-[48px] px-4 py-3 rounded-xl bg-[#6B8F71] hover:bg-[#5a7b5f] text-white font-medium text-sm shadow-sm transition-all active:scale-[0.98] cursor-pointer w-full"
        >
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Tambah Order</span>
        </Link>

        {/* Tombol Tambah Pelanggan dengan warna #465F86 */}
        <Link
          href="/pelanggan/baru"
          className="flex items-center justify-center gap-2 min-h-[48px] px-4 py-3 rounded-xl bg-[#465F86] hover:bg-[#384c6c] text-white font-medium text-sm shadow-sm transition-all active:scale-[0.98] cursor-pointer w-full"
        >
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18 7.5v6m3-3h-6m-1.5 7.5a6 6 0 11-12 0 6 6 0 0112 0zm-6-8.25a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z"
            />
          </svg>
          <span>Tambah Pelanggan</span>
        </Link>
      </section>

      {/* 3. Tiga Box Statistik — angka di atas, label tengah, sub-label bawah */}
      <section className="grid grid-cols-3 gap-2.5">
        {/* Box 1: Order Aktif */}
        <div className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-white border border-gray-100 shadow-xs min-h-[94px]">
          <span className="text-2xl font-bold leading-tight text-[#465F86]">
            12
          </span>
          <span className="text-xs font-bold text-gray-800 leading-tight mt-0.5">
            Order Aktif
          </span>
          <span className="text-[10px] font-medium text-gray-500 leading-tight mt-0.5">
            Antri &amp; Dikerjakan
          </span>
        </div>

        {/* Box 2: Mendekati Deadline */}
        <div className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-[#FFDAD6] border border-[#FFDAD6] shadow-xs min-h-[94px]">
          <span className="text-2xl font-bold leading-tight text-[#93000A]">
            3
          </span>
          <span className="text-xs font-bold text-[#93000A] leading-tight mt-0.5">
            Mendekati Deadline
          </span>
          <span className="text-[10px] font-medium text-[#93000A] leading-tight mt-0.5">
            &lt; 3 hari
          </span>
        </div>

        {/* Box 3: Siap Diambil */}
        <div className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-white border border-gray-100 shadow-xs min-h-[94px]">
          <span className="text-2xl font-bold leading-tight text-[#6B8F71]">
            5
          </span>
          <span className="text-xs font-bold text-gray-800 leading-tight mt-0.5">
            Siap Diambil
          </span>
          <span className="text-[10px] font-medium text-gray-500 leading-tight mt-0.5">
            Selesai
          </span>
        </div>
      </section>

      {/* 4. Seksi Order Mendekati Deadline (Task 8 & Task 9) */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Icon Jam Alarm Merah */}
            <svg
              className="w-5 h-5 text-red-600 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="13" r="8" />
              <path d="M12 9v4l2 2" />
              <path d="M5 3L2 6" />
              <path d="M22 6l-3-3" />
              <path d="M6.38 18.7 4 21" />
              <path d="M17.64 18.67 20 21" />
            </svg>
            <h3 className="text-lg font-extrabold text-gray-800 tracking-tight">
              Order Mendekati Deadline
            </h3>
          </div>
          <span className="text-xs font-semibold text-[#93000A] bg-[#FFDAD6] px-2.5 py-1 rounded-full border border-[#FFDAD6]">
            3 pesanan
          </span>
        </div>

        {/* List 3 Order Mendekati Deadline */}
        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            return (
              <div
                key={order.id}
                className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs flex flex-col gap-3.5 transition-all hover:border-[#6B8F71]/60"
              >
                {/* Baris Atas: Avatar + Informasi + Status */}
                <div className="flex items-start gap-3">
                  {/* Avatar WhatsApp-style: Lingkaran + Inisial */}
                  <div
                    style={{
                      backgroundColor: order.avatarBg,
                      color: order.avatarTextColor,
                    }}
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0 select-none shadow-xs"
                  >
                    {order.initials}
                  </div>

                  {/* Detail Info Pelanggan, Barang & Deadline */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {order.pelanggan}
                      </p>

                      {/* Status Badge dengan Icon — warna icon terpisah dari warna teks */}
                      <div className="flex items-center gap-1 text-xs font-bold shrink-0">
                        {order.status === "Dikerjakan" && (
                          /* Icon Centang 2 — warna tetap #6B8F71 */
                          <svg
                            className="w-4 h-4 shrink-0"
                            style={{ color: "#6B8F71" }}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            viewBox="0 0 24 24"
                          >
                            <path d="M18 6L7 17l-5-5" />
                            <path d="M22 10l-7.5 7.5-1.5-1.5" />
                          </svg>
                        )}
                        {order.status === "Antri" && (
                          /* Icon Jam — warna tetap #727971 */
                          <svg
                            className="w-3.5 h-3.5 shrink-0"
                            style={{ color: "#727971" }}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            viewBox="0 0 24 24"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                        )}
                        {order.status === "Selesai" && (
                          /* Icon Centang Selesai */
                          <svg
                            className="w-3.5 h-3.5 shrink-0"
                            style={{ color: "#6B8F71" }}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            viewBox="0 0 24 24"
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        )}
                        <span style={{ color: order.statusTextColor }}>{order.status}</span>
                      </div>
                    </div>

                    {/* Nama Barang - Sisa Deadline */}
                    <p className="text-xs text-gray-600 mt-1 font-medium truncate">
                      {order.namaBarang} - {order.sisaDeadline}
                    </p>

                    {/* Tanggal Deadline */}
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {order.deadlineDate}
                    </p>
                  </div>
                </div>

                {/* Tombol Cepat Ubah Status Selebar Box Order */}
                {order.status === "Dikerjakan" && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceStatus(order.id)}
                    className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-[#6B8F71] hover:bg-[#5a7b5f] text-white font-medium text-xs shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {/* Icon Centang di Dalam Lingkaran */}
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <span>Lanjut ke: Selesai</span>
                  </button>
                )}

                {order.status === "Antri" && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceStatus(order.id)}
                    className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-[#465F86] hover:bg-[#384c6c] text-white font-medium text-xs shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {/* Icon Play di Dalam Lingkaran */}
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
                    </svg>
                    <span>Lanjut ke: Dikerjakan</span>
                  </button>
                )}

                {order.status === "Selesai" && (
                  <div className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-medium text-xs flex items-center justify-center gap-1.5 border border-emerald-100 select-none">
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <span>Pesanan Telah Selesai</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
