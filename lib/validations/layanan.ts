import { z } from "zod";

export const layananSchema = z.object({
  nama_layanan: z
    .string()
    .min(2, "Nama layanan minimal 2 karakter")
    .max(100, "Nama layanan maksimal 100 karakter"),

  harga_dasar: z
    .number()
    .int("Harga dasar harus bilangan bulat")
    .min(0, "Harga dasar tidak boleh negatif")
    .max(10_000_000, "Harga dasar maksimal Rp 10.000.000"),

  jenis: z.enum(["Jahit", "Permak"]),

  deskripsi: z
    .string()
    .max(500, "Deskripsi maksimal 500 karakter")
    .nullable()
    .optional(),

  aktif: z.boolean().optional(),
});

export type LayananInput = z.infer<typeof layananSchema>;
