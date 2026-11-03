import { z } from "zod";

export const orderItemSchema = z.object({
  layanan_id: z.string().uuid("ID layanan tidak valid").nullable().optional(),

  nama_item: z
    .string()
    .min(1, "Nama barang wajib diisi")
    .max(100, "Nama barang maksimal 100 karakter"),

  jumlah: z
    .number()
    .int("Jumlah harus bilangan bulat")
    .min(1, "Jumlah minimal 1"),

  harga_item: z
    .number()
    .int("Harga harus bilangan bulat")
    .min(0, "Harga tidak boleh negatif"),

  ukuran_sumber: z.enum(["pelanggan", "lain", "tanpa"]),

  ukuran_untuk: z.string().max(100, "Nama maksimal 100 karakter").nullable().optional(),

  lingkar_dada: z.number().min(0).max(300).nullable().optional(),
  lingkar_pinggang: z.number().min(0).max(300).nullable().optional(),
  lingkar_pinggul: z.number().min(0).max(300).nullable().optional(),
  panjang_bahu: z.number().min(0).max(300).nullable().optional(),
  panjang_lengan: z.number().min(0).max(300).nullable().optional(),
  panjang_baju: z.number().min(0).max(300).nullable().optional(),
  panjang_celana: z.number().min(0).max(300).nullable().optional(),

  catatan_ukuran: z.string().max(500, "Catatan ukuran maksimal 500 karakter").nullable().optional(),
});

export const orderSchema = z.object({
  pelanggan_id: z.string().uuid("ID pelanggan tidak valid"),

  jenis_order: z.enum(["Jahit Baru", "Permak"]),

  tanggal_deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD")
    .refine((val) => !isNaN(Date.parse(val)), "Tanggal tidak valid"),

  total_harga: z
    .number()
    .int("Total harga harus bilangan bulat")
    .min(0, "Total harga tidak boleh negatif"),

  status_pembayaran: z.enum(["Belum Lunas", "Lunas"]),

  catatan_model: z.string().max(1000, "Catatan model maksimal 1000 karakter").nullable().optional(),

  items: z
    .array(orderItemSchema)
    .min(1, "Minimal 1 barang harus dimasukkan"),
});

export const updateOrderSchema = orderSchema.omit({ pelanggan_id: true });

export type OrderInput = z.infer<typeof orderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
