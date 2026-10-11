"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// --- Step definitions ---
const STEPS = [
  { id: 1, label: "Pelanggan", title: "Pilih Pelanggan" },
  { id: 2, label: "Layanan", title: "Pilih Layanan" },
  { id: 3, label: "Ukuran", title: "Input Ukuran" },
  { id: 4, label: "Deadline", title: "Atur Deadline & Harga" },
  { id: 5, label: "Konfirmasi", title: "Konfirmasi Order" },
];

export default function TambahOrderPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const isLast = currentStep === STEPS.length;
  const hasPrevStep = currentStep > 1 && !isLast;

  const handleNext = () => {
    if (!isLast) setCurrentStep((s) => s + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = () => {
    // TODO: submit logic
    router.push("/order");
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Step Indicator — Teks langkah + Garis */}
      <div className="mb-6">
        <p className="text-xs text-gray-500 font-medium mb-2">
          Langkah {currentStep} dari {STEPS.length}
        </p>
        <div className="flex gap-1.5">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className="flex-1 h-1.5 rounded-full transition-all duration-300"
              style={{
                backgroundColor: s.id <= currentStep ? "#6B8F71" : "#DEE9F8",
              }}
            />
          ))}
        </div>
      </div>

      {/* Step Content (Kosong — akan diisi nanti) */}
      <div className="flex-1 mb-5" />

      {/* Navigasi Antar Step */}
      <div className="mt-auto">
        {hasPrevStep ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handlePrevStep}
              className="flex-1 min-h-[48px] rounded-xl bg-[#D8E4F3] hover:bg-[#c6d7ec] text-gray-700 font-medium text-sm active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 min-h-[48px] rounded-xl bg-[#6B8F71] hover:bg-[#5a7b5f] text-white font-semibold text-sm shadow-sm active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Lanjut ke langkah {currentStep + 1}</span>
              {/* Icon Panah Kanan */}
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={isLast ? handleSubmit : handleNext}
            className="w-full min-h-[48px] rounded-xl bg-[#6B8F71] hover:bg-[#5a7b5f] text-white font-semibold text-sm shadow-sm active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isLast ? (
              <>
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
                <span>Simpan</span>
              </>
            ) : (
              <>
                <span>Lanjut ke langkah {currentStep + 1}</span>
                {/* Icon Panah Kanan */}
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
