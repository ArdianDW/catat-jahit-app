"use server";

import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { orderSchema, updateOrderSchema } from "@/lib/validations/order";
import { sanitizeText } from "@/lib/utils/sanitize";
export type { OrderItemInput as CreateOrderItemInput } from "@/lib/validations/order";

export async function advanceOrderStatus(orderId: string) {
  try {
    const auth = await requireAuth();
    if (!auth.authenticated) {
      return { success: false, error: auth.error };
    }
    const supabase = auth.supabase;

    const { data, error } = await supabase.rpc("ubah_status_order", {
      p_order_id: orderId,
    });

    if (error) {
      console.error("Error in advanceOrderStatus:", error);
      return { success: false, error: error.message };
    }

    const { data: orderData } = await supabase
      .from("orders")
      .select("status, status_pembayaran")
      .eq("id", orderId)
      .single();

    if (orderData?.status === "Diambil" && orderData.status_pembayaran !== "Lunas") {
      const { error: payError } = await supabase
        .from("orders")
        .update({ status_pembayaran: "Lunas" })
        .eq("id", orderId);

      if (payError) {
        console.error("Error updating status_pembayaran to Lunas:", payError);
      }
    }

    revalidatePath("/beranda");
    revalidatePath("/order");
    revalidatePath(`/order/${orderId}`);
    return { success: true, data };
  } catch (err: unknown) {
    console.error("Exception in advanceOrderStatus:", err);
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem";
    return { success: false, error: message };
  }
}

export async function createOrder(rawInput: unknown) {
  try {
    const auth = await requireAuth();
    if (!auth.authenticated) {
      return { success: false, error: auth.error };
    }
    const supabase = auth.supabase;

    const parsed = orderSchema.safeParse(rawInput);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return { success: false, error: firstError?.message || "Data tidak valid." };
    }
    const input = parsed.data;

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        pelanggan_id: input.pelanggan_id,
        jenis_order: input.jenis_order,
        tanggal_deadline: input.tanggal_deadline,
        total_harga: input.total_harga,
        status: "Antri",
        status_pembayaran: input.status_pembayaran,
        catatan_model: input.catatan_model ? sanitizeText(input.catatan_model) : null,
      })
      .select("id, nomor_order")
      .single();

    if (orderError || !orderData) {
      console.error("Error creating order:", orderError);
      return { success: false, error: orderError?.message || "Gagal membuat order" };
    }

    const itemsToInsert = input.items.map((item) => ({
      order_id: orderData.id,
      layanan_id: item.layanan_id || null,
      nama_item: sanitizeText(item.nama_item),
      jumlah: item.jumlah,
      harga_item: item.harga_item,
      ukuran_sumber: item.ukuran_sumber,
      ukuran_untuk:
        item.ukuran_sumber === "lain" ? item.ukuran_untuk?.trim() || null : null,
      lingkar_dada:
        item.ukuran_sumber === "lain" ? item.lingkar_dada || null : null,
      lingkar_pinggang:
        item.ukuran_sumber === "lain" ? item.lingkar_pinggang || null : null,
      lingkar_pinggul:
        item.ukuran_sumber === "lain" ? item.lingkar_pinggul || null : null,
      panjang_bahu:
        item.ukuran_sumber === "lain" ? item.panjang_bahu || null : null,
      panjang_lengan:
        item.ukuran_sumber === "lain" ? item.panjang_lengan || null : null,
      panjang_baju:
        item.ukuran_sumber === "lain" ? item.panjang_baju || null : null,
      panjang_celana:
        item.ukuran_sumber === "lain" ? item.panjang_celana || null : null,
      catatan_ukuran:
        item.ukuran_sumber === "lain"
          ? item.catatan_ukuran
            ? sanitizeText(item.catatan_ukuran)
            : null
          : null,
    }));

    const { error: itemsError } = await supabase
      .from("item_order")
      .insert(itemsToInsert);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      await supabase.from("orders").delete().eq("id", orderData.id);
      return { success: false, error: itemsError.message };
    }

    revalidatePath("/beranda");
    revalidatePath("/order");

    return {
      success: true,
      orderId: orderData.id,
      nomorOrder: orderData.nomor_order,
    };
  } catch (err: unknown) {
    console.error("Exception in createOrder:", err);
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem";
    return { success: false, error: message };
  }
}

export async function updateOrder(orderId: string, rawInput: unknown) {
  try {
    const auth = await requireAuth();
    if (!auth.authenticated) {
      return { success: false, error: auth.error };
    }
    const supabase = auth.supabase;

    const parsed = updateOrderSchema.safeParse(rawInput);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return { success: false, error: firstError?.message || "Data tidak valid." };
    }
    const input = parsed.data;

    const { error: orderError } = await supabase
      .from("orders")
      .update({
        jenis_order: input.jenis_order,
        tanggal_deadline: input.tanggal_deadline,
        total_harga: input.total_harga,
        catatan_model: input.catatan_model ? sanitizeText(input.catatan_model) : null,
      })
      .eq("id", orderId);

    if (orderError) {
      console.error("Error updateOrder:", orderError);
      return { success: false, error: orderError.message };
    }

    if (input.items) {
      const { error: delError } = await supabase
        .from("item_order")
        .delete()
        .eq("order_id", orderId);

      if (delError) {
        console.error("Error deleting old order items:", delError);
        return { success: false, error: delError.message };
      }

      const itemsToInsert = input.items.map((item) => ({
        order_id: orderId,
        layanan_id: item.layanan_id || null,
        nama_item: sanitizeText(item.nama_item),
        jumlah: item.jumlah,
        harga_item: item.harga_item,
        ukuran_sumber: item.ukuran_sumber,
        ukuran_untuk:
          item.ukuran_sumber === "lain" ? item.ukuran_untuk?.trim() || null : null,
        lingkar_dada:
          item.ukuran_sumber === "lain" ? item.lingkar_dada || null : null,
        lingkar_pinggang:
          item.ukuran_sumber === "lain" ? item.lingkar_pinggang || null : null,
        lingkar_pinggul:
          item.ukuran_sumber === "lain" ? item.lingkar_pinggul || null : null,
        panjang_bahu:
          item.ukuran_sumber === "lain" ? item.panjang_bahu || null : null,
        panjang_lengan:
          item.ukuran_sumber === "lain" ? item.panjang_lengan || null : null,
        panjang_baju:
          item.ukuran_sumber === "lain" ? item.panjang_baju || null : null,
        panjang_celana:
          item.ukuran_sumber === "lain" ? item.panjang_celana || null : null,
        catatan_ukuran:
          item.ukuran_sumber === "lain"
            ? item.catatan_ukuran
              ? sanitizeText(item.catatan_ukuran)
              : null
            : null,
      }));

      const { error: insertError } = await supabase
        .from("item_order")
        .insert(itemsToInsert);

      if (insertError) {
        console.error("Error inserting updated order items:", insertError);
        return { success: false, error: insertError.message };
      }
    }

    revalidatePath("/beranda");
    revalidatePath("/order");
    revalidatePath(`/order/${orderId}`);

    return { success: true };
  } catch (err: unknown) {
    console.error("Exception in updateOrder:", err);
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem";
    return { success: false, error: message };
  }
}
