import { notFound } from "next/navigation";
import { getDetailPelanggan } from "@/lib/data";
import FormPelangganClient from "../../FormPelangganClient";

export const dynamic = "force-dynamic";

interface EditPelangganPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPelangganPage({ params }: EditPelangganPageProps) {
  const { id } = await params;
  const pelanggan = await getDetailPelanggan(id);

  if (!pelanggan) {
    notFound();
  }

  return <FormPelangganClient mode="edit" pelanggan={pelanggan} />;
}
