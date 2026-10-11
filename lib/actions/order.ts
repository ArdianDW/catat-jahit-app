"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Server Action untuk memajukan status pesanan:
 * Antri -> Dikerjakan -> Selesai -> Diambil
 * Memanggil RPC Supabase `ubah_status_order` yang mencatat ke riwayat_status.
 */
export async function advanceOrderStatus(orderId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("ubah_status_order", {
      p_order_id: orderId,
    });

    if (error) {
      console.error("Error in advanceOrderStatus:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/beranda");
    revalidatePath("/order");
    return { success: true, data };
  } catch (err: unknown) {
    console.error("Exception in advanceOrderStatus:", err);
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem";
    return { success: false, error: message };
  }
}
