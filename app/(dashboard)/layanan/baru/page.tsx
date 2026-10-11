"use client";

import { useRouter } from "next/navigation";

export default function TambahLayananPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = () => {
    // TODO: submit logic
    router.push("/layanan");
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Konten Form (Kosong — akan diisi nanti) */}
      <div className="flex-1 mb-5" />

      {/* Navigasi: Simpan Layanan dan di bawahnya Kembali */}
      <div className="mt-auto flex flex-col gap-2.5">
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full min-h-[48px] rounded-xl bg-[#6B8F71] hover:bg-[#5a7b5f] text-white font-semibold text-sm shadow-sm active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {/* Icon Centang */}
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
          <span>Simpan Layanan</span>
        </button>

        <button
          type="button"
          onClick={handleBack}
          className="w-full min-h-[48px] rounded-xl bg-[#D8E4F3] hover:bg-[#c6d7ec] text-gray-700 font-medium text-sm active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center"
        >
          Kembali
        </button>
      </div>
    </div>
  );
}
