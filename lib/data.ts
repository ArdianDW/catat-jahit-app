import { createClient } from "@/lib/supabase/server";

export async function getRingkasanBeranda(batasHari = 3) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("ringkasan_beranda", {
    p_batas_hari: batasHari,
  });
  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  return {
    orderAktif: Number(row?.order_aktif ?? 0),
    mendekatiDeadline: Number(row?.mendekati_deadline ?? 0),
    siapDiambil: Number(row?.siap_diambil ?? 0),
  };
}


export async function getOrderMendekatiDeadline(batasHari = 3) {
  const supabase = await createClient();
  const today = new Date();
  const batas = new Date(today);
  batas.setDate(batas.getDate() + batasHari);
  const batasStr = batas.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      nomor_order,
      tanggal_deadline,
      status,
      pelanggan:pelanggan_id ( id, nama_pelanggan )
    `
    )
    .neq("status", "Diambil")
    .lte("tanggal_deadline", batasStr)
    .order("tanggal_deadline", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function ubahStatusOrder(orderId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("ubah_status_order", {
    p_order_id: orderId,
  });
  if (error) throw new Error(error.message);
  return data;
}
