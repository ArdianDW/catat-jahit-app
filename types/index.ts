export type { OrderInput, UpdateOrderInput, OrderItemInput } from "@/lib/validations/order";
export type { PelangganInput } from "@/lib/validations/pelanggan";
export type { LayananInput } from "@/lib/validations/layanan";
export type { PushSubscriptionInput } from "@/lib/validations/push";

export type {
  RingkasanBeranda,
  StatusOrder,
  OrderItem,
  DeadlineOrderItem,
  OrderDetailItem,
  RiwayatStatusItem,
  OrderDetail,
  PelangganOption,
  LayananOption,
  LayananItem,
  PelangganItem,
  PelangganOrderItem,
} from "@/lib/data";

export type TStatusOrder = "Antri" | "Dikerjakan" | "Selesai" | "Diambil";

export type TJenisOrder = "Jahit Baru" | "Permak";

export type TStatusPembayaran = "Belum Lunas" | "Lunas";

export type TJenisLayanan = "Jahit" | "Permak";

export type TUkuranSumber = "pelanggan" | "lain" | "tanpa";

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

import type { OrderItemInput } from "@/lib/validations/order";
import type { LayananInput } from "@/lib/validations/layanan";
import type { PelangganInput } from "@/lib/validations/pelanggan";

export type CreateOrderItemInput = OrderItemInput;
export type CreateLayananInput = LayananInput;
export type CreatePelangganInput = PelangganInput;
