import { getSemuaPelanggan } from "@/lib/data";
import PelangganClient from "./PelangganClient";

export const dynamic = "force-dynamic";

export default async function PelangganPage() {
  const pelanggan = await getSemuaPelanggan();
  return <PelangganClient initialPelanggan={pelanggan} />;
}
