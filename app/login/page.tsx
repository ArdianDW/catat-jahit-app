"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const EMAIL_SUFFIX = "@catatjahit.app";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const username = (form.elements.namedItem("username") as HTMLInputElement)
      .value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    if (!username || !password) {
      setError("Nama pengguna dan kata sandi wajib diisi.");
      return;
    }

    const email = username.includes("@") ? username : `${username}${EMAIL_SUFFIX}`;

    startTransition(async () => {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("Nama pengguna atau kata sandi salah.");
        return;
      }

      router.replace("/beranda");
      router.refresh();
    });
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#FAF6EE]">
      <div className="w-full max-w-sm bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-6">
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
              disabled={isPending}
              className="w-full min-h-[48px] px-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-transparent disabled:opacity-60"
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
                disabled={isPending}
                className="w-full min-h-[48px] px-3 pr-16 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-transparent disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 text-sm font-semibold text-[#6B8F71] hover:text-[#5a7b5f] transition-colors cursor-pointer select-none"
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

          <button
            type="submit"
            disabled={isPending}
            className="w-full min-h-[48px] mt-2 bg-[#6B8F71] hover:bg-[#5a7b5f] text-white font-medium rounded-lg text-base transition-colors flex items-center justify-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </main>
  );
}
