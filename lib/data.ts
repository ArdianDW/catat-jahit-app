import { createClient } from "@/lib/supabase/server";

export interface RingkasanBeranda {
  orderAktif: number;
  mendekatiDeadline: number;
  siapDiambil: number;
}

export interface DeadlineOrderItem {
  id: string;
  nomor_order: string;
  jenis_order: "Jahit Baru" | "Permak";
  tanggal_deadline: string;
  status: "Antri" | "Dikerjakan" | "Selesai" | "Diambil";
  total_harga: number;
  pelanggan: {
    id: string;
    nama_pelanggan: string;
    no_hp?: string;
  } | null;
  item_order: {
    id: string;
    nama_item: string;
    jumlah: number;
  }[];
}

export async function getRingkasanBeranda(batasHari = 3): Promise<RingkasanBeranda> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("ringkasan_beranda", {
      p_batas_hari: batasHari,
    });
    if (error) {
      console.error("Error getRingkasanBeranda:", error);
      return { orderAktif: 0, mendekatiDeadline: 0, siapDiambil: 0 };
    }
    const row = Array.isArray(data) ? data[0] : data;
    return {
      orderAktif: Number(row?.order_aktif ?? 0),
      mendekatiDeadline: Number(row?.mendekati_deadline ?? 0),
      siapDiambil: Number(row?.siap_diambil ?? 0),
    };
  } catch (err) {
    console.error("Exception in getRingkasanBeranda:", err);
    return { orderAktif: 0, mendekatiDeadline: 0, siapDiambil: 0 };
  }
}

export async function getOrderMendekatiDeadline(batasHari = 3): Promise<DeadlineOrderItem[]> {
  try {
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
        jenis_order,
        tanggal_deadline,
        status,
        total_harga,
        pelanggan:pelanggan_id ( id, nama_pelanggan, no_hp ),
        item_order ( id, nama_item, jumlah )
      `
      )
      .neq("status", "Diambil")
      .lte("tanggal_deadline", batasStr)
      .order("tanggal_deadline", { ascending: true });

    if (error) {
      console.error("Error getOrderMendekatiDeadline:", error);
      return [];
    }
    return (data as unknown as DeadlineOrderItem[]) ?? [];
  } catch (err) {
    console.error("Exception in getOrderMendekatiDeadline:", err);
    return [];
  }
}


export async function ubahStatusOrder(orderId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("ubah_status_order", {
    p_order_id: orderId,
  });
  if (error) throw new Error(error.message);
  return data;
}
