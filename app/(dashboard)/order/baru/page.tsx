import { getPelangganOptions, getLayananOptions } from "@/lib/data";
import TambahOrderClient from "./TambahOrderClient";

export const dynamic = "force-dynamic";

export default async function TambahOrderPage() {
  const [pelangganList, layananList] = await Promise.all([
    getPelangganOptions(),
    getLayananOptions(),
  ]);

  return <TambahOrderClient pelangganList={pelangganList} layananList={layananList} />;
}
