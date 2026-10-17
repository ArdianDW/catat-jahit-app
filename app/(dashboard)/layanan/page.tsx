import { getSemuaLayanan } from "@/lib/data";
import LayananClient from "./LayananClient";

export const dynamic = "force-dynamic";

export default async function LayananPage() {
  const layanan = await getSemuaLayanan();
  return <LayananClient initialLayanan={layanan} />;
}

