import { notFound } from "next/navigation";
import { getDetailOrder } from "@/lib/data";
import DetailOrderClient from "./DetailOrderClient";

export const dynamic = "force-dynamic";

interface DetailOrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function DetailOrderPage({ params }: DetailOrderPageProps) {
  const { id } = await params;
  const order = await getDetailOrder(id);

  if (!order) {
    notFound();
  }

  return <DetailOrderClient initialOrder={order} />;
}
