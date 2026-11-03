"use server";

import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { pelangganSchema } from "@/lib/validations/pelanggan";
import { sanitizeText } from "@/lib/utils/sanitize";
export type { PelangganInput as CreatePelangganInput } from "@/lib/validations/pelanggan";

export async function createPelanggan(rawInput: unknown) {
  try {
    const auth = await requireAuth();
    if (!auth.authenticated) {
      return { success: false, error: auth.error };
    }
    const supabase = auth.supabase;

    const parsed = pelangganSchema.safeParse(rawInput);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return { success: false, error: firstError?.message || "Data tidak valid." };
    }
    const input = parsed.data;

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
        nama_pelanggan: sanitizeText(input.nama_pelanggan),
        no_hp: input.no_hp.trim(),
        alamat_singkat: input.alamat_singkat ? sanitizeText(input.alamat_singkat) : null,
        lingkar_dada: input.lingkar_dada || null,
        lingkar_pinggang: input.lingkar_pinggang || null,
        lingkar_pinggul: input.lingkar_pinggul || null,
        panjang_bahu: input.panjang_bahu || null,
        panjang_lengan: input.panjang_lengan || null,
        panjang_baju: input.panjang_baju || null,
        panjang_celana: input.panjang_celana || null,
        catatan_ukuran: input.catatan_ukuran ? sanitizeText(input.catatan_ukuran) : null,
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

export async function updatePelanggan(id: string, rawInput: unknown) {
  try {
    const auth = await requireAuth();
    if (!auth.authenticated) {
      return { success: false, error: auth.error };
    }
    const supabase = auth.supabase;

    const parsed = pelangganSchema.safeParse(rawInput);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return { success: false, error: firstError?.message || "Data tidak valid." };
    }
    const input = parsed.data;

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
        nama_pelanggan: sanitizeText(input.nama_pelanggan),
        no_hp: input.no_hp.trim(),
        alamat_singkat: input.alamat_singkat ? sanitizeText(input.alamat_singkat) : null,
        lingkar_dada: input.lingkar_dada || null,
        lingkar_pinggang: input.lingkar_pinggang || null,
        lingkar_pinggul: input.lingkar_pinggul || null,
        panjang_bahu: input.panjang_bahu || null,
        panjang_lengan: input.panjang_lengan || null,
        panjang_baju: input.panjang_baju || null,
        panjang_celana: input.panjang_celana || null,
        catatan_ukuran: input.catatan_ukuran ? sanitizeText(input.catatan_ukuran) : null,
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
