"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#FAF6EE]">
      <div className="w-full max-w-sm bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            CatatJahit
          </h1>
          <p className="text-sm text-gray-500 mt-1">Silakan masuk ke akun Anda</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="username"
              className="text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Username"
              className="w-full min-h-[48px] px-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-transparent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative flex items-center">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full min-h-[48px] px-3 pr-16 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-transparent"
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

          <Link
            href="/beranda"
            className="w-full min-h-[48px] mt-2 bg-[#6B8F71] hover:bg-[#5a7b5f] text-white font-medium rounded-lg text-base transition-colors flex items-center justify-center cursor-pointer text-center"
          >
            Masuk
          </Link>
        </div>
      </div>
    </main>
  );
}
