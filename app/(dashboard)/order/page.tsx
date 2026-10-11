import { getSemuaOrder } from "@/lib/data";
import OrderClient from "./OrderClient";

export const dynamic = "force-dynamic";

export default async function OrderPage() {
  const orders = await getSemuaOrder();
  return <OrderClient initialOrders={orders} />;
}
