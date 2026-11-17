"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginAction, checkLoginLockout } from "@/lib/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string | null>(null);

  // Periksa apakah pengguna saat ini sedang dalam status lockout
  useEffect(() => {
    checkLoginLockout().then((res) => {
      if (res.isLocked && res.lockedUntil) {
        setLockedUntil(res.lockedUntil);
        setError("Terlalu banyak percobaan masuk yang salah (maksimal 5 kali). Akses masuk dikunci sementara.");
      }
    });
  }, []);

  useEffect(() => {
    if (!lockedUntil) {
      setCountdown(null);
      return;
    }

    const tick = () => {
      const diff = new Date(lockedUntil).getTime() - Date.now();
      if (diff <= 0) {
        setLockedUntil(null);
        setCountdown(null);
        setError(null);
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdown(`${mins}:${secs.toString().padStart(2, "0")}`);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const username = (
      form.elements.namedItem("username") as HTMLInputElement
    ).value;
    const password = (
      form.elements.namedItem("password") as HTMLInputElement
    ).value;

    startTransition(async () => {
      const result = await loginAction({ username, password });

      if (!result.success) {
        setError(result.error);
        if (result.lockedUntil) setLockedUntil(result.lockedUntil);
        return;
      }

      router.replace("/beranda");
      router.refresh();
    });
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#FAF6EE]">
      <div className="w-full max-w-sm bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">CatatJahit</h1>
          <p className="text-sm text-gray-500 mt-1">Silakan masuk ke akun Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="username"
              className="text-sm font-medium text-gray-700"
            >
              Nama Pengguna
            </label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Nama pengguna"
              autoComplete="username"
              maxLength={50}
              disabled={isPending || !!lockedUntil}
              className="w-full min-h-[48px] px-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-transparent disabled:opacity-60 disabled:bg-gray-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Kata Sandi
            </label>
            <div className="relative flex items-center">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Kata sandi"
                autoComplete="current-password"
                maxLength={100}
                disabled={isPending || !!lockedUntil}
                className="w-full min-h-[48px] px-3 pr-16 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-transparent disabled:opacity-60 disabled:bg-gray-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={!!lockedUntil}
                className="absolute right-3 text-sm font-semibold text-[#6B8F71] hover:text-[#5a7b5f] transition-colors cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {showPassword ? "Tutup" : "Lihat"}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-[#C0392B] bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {countdown && (
            <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 flex items-center gap-2">
              <span className="text-base">⏱</span>
              <span>
                Akses terkunci. Coba lagi dalam <strong>{countdown}</strong> menit.
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || !!lockedUntil}
            className="w-full min-h-[48px] mt-2 bg-[#6B8F71] hover:bg-[#5a7b5f] text-white font-medium rounded-lg text-base transition-colors flex items-center justify-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none"
          >
            {isPending ? "Memproses..." : lockedUntil ? `Terkunci (${countdown ?? "..."})` : "Masuk"}
          </button>
        </form>
      </div>
    </main>
  );
}
