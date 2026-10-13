import { notFound } from "next/navigation";
import { getDetailPelanggan, getPesananPelanggan } from "@/lib/data";
import ProfilPelangganClient from "./ProfilPelangganClient";

export const dynamic = "force-dynamic";

interface DetailPelangganPageProps {
  params: Promise<{ id: string }>;
}

export default async function DetailPelangganPage({ params }: DetailPelangganPageProps) {
  const { id } = await params;
  const [pelanggan, riwayatOrder] = await Promise.all([
    getDetailPelanggan(id),
    getPesananPelanggan(id),
  ]);

  if (!pelanggan) {
    notFound();
  }

  return (
    <ProfilPelangganClient
      pelanggan={pelanggan}
      riwayatOrder={riwayatOrder}
    />
  );
}
