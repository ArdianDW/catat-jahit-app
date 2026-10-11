import { getRingkasanBeranda, getOrderMendekatiDeadline } from "@/lib/data";
import BerandaClient from "./BerandaClient";

export const dynamic = "force-dynamic";

export default async function BerandaPage() {
  const [ringkasan, orders] = await Promise.all([
    getRingkasanBeranda(3),
    getOrderMendekatiDeadline(3),
  ]);

  return <BerandaClient initialRingkasan={ringkasan} initialOrders={orders} />;
}
