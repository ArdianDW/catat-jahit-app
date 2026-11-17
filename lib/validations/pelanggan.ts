import { z } from "zod";

const PHONE_REGEX = /^(\+62|62|08)[0-9]{8,13}$/;

const ukuranCm = z
  .number()
  .min(1, "Ukuran minimal 1 cm")
  .max(300, "Ukuran maksimal 300 cm")
  .nullable()
  .optional();

export const pelangganSchema = z.object({
  nama_pelanggan: z
    .string()
    .min(2, "Nama pelanggan minimal 2 karakter")
    .max(100, "Nama pelanggan maksimal 100 karakter"),

  no_hp: z
    .string()
    .regex(PHONE_REGEX, "Nomor HP tidak valid (contoh: 0812xxxxxxxx atau +6281xxxxxxxx)"),

  alamat_singkat: z
    .string()
    .max(255, "Alamat maksimal 255 karakter")
    .nullable()
    .optional(),

  lingkar_dada: ukuranCm,
  lingkar_pinggang: ukuranCm,
  lingkar_pinggul: ukuranCm,
  panjang_bahu: ukuranCm,
  panjang_lengan: ukuranCm,
  panjang_baju: ukuranCm,
  panjang_celana: ukuranCm,

  catatan_ukuran: z
    .string()
    .max(500, "Catatan ukuran maksimal 500 karakter")
    .nullable()
    .optional(),
});

export type PelangganInput = z.infer<typeof pelangganSchema>;
