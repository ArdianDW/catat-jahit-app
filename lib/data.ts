import { createClient } from "@/lib/supabase/server";

export interface RingkasanBeranda {
  orderAktif: number;
  mendekatiDeadline: number;
  siapDiambil: number;
}

export type StatusOrder = "Antri" | "Dikerjakan" | "Selesai" | "Diambil";

export interface OrderItem {
  id: string;
  nomor_order: string;
  jenis_order: "Jahit Baru" | "Permak";
  tanggal_masuk: string;
  tanggal_deadline: string;
  total_harga: number;
  status: StatusOrder;
  status_pembayaran: "Belum Lunas" | "Lunas";
  catatan_model: string | null;
  pelanggan: {
    id: string;
    nama_pelanggan: string;
    no_hp: string;
  } | null;
  item_order: {
    id: string;
    nama_item: string;
    jumlah: number;
    harga_item: number;
  }[];
}

export type DeadlineOrderItem = OrderItem;

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

export async function getSemuaOrder(statusFilter?: StatusOrder): Promise<OrderItem[]> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("orders")
      .select(
        `
        id,
        nomor_order,
        jenis_order,
        tanggal_masuk,
        tanggal_deadline,
        total_harga,
        status,
        status_pembayaran,
        catatan_model,
        pelanggan:pelanggan_id ( id, nama_pelanggan, no_hp ),
        item_order ( id, nama_item, jumlah, harga_item )
      `
      )
      .order("tanggal_deadline", { ascending: true });

    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error getSemuaOrder:", error);
      return [];
    }
    return (data as unknown as OrderItem[]) ?? [];
  } catch (err) {
    console.error("Exception in getSemuaOrder:", err);
    return [];
  }
}

export interface OrderDetailItem {
  id: string;
  order_id: string;
  layanan_id: string | null;
  nama_item: string;
  jumlah: number;
  harga_item: number;
  ukuran_sumber: "pelanggan" | "lain" | "tanpa";
  ukuran_untuk: string | null;
  lingkar_dada: number | null;
  lingkar_pinggang: number | null;
  lingkar_pinggul: number | null;
  panjang_bahu: number | null;
  panjang_lengan: number | null;
  panjang_baju: number | null;
  panjang_celana: number | null;
  catatan_ukuran: string | null;
  layanan?: {
    id: string;
    nama_layanan: string;
  } | null;
}

export interface RiwayatStatusItem {
  id: string;
  order_id: string;
  status: StatusOrder;
  tanggal: string;
}

export interface OrderDetail {
  id: string;
  nomor_order: string;
  jenis_order: "Jahit Baru" | "Permak";
  tanggal_masuk: string;
  tanggal_deadline: string;
  total_harga: number;
  status: StatusOrder;
  status_pembayaran: "Belum Lunas" | "Lunas";
  catatan_model: string | null;
  created_at: string;
  updated_at: string;
  pelanggan: {
    id: string;
    nama_pelanggan: string;
    no_hp: string;
    alamat_singkat: string | null;
    lingkar_dada: number | null;
    lingkar_pinggang: number | null;
    lingkar_pinggul: number | null;
    panjang_bahu: number | null;
    panjang_lengan: number | null;
    panjang_baju: number | null;
    panjang_celana: number | null;
    catatan_ukuran: string | null;
    tanggal_terakhir_diukur: string | null;
  } | null;
  item_order: OrderDetailItem[];
  riwayat_status: RiwayatStatusItem[];
}

export async function getDetailOrder(orderId: string): Promise<OrderDetail | null> {
  try {
    const supabase = await createClient();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        nomor_order,
        jenis_order,
        tanggal_masuk,
        tanggal_deadline,
        total_harga,
        status,
        status_pembayaran,
        catatan_model,
        created_at,
        updated_at,
        pelanggan:pelanggan_id (
          id, nama_pelanggan, no_hp, alamat_singkat,
          lingkar_dada, lingkar_pinggang, lingkar_pinggul,
          panjang_bahu, panjang_lengan, panjang_baju, panjang_celana,
          catatan_ukuran, tanggal_terakhir_diukur
        ),
        item_order (
          id, order_id, layanan_id, nama_item, jumlah, harga_item,
          ukuran_sumber, ukuran_untuk,
          lingkar_dada, lingkar_pinggang, lingkar_pinggul,
          panjang_bahu, panjang_lengan, panjang_baju, panjang_celana,
          catatan_ukuran,
          layanan:layanan_id ( id, nama_layanan )
        ),
        riwayat_status (
          id, order_id, status, tanggal
        )
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Error getDetailOrder:", orderError);
      return null;
    }

    if (order.riwayat_status && Array.isArray(order.riwayat_status)) {
      (order.riwayat_status as RiwayatStatusItem[]).sort(
        (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
      );
    }

    return order as unknown as OrderDetail;
  } catch (err) {
    console.error("Exception in getDetailOrder:", err);
    return null;
  }
}

export interface PelangganOption {
  id: string;
  nama_pelanggan: string;
  no_hp: string;
  alamat_singkat: string | null;
  has_ukuran: boolean;
  lingkar_dada: number | null;
  lingkar_pinggang: number | null;
  lingkar_pinggul: number | null;
  panjang_bahu: number | null;
  panjang_lengan: number | null;
  panjang_baju: number | null;
  panjang_celana: number | null;
  catatan_ukuran: string | null;
}

