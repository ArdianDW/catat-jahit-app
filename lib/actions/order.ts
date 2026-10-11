"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";


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

export interface CreateOrderItemInput {
  layanan_id?: string | null;
  nama_item: string;
  jumlah: number;
  harga_item: number;
  ukuran_sumber: "pelanggan" | "lain" | "tanpa";
  ukuran_untuk?: string | null;
  lingkar_dada?: number | null;
  lingkar_pinggang?: number | null;
  lingkar_pinggul?: number | null;
  panjang_bahu?: number | null;
  panjang_lengan?: number | null;
  panjang_baju?: number | null;
  panjang_celana?: number | null;
  catatan_ukuran?: string | null;
}

export interface CreateOrderInput {
  pelanggan_id: string;
  jenis_order: "Jahit Baru" | "Permak";
  tanggal_deadline: string;
  total_harga: number;
  status_pembayaran: "Belum Lunas" | "Lunas";
  catatan_model?: string | null;
  items: CreateOrderItemInput[];
}

export async function createOrder(input: CreateOrderInput) {
  try {
    const supabase = await createClient();

    if (!input.pelanggan_id) {
      return { success: false, error: "Pelanggan harus dipilih" };
    }
    if (!input.items || input.items.length === 0) {
      return { success: false, error: "Minimal 1 barang harus dimasukkan" };
    }
    if (!input.tanggal_deadline) {
      return { success: false, error: "Tanggal deadline harus diisi" };
    }

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        pelanggan_id: input.pelanggan_id,
        jenis_order: input.jenis_order,
        tanggal_deadline: input.tanggal_deadline,
        total_harga: input.total_harga,
        status: "Antri",
        status_pembayaran: input.status_pembayaran,
        catatan_model: input.catatan_model?.trim() || null,
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
      nama_item: item.nama_item.trim(),
      jumlah: Math.max(1, item.jumlah),
      harga_item: Math.max(0, item.harga_item),
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
        item.ukuran_sumber === "lain" ? item.catatan_ukuran?.trim() || null : null,
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
