"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60 * 1000;
type RateEntry = { count: number; windowStart: number };
const loginAttempts = new Map<string, RateEntry>();

setInterval(
  () => {
    const now = Date.now();
    for (const [ip, entry] of loginAttempts) {
      if (now - entry.windowStart > WINDOW_MS) loginAttempts.delete(ip);
    }
  },
  10 * 60 * 1000
);

function getClientIp(headersList: Awaited<ReturnType<typeof headers>>): string {
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, windowStart: now });
  } else {
    entry.count += 1;
  }
}

function clearAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

const EMAIL_SUFFIX = "@catatjahit.app";

export type LoginResult =
  | { success: true }
  | { success: false; error: string };

export async function loginAction(rawInput: unknown): Promise<LoginResult> {
  const headersList = await headers();
  const ip = getClientIp(headersList);

  if (isRateLimited(ip)) {
    return {
      success: false,
      error:
        "Terlalu banyak percobaan masuk yang salah. Silakan coba kembali dalam 5 menit.",
    };
  }

  if (
    typeof rawInput !== "object" ||
    rawInput === null ||
    !("username" in rawInput) ||
    !("password" in rawInput)
  ) {
    return { success: false, error: "Data masukan tidak valid." };
  }

  const { username: rawUsername, password: rawPassword } = rawInput as {
    username: unknown;
    password: unknown;
  };

  if (typeof rawUsername !== "string" || typeof rawPassword !== "string") {
    return { success: false, error: "Data masukan tidak valid." };
  }

  const username = rawUsername.trim().slice(0, 50);
  const password = rawPassword.slice(0, 100);

  if (!username || !password) {
    return {
      success: false,
      error: "Nama pengguna dan kata sandi wajib diisi.",
    };
  }

  if (!/^[a-zA-Z0-9._@-]+$/.test(username)) {
    return {
      success: false,
      error: "Nama pengguna mengandung karakter yang tidak diizinkan.",
    };
  }

  const email = username.includes("@")
    ? username
    : `${username}${EMAIL_SUFFIX}`;

  const supabase = await createClient();
  const { error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    recordFailedAttempt(ip);
    return {
      success: false,
      error: "Nama pengguna atau kata sandi salah.",
    };
  }

  clearAttempts(ip);
  return { success: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