export async function getPelangganOptions(): Promise<PelangganOption[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pelanggan")
      .select(`
        id,
        nama_pelanggan,
        no_hp,
        alamat_singkat,
        lingkar_dada,
        lingkar_pinggang,
        lingkar_pinggul,
        panjang_bahu,
        panjang_lengan,
        panjang_baju,
        panjang_celana,
        catatan_ukuran
      `)
      .order("nama_pelanggan", { ascending: true });

    if (error) {
      console.error("Error getPelangganOptions:", error);
      return [];
    }

    return (data || []).map((p) => {
      const has_ukuran = Boolean(
        p.lingkar_dada ||
        p.lingkar_pinggang ||
        p.lingkar_pinggul ||
        p.panjang_bahu ||
        p.panjang_lengan ||
        p.panjang_baju ||
        p.panjang_celana
      );
      return { ...p, has_ukuran };
    });
  } catch (err) {
    console.error("Exception in getPelangganOptions:", err);
    return [];
  }
}

export interface LayananOption {
  id: string;
  nama_layanan: string;
  harga_dasar: number;
  deskripsi: string | null;
  jenis: "Jahit" | "Permak";
  aktif: boolean;
}

export interface LayananItem {
  id: string;
  nama_layanan: string;
  harga_dasar: number;
  deskripsi: string | null;
  jenis: "Jahit" | "Permak";
  aktif: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function getSemuaLayanan(): Promise<LayananItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("layanan")
      .select("id, nama_layanan, harga_dasar, deskripsi, jenis, aktif, created_at, updated_at")
      .order("aktif", { ascending: false })
      .order("nama_layanan", { ascending: true });

    if (error) {
      console.error("Error getSemuaLayanan:", error);
      return [];
    }
    return (data as unknown as LayananItem[]) ?? [];
  } catch (err) {
    console.error("Exception in getSemuaLayanan:", err);
    return [];
  }
}

export async function getDetailLayanan(id: string): Promise<LayananItem | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("layanan")
      .select("id, nama_layanan, harga_dasar, deskripsi, jenis, aktif, created_at, updated_at")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }
    return data as unknown as LayananItem;
  } catch (err) {
    console.error("Exception in getDetailLayanan:", err);
    return null;
  }
}

export async function getLayananOptions(jenis?: "Jahit" | "Permak"): Promise<LayananOption[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("layanan")
      .select("id, nama_layanan, harga_dasar, deskripsi, jenis, aktif")
      .eq("aktif", true)
      .order("nama_layanan", { ascending: true });

    if (jenis) {
      query = query.eq("jenis", jenis);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error getLayananOptions:", error);
      return [];
    }
    return (data as unknown as LayananOption[]) ?? [];
  } catch (err) {
    console.error("Exception in getLayananOptions:", err);
    return [];
  }
}

export interface PelangganItem {
  id: string;
  nama_pelanggan: string;
  no_hp: string;
  alamat_singkat: string | null;
  lingkar_dada: number | null;
  lingkar_pinggang: number | null;
  lingkar_pinggul: number | null;
  panjang_bahu: number | null;
  panjang_lengan: number | null;
  panjang_baju: number | null;
  panjang_celana: number | null;
  catatan_ukuran: string | null;
  tanggal_terakhir_diukur: string | null;
  created_at: string;
  total_order?: number;
}

export async function getSemuaPelanggan(): Promise<PelangganItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pelanggan")
      .select(`
        id,
        nama_pelanggan,
        no_hp,
        alamat_singkat,
        lingkar_dada,
        lingkar_pinggang,
        lingkar_pinggul,
        panjang_bahu,
        panjang_lengan,
        panjang_baju,
        panjang_celana,
        catatan_ukuran,
        tanggal_terakhir_diukur,
        created_at
      `)
      .order("nama_pelanggan", { ascending: true });

    if (error) {
      console.error("Error getSemuaPelanggan:", error);
      return [];
    }
    return (data as unknown as PelangganItem[]) ?? [];
  } catch (err) {
    console.error("Exception in getSemuaPelanggan:", err);
    return [];
  }
}

export async function getDetailPelanggan(id: string): Promise<PelangganItem | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pelanggan")
      .select(`
        id,
        nama_pelanggan,
        no_hp,
        alamat_singkat,
        lingkar_dada,
        lingkar_pinggang,
        lingkar_pinggul,
        panjang_bahu,
        panjang_lengan,
        panjang_baju,
        panjang_celana,
        catatan_ukuran,
        tanggal_terakhir_diukur,
        created_at
      `)
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("Error getDetailPelanggan:", error);
      return null;
    }
    return data as unknown as PelangganItem;
  } catch (err) {
    console.error("Exception in getDetailPelanggan:", err);
    return null;
  }
}

export interface PelangganOrderItem {
  id: string;
  nomor_order: string;
  jenis_order: "Jahit Baru" | "Permak";
  tanggal_masuk: string;
  tanggal_deadline: string;
  total_harga: number;
  status: StatusOrder;
  status_pembayaran: "Belum Lunas" | "Lunas";
}

export async function getPesananPelanggan(pelangganId: string): Promise<PelangganOrderItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("id, nomor_order, jenis_order, tanggal_masuk, tanggal_deadline, total_harga, status, status_pembayaran")
      .eq("pelanggan_id", pelangganId)
      .order("tanggal_masuk", { ascending: false });

    if (error) {
      console.error("Error getPesananPelanggan:", error);
      return [];
    }
    return (data as unknown as PelangganOrderItem[]) ?? [];
  } catch (err) {
    console.error("Exception in getPesananPelanggan:", err);
    return [];
  }
}

