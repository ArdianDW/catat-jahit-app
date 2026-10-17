"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface CreateLayananInput {
  nama_layanan: string;
  harga_dasar: number;
  deskripsi?: string | null;
  jenis: "Jahit" | "Permak";
  aktif?: boolean;
}

export async function createLayanan(input: CreateLayananInput) {
  try {
    const supabase = await createClient();

    if (!input.nama_layanan?.trim()) {
      return { success: false, error: "Nama layanan harus diisi" };
    }
    if (
      input.harga_dasar === undefined ||
      input.harga_dasar === null ||
      isNaN(input.harga_dasar) ||
      input.harga_dasar < 0
    ) {
      return { success: false, error: "Harga dasar harus berupa angka minimal 0" };
    }
    if (input.jenis !== "Jahit" && input.jenis !== "Permak") {
      return { success: false, error: "Jenis layanan harus Jahit atau Permak" };
    }

    const { data, error } = await supabase
      .from("layanan")
      .insert({
        nama_layanan: input.nama_layanan.trim(),
        harga_dasar: Math.round(input.harga_dasar),
        deskripsi: input.deskripsi?.trim() || null,
        jenis: input.jenis,
        aktif: input.aktif !== undefined ? input.aktif : true,
      })
      .select("id, nama_layanan")
      .single();

    if (error || !data) {
      console.error("Error createLayanan:", error);
      return { success: false, error: error?.message || "Gagal menyimpan layanan" };
    }

    revalidatePath("/layanan");
    revalidatePath("/order/baru");

    return { success: true, id: data.id, nama: data.nama_layanan };
  } catch (err: unknown) {
    console.error("Exception in createLayanan:", err);
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem";
    return { success: false, error: message };
  }
}

export async function updateLayanan(id: string, input: CreateLayananInput) {
  try {
    const supabase = await createClient();

    if (!id) {
      return { success: false, error: "ID layanan tidak valid" };
    }
    if (!input.nama_layanan?.trim()) {
      return { success: false, error: "Nama layanan harus diisi" };
    }
    if (
      input.harga_dasar === undefined ||
      input.harga_dasar === null ||
      isNaN(input.harga_dasar) ||
      input.harga_dasar < 0
    ) {
      return { success: false, error: "Harga dasar harus berupa angka minimal 0" };
    }
    if (input.jenis !== "Jahit" && input.jenis !== "Permak") {
      return { success: false, error: "Jenis layanan harus Jahit atau Permak" };
    }

    const { error } = await supabase
      .from("layanan")
      .update({
        nama_layanan: input.nama_layanan.trim(),
        harga_dasar: Math.round(input.harga_dasar),
        deskripsi: input.deskripsi?.trim() || null,
        jenis: input.jenis,
        aktif: input.aktif !== undefined ? input.aktif : true,
      })
      .eq("id", id);

    if (error) {
      console.error("Error updateLayanan:", error);
      return { success: false, error: error?.message || "Gagal memperbarui layanan" };
    }

    revalidatePath("/layanan");
    revalidatePath(`/layanan/${id}/edit`);
    revalidatePath("/order/baru");

    return { success: true };
  } catch (err: unknown) {
    console.error("Exception in updateLayanan:", err);
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem";
    return { success: false, error: message };
  }
}

export async function toggleStatusLayanan(id: string, aktif: boolean) {
  try {
    const supabase = await createClient();

    if (!id) {
      return { success: false, error: "ID layanan tidak valid" };
    }

    const { error } = await supabase
      .from("layanan")
      .update({ aktif })
      .eq("id", id);

    if (error) {
      console.error("Error toggleStatusLayanan:", error);
      return { success: false, error: error?.message || "Gagal mengubah status layanan" };
    }

    revalidatePath("/layanan");
    revalidatePath(`/layanan/${id}/edit`);
    revalidatePath("/order/baru");

    return { success: true };
  } catch (err: unknown) {
    console.error("Exception in toggleStatusLayanan:", err);
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem";
    return { success: false, error: message };
  }
}

export async function seedContohLayanan() {
  try {
    const supabase = await createClient();

    const contohLayanan = [
      {
        nama_layanan: "Jahit Seragam SD",
        harga_dasar: 80000,
        deskripsi: "Jahit atasan & bawahan seragam SD standar sekolah",
        jenis: "Jahit" as const,
        aktif: true,
      },
      {
        nama_layanan: "Jahit Seragam SMP",
        harga_dasar: 90000,
        deskripsi: "Jahit atasan & celana/rok seragam SMP",
        jenis: "Jahit" as const,
        aktif: true,
      },
      {
        nama_layanan: "Jahit Gamis / Busana Muslim",
        harga_dasar: 120000,
        deskripsi: "Gamis wanita pola standar dengan resleting jepang",
        jenis: "Jahit" as const,
        aktif: true,
      },
      {
        nama_layanan: "Jahit Kemeja Pria",
        harga_dasar: 75000,
        deskripsi: "Kemeja pria lengan panjang atau pendek berkancing",
        jenis: "Jahit" as const,
        aktif: true,
      },
      {
        nama_layanan: "Permak Celana",
        harga_dasar: 15000,
        deskripsi: "Potong panjang atau kecilkan lingkar kaki celana",
        jenis: "Permak" as const,
        aktif: true,
      },
      {
        nama_layanan: "Permak Hijab",
        harga_dasar: 10000,
        deskripsi: "Jahit tepi rapi atau modifikasi bentuk hijab",
        jenis: "Permak" as const,
        aktif: true,
      },
      {
        nama_layanan: "Ganti Resleting Celana/Jaket",
        harga_dasar: 20000,
        deskripsi: "Ganti resleting rusak termasuk bahan resleting baru",
        jenis: "Permak" as const,
        aktif: true,
      },
      {
        nama_layanan: "Kecilkan Baju / Kemeja",
        harga_dasar: 25000,
        deskripsi: "Kecilkan lingkar dada, pinggang, atau lengan pakaian",
        jenis: "Permak" as const,
        aktif: true,
      },
    ];

    const { error } = await supabase.from("layanan").insert(contohLayanan);

    if (error) {
      console.error("Error seedContohLayanan:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/layanan");
    revalidatePath("/order/baru");

    return { success: true };
  } catch (err: unknown) {
    console.error("Exception in seedContohLayanan:", err);
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem";
    return { success: false, error: message };
  }
}
