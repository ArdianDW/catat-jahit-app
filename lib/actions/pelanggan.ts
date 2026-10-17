"use server";

import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface CreatePelangganInput {
  nama_pelanggan: string;
  no_hp: string;
  alamat_singkat?: string | null;
  lingkar_dada?: number | null;
  lingkar_pinggang?: number | null;
  lingkar_pinggul?: number | null;
  panjang_bahu?: number | null;
  panjang_lengan?: number | null;
  panjang_baju?: number | null;
  panjang_celana?: number | null;
  catatan_ukuran?: string | null;
}

export async function createPelanggan(input: CreatePelangganInput) {
  try {
    const auth = await requireAuth();
    if (!auth.authenticated) {
      return { success: false, error: auth.error };
    }
    const supabase = auth.supabase;

    if (!input.nama_pelanggan?.trim()) {
      return { success: false, error: "Nama pelanggan harus diisi" };
    }
    if (!input.no_hp?.trim()) {
      return { success: false, error: "Nomor HP harus diisi" };
    }

    const hasUkuran = Boolean(
      input.lingkar_dada ||
      input.lingkar_pinggang ||
      input.lingkar_pinggul ||
      input.panjang_bahu ||
      input.panjang_lengan ||
      input.panjang_baju ||
      input.panjang_celana
    );

    const { data, error } = await supabase
      .from("pelanggan")
      .insert({
        nama_pelanggan: input.nama_pelanggan.trim(),
        no_hp: input.no_hp.trim(),
        alamat_singkat: input.alamat_singkat?.trim() || null,
        lingkar_dada: input.lingkar_dada || null,
        lingkar_pinggang: input.lingkar_pinggang || null,
        lingkar_pinggul: input.lingkar_pinggul || null,
        panjang_bahu: input.panjang_bahu || null,
        panjang_lengan: input.panjang_lengan || null,
        panjang_baju: input.panjang_baju || null,
        panjang_celana: input.panjang_celana || null,
        catatan_ukuran: input.catatan_ukuran?.trim() || null,
        tanggal_terakhir_diukur: hasUkuran ? new Date().toISOString().slice(0, 10) : null,
      })
      .select("id, nama_pelanggan")
      .single();

    if (error || !data) {
      console.error("Error createPelanggan:", error);
      return { success: false, error: error?.message || "Gagal menyimpan pelanggan" };
    }

    revalidatePath("/pelanggan");
    revalidatePath("/order/baru");

    return { success: true, id: data.id, nama: data.nama_pelanggan };
  } catch (err: unknown) {
    console.error("Exception in createPelanggan:", err);
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem";
    return { success: false, error: message };
  }
}

export async function updatePelanggan(id: string, input: CreatePelangganInput) {
  try {
    const auth = await requireAuth();
    if (!auth.authenticated) {
      return { success: false, error: auth.error };
    }
    const supabase = auth.supabase;

    if (!input.nama_pelanggan?.trim()) {
      return { success: false, error: "Nama pelanggan harus diisi" };
    }
    if (!input.no_hp?.trim()) {
      return { success: false, error: "Nomor HP harus diisi" };
    }

    const hasUkuran =
      input.lingkar_dada ||
      input.lingkar_pinggang ||
      input.lingkar_pinggul ||
      input.panjang_bahu ||
      input.panjang_lengan ||
      input.panjang_baju ||
      input.panjang_celana;

    const { error } = await supabase
      .from("pelanggan")
      .update({
        nama_pelanggan: input.nama_pelanggan.trim(),
        no_hp: input.no_hp.trim(),
        alamat_singkat: input.alamat_singkat?.trim() || null,
        lingkar_dada: input.lingkar_dada || null,
        lingkar_pinggang: input.lingkar_pinggang || null,
        lingkar_pinggul: input.lingkar_pinggul || null,
        panjang_bahu: input.panjang_bahu || null,
        panjang_lengan: input.panjang_lengan || null,
        panjang_baju: input.panjang_baju || null,
        panjang_celana: input.panjang_celana || null,
        catatan_ukuran: input.catatan_ukuran?.trim() || null,
        tanggal_terakhir_diukur: hasUkuran ? new Date().toISOString().slice(0, 10) : null,
      })
      .eq("id", id);

    if (error) {
      console.error("Error updatePelanggan:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/pelanggan");
    revalidatePath(`/pelanggan/${id}`);
    revalidatePath("/order/baru");

    return { success: true };
  } catch (err: unknown) {
    console.error("Exception in updatePelanggan:", err);
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem";
    return { success: false, error: message };
  }
}

export async function deletePelanggan(id: string) {
  try {
    const auth = await requireAuth();
    if (!auth.authenticated) {
      return { success: false, error: auth.error };
    }
    const supabase = auth.supabase;

    const { count, error: countError } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("pelanggan_id", id);

    if (countError) {
      console.error("Error checking customer orders:", countError);
    }

    if (count && count > 0) {
      return {
        success: false,
        error: `Pelanggan tidak dapat dihapus karena masih memiliki ${count} riwayat pesanan.`,
      };
    }

    const { error } = await supabase
      .from("pelanggan")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deletePelanggan:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/pelanggan");
    revalidatePath("/order/baru");

    return { success: true };
  } catch (err: unknown) {
    console.error("Exception in deletePelanggan:", err);
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem";
    return { success: false, error: message };
  }
}
