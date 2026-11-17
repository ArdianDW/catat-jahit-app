"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Ruler,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  FileText,
  ChevronRight,
  Check,
  Info,
} from "lucide-react";
import {
  createPelanggan,
  updatePelanggan,
  type CreatePelangganInput,
} from "@/lib/actions/pelanggan";
import { filterTextInput } from "@/lib/utils/sanitize";
import type { PelangganItem } from "@/lib/data";

const AVATAR_PALETTES = [
  { bg: "#DCF8C6", text: "#075E54" },
  { bg: "#D0E4FF", text: "#004881" },
  { bg: "#FFE0B2", text: "#E65100" },
  { bg: "#FCE4EC", text: "#C2185B" },
  { bg: "#E8EAF6", text: "#283593" },
  { bg: "#E0F2F1", text: "#00695C" },
];

function getAvatarColors(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function parseMeasurement(v: string): number | null {
  const n = parseFloat(v.replace(",", "."));
  return isNaN(n) || n <= 0 ? null : n;
}

interface FormPelangganClientProps {
  mode: "tambah" | "edit";
  pelanggan?: PelangganItem;
}

const measureFields: { key: string; label: string }[] = [
  { key: "lingkar_dada", label: "Lingkar Dada" },
  { key: "lingkar_pinggang", label: "Lingkar Pinggang" },
  { key: "lingkar_pinggul", label: "Lingkar Pinggul" },
  { key: "panjang_bahu", label: "Panjang Bahu" },
  { key: "panjang_lengan", label: "Panjang Lengan" },
  { key: "panjang_baju", label: "Panjang Baju" },
  { key: "panjang_celana", label: "Panjang Celana" },
];

export default function FormPelangganClient({
  mode,
  pelanggan,
}: FormPelangganClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const TOTAL_STEPS = 3;
  const STEP_TITLES = [
    "Informasi Pelanggan",
    "Ukuran Badan (Opsional)",
    "Ringkasan & Catatan",
  ];

  const PHONE_REGEX = /^(\+62|62|08)[0-9]{8,13}$/;

  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form State
  const [nama, setNama] = useState(pelanggan?.nama_pelanggan ?? "");
  const [noHp, setNoHp] = useState(pelanggan?.no_hp ?? "");
  const [alamat, setAlamat] = useState(pelanggan?.alamat_singkat ?? "");

  const [measurements, setMeasurements] = useState<Record<string, string>>({
    lingkar_dada: pelanggan?.lingkar_dada?.toString() ?? "",
    lingkar_pinggang: pelanggan?.lingkar_pinggang?.toString() ?? "",
    lingkar_pinggul: pelanggan?.lingkar_pinggul?.toString() ?? "",
    panjang_bahu: pelanggan?.panjang_bahu?.toString() ?? "",
    panjang_lengan: pelanggan?.panjang_lengan?.toString() ?? "",
    panjang_baju: pelanggan?.panjang_baju?.toString() ?? "",
    panjang_celana: pelanggan?.panjang_celana?.toString() ?? "",
  });

  const [catatan, setCatatan] = useState(pelanggan?.catatan_ukuran ?? "");

  const filledMeasurements = measureFields
    .map(({ key, label }) => ({
      label,
      value: measurements[key]?.trim(),
    }))
    .filter((m) => !!m.value);

  const avatar = getAvatarColors(nama || "Pelanggan");
  const initials = getInitials(nama);

  const handleNext = () => {
    setError(null);
    const errs: Record<string, string> = {};

    if (step === 1) {
      if (!nama.trim()) {
        errs.nama = "Nama pelanggan wajib diisi";
      } else if (nama.trim().length < 2) {
        errs.nama = "Nama minimal 2 karakter";
      }
      if (!noHp.trim()) {
        errs.noHp = "Nomor HP wajib diisi";
      } else if (!PHONE_REGEX.test(noHp.trim())) {
        errs.noHp = "Format nomor tidak valid (cth: 0812xxxxxxxx)";
      }
    }

    if (step === 2) {
      measureFields.forEach(({ key }) => {
        const raw = measurements[key]?.trim();
        if (raw) {
          const n = parseFloat(raw.replace(",", "."));
          if (!isNaN(n)) {
            if (n < 1) errs[key] = "Ukuran minimal 1 cm";
            else if (n > 300) errs[key] = "Ukuran maksimal 300 cm";
          }
        }
      });
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setFieldErrors({});
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError(null);
    setFieldErrors({});
    setStep((s) => s - 1);
  };

  const handleSubmit = () => {
    setError(null);
    if (!nama.trim()) {
      setError("Nama lengkap pelanggan harus diisi");
      setStep(1);
      return;
    }
    if (!noHp.trim()) {
      setError("Nomor WhatsApp / HP harus diisi");
      setStep(1);
      return;
    }

    startTransition(async () => {
      const input: CreatePelangganInput = {
        nama_pelanggan: nama.trim(),
        no_hp: noHp.trim(),
        alamat_singkat: alamat.trim() || null,
        lingkar_dada: parseMeasurement(measurements.lingkar_dada),
        lingkar_pinggang: parseMeasurement(measurements.lingkar_pinggang),
        lingkar_pinggul: parseMeasurement(measurements.lingkar_pinggul),
        panjang_bahu: parseMeasurement(measurements.panjang_bahu),
        panjang_lengan: parseMeasurement(measurements.panjang_lengan),
        panjang_baju: parseMeasurement(measurements.panjang_baju),
        panjang_celana: parseMeasurement(measurements.panjang_celana),
        catatan_ukuran: catatan.trim() || null,
      };

      let res;
      if (mode === "edit" && pelanggan) {
        res = await updatePelanggan(pelanggan.id, input);
      } else {
        res = await createPelanggan(input);
      }

      if (!res.success) {
        setError(res.error ?? "Gagal menyimpan data pelanggan");
        return;
      }

      setSuccess(
        mode === "edit"
          ? `Data ${nama} berhasil diperbarui`
          : `Pelanggan ${nama} berhasil ditambahkan`
      );
    });
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-[#EFF3EE] flex items-center justify-center shadow-xs">
          <CheckCircle2 className="w-10 h-10 text-[#6B8F71]" />
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900">
            {mode === "edit" ? "Data Diperbarui!" : "Pelanggan Berhasil Ditambahkan!"}
          </p>
          <p className="text-sm text-gray-500 mt-1">{success}</p>
        </div>
        <div className="flex flex-col gap-2.5 w-full">
          {mode === "edit" && pelanggan ? (
            <button
              type="button"
              onClick={() => router.push(`/pelanggan/${pelanggan.id}`)}
              className="w-full min-h-[48px] rounded-xl bg-[#6B8F71] hover:bg-[#5a7b5f] text-white font-semibold text-sm transition-all cursor-pointer"
            >
              Lihat Profil Pelanggan
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push("/pelanggan")}
              className="w-full min-h-[48px] rounded-xl bg-[#6B8F71] hover:bg-[#5a7b5f] text-white font-semibold text-sm transition-all cursor-pointer"
            >
              Lihat Daftar Pelanggan
            </button>
          )}

          {mode === "tambah" && (
            <button
              type="button"
              onClick={() => {
                setSuccess(null);
                setStep(1);
                setNama("");
                setNoHp("");
                setAlamat("");
                setCatatan("");
                setMeasurements({
                  lingkar_dada: "",
                  lingkar_pinggang: "",
                  lingkar_pinggul: "",
                  panjang_bahu: "",
                  panjang_lengan: "",
                  panjang_baju: "",
                  panjang_celana: "",
                });
              }}
              className="w-full min-h-[48px] rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition-all cursor-pointer"
            >
              Tambah Pelanggan Lagi
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* Header Langkah & Progress Bar */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-gray-400">
          Langkah {step} dari {TOTAL_STEPS}
        </p>
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1.5 rounded-full transition-all duration-300"
              style={{ backgroundColor: i < step ? "#6B8F71" : "#DEE9F8" }}
            />
          ))}
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          {STEP_TITLES[step - 1]}
        </h2>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* LANGKAH 1: Box Putih dengan 3 input & info box */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 flex flex-col gap-4 shadow-xs">
          {/* Input 1: Nama Lengkap Pelanggan */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700">
                Nama Lengkap Pelanggan
              </label>
              <span className="text-xs font-bold text-red-500">Wajib</span>
            </div>
            <input
              type="text"
              value={nama}
              onChange={(e) => { setNama(filterTextInput(e.target.value)); setFieldErrors((p) => ({ ...p, nama: "" })); }}
              maxLength={100}
              placeholder="cth: Siti Aminah"
              className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border bg-[#EDF4FF] text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 transition-colors ${fieldErrors.nama ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "border-gray-200 focus:border-[#6B8F71] focus:ring-[#6B8F71]/20"}`}
            />
            {fieldErrors.nama && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3 shrink-0" />{fieldErrors.nama}</p>}
          </div>

          {/* Input 2: Nomor WhatsApp / HP */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700">
                Nomor WhatsApp / HP
              </label>
              <span className="text-xs font-bold text-red-500">Wajib</span>
            </div>
            <input
              type="tel"
              inputMode="tel"
              value={noHp}
              onChange={(e) => { setNoHp(e.target.value); setFieldErrors((p) => ({ ...p, noHp: "" })); }}
              maxLength={20}
              placeholder="cth: 081234567890"
              className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border bg-[#EDF4FF] text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 transition-colors ${fieldErrors.noHp ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "border-gray-200 focus:border-[#6B8F71] focus:ring-[#6B8F71]/20"}`}
            />
            {fieldErrors.noHp && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3 shrink-0" />{fieldErrors.noHp}</p>}
          </div>

          {/* Input 3: Alamat Singkat */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700">
                Alamat Singkat
              </label>
              <span className="text-xs font-medium text-gray-400">Opsional</span>
            </div>
            <textarea
              rows={2}
              value={alamat}
              onChange={(e) => setAlamat(filterTextInput(e.target.value))}
              maxLength={255}
              placeholder="cth: Jl. Melati No. 12, RT 02/RW 03"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#EDF4FF] text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#6B8F71] focus:ring-1 focus:ring-[#6B8F71]/20 transition-colors resize-none"
            />
          </div>

          {/* Box info paling bawah: Pastikan nomor hp sudah benar dan masih aktif */}
          <div className="p-3.5 rounded-xl bg-[#EDF4FF] border border-[#DEE9F8] flex items-center gap-2.5 text-[#424842]">
            <Info className="w-4 h-4 shrink-0 text-[#424842]" />
            <p className="text-xs font-medium leading-relaxed">
              Pastikan nomor hp sudah benar dan masih aktif
            </p>
          </div>
        </div>
      )}

      {/* LANGKAH 2: Form Ukuran Badan (Opsional) */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 flex flex-col gap-4 shadow-xs">
          <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
            <Ruler className="w-4 h-4 text-[#6B8F71] shrink-0" />
            <div>
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                Ukuran Badan (Opsional)
              </p>
              <p className="text-[11px] text-gray-400">
                Masukkan ukuran dalam cm. Boleh dikosongkan jika belum diukur.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {measureFields.map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-gray-600">
                  {label}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={1}
                    max={300}
                    step="0.5"
                    value={measurements[key] || ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      const n = parseFloat(v);
                      const clamped = !isNaN(n) ? Math.min(300, Math.max(1, n)) : v;
                      setMeasurements((prev) => ({
                        ...prev,
                        [key]: String(clamped),
                      }));
                      setFieldErrors((p) => ({ ...p, [key]: "" }));
                    }}
                    onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                    placeholder="–"
                    className={`w-full min-h-[42px] pl-3 pr-8 py-2 rounded-xl border bg-[#EDF4FF] text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-1 transition-colors ${fieldErrors[key] ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "border-gray-200 focus:border-[#6B8F71] focus:ring-[#6B8F71]/20"}`}
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-medium pointer-events-none">
                    cm
                  </span>
                </div>
                {fieldErrors[key] && <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><AlertCircle className="w-3 h-3 shrink-0" />{fieldErrors[key]}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LANGKAH 3: Ringkasan Profil & Ukuran, serta Form Catatan Tambahan */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          {/* Kotak Ringkasan */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 flex flex-col gap-4 shadow-xs">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
              Ringkasan Data Pelanggan
            </p>

            {/* Profil Pelanggan */}
            <div className="p-3.5 rounded-xl bg-[#EDF4FF] border border-[#DEE9F8] flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-sm font-bold shadow-2xs"
                style={{ backgroundColor: avatar.bg, color: avatar.text }}
              >
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-[#6B8F71] uppercase tracking-wide">
                  Pelanggan
                </p>
                <p className="text-base font-bold text-gray-900 leading-tight truncate">
                  {nama}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">{noHp}</p>
                {alamat.trim() && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {alamat}
                  </p>
                )}
              </div>
            </div>

            {/* Ukuran Badan yang Diisi */}
            <div className="flex flex-col gap-2 pt-1 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Data Ukuran ({filledMeasurements.length})
                </span>
              </div>

              {filledMeasurements.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {filledMeasurements.map(({ label, value }) => (
                    <div
                      key={label}
                      className="p-2.5 rounded-xl bg-[#EDF4FF] border border-[#DEE9F8] flex items-center justify-between text-xs"
                    >
                      <span className="text-gray-500">{label}</span>
                      <span className="font-extrabold text-gray-800">
                        {value} cm
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-center">
                  <p className="text-xs text-gray-400">
                    Tidak ada ukuran badan yang diisi (opsional)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Form Catatan Tambahan di Paling Bawah */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 flex flex-col gap-2.5 shadow-xs">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                Catatan Tambahan untuk Pelanggan
              </label>
            </div>
            <textarea
              rows={3}
              value={catatan}
              onChange={(e) => setCatatan(filterTextInput(e.target.value))}
              maxLength={500}
              placeholder="cth: Preferensi jahitan longgar, model lengan tertentu, atau catatan penting lainnya..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#EDF4FF] text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#6B8F71] focus:ring-1 focus:ring-[#6B8F71]/20 transition-colors resize-none"
            />
          </div>
        </div>
      )}

      {/* Tombol Navigasi Bawah */}
      <div className="flex gap-3 pt-1">
        {step > 1 && (
          <button
            type="button"
            disabled={isPending}
            onClick={handleBack}
            className="flex-1 min-h-[48px] rounded-xl bg-[#D8E4F3] hover:bg-[#c6d7ec] text-gray-700 font-semibold text-sm active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            Kembali
          </button>
        )}

        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 min-h-[48px] rounded-xl bg-[#6B8F71] hover:bg-[#5a7b5f] text-white font-semibold text-sm shadow-sm active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Lanjut</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
          </button>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={handleSubmit}
            className="flex-1 min-h-[48px] rounded-xl bg-[#6B8F71] hover:bg-[#5a7b5f] text-white font-semibold text-sm shadow-sm active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>
                  {mode === "edit" ? "Simpan Perubahan" : "Simpan Pelanggan"}
                </span>
              </>
            )}
          </button>
        )}
      </div>

    </div>
  );
}
