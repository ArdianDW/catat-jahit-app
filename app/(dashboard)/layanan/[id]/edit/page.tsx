import { notFound } from "next/navigation";
import { getDetailLayanan } from "@/lib/data";
import FormLayananClient from "../../FormLayananClient";

export const dynamic = "force-dynamic";

interface EditLayananPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLayananPage({ params }: EditLayananPageProps) {
  const { id } = await params;
  const layanan = await getDetailLayanan(id);

  if (!layanan) {
    notFound();
  }

  return <FormLayananClient mode="edit" layanan={layanan} />;
}
