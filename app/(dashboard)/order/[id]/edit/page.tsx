import { notFound } from "next/navigation";
import { getDetailOrder, getLayananOptions } from "@/lib/data";
import EditOrderClient from "./EditOrderClient";

export const dynamic = "force-dynamic";

interface EditOrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditOrderPage({ params }: EditOrderPageProps) {
  const { id } = await params;
  const [order, layananList] = await Promise.all([
    getDetailOrder(id),
    getLayananOptions(),
  ]);

  if (!order) {
    notFound();
  }

  return <EditOrderClient order={order} layananList={layananList} />;
}
