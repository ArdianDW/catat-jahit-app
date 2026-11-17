"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { headers, cookies } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60 * 1000; // 5 menit
const ATTEMPT_COOKIE_NAME = "cj_login_attempts";

type RateEntry = { count: number; windowStart: number; lockedUntil?: number };
const inMemoryAttempts = new Map<string, RateEntry>();

setInterval(
  () => {
    const now = Date.now();
    for (const [ip, entry] of inMemoryAttempts) {
      if (now - entry.windowStart > WINDOW_MS && (!entry.lockedUntil || now > entry.lockedUntil)) {
        inMemoryAttempts.delete(ip);
      }
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

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    return createSupabaseClient(url, key, { auth: { persistSession: false } });
  } catch {
    return null;
  }
}

async function checkRateLimit(ip: string): Promise<{ isLimited: boolean; lockedUntil?: string; count: number }> {
  const now = Date.now();

  // 1. Cek database Supabase jika service role key tersedia
  const db = getServiceSupabase();
  if (db) {
    try {
      const { data, error } = await db
        .from("login_attempts")
        .select("count, window_start, locked_until")
        .eq("ip", ip)
        .maybeSingle();

      if (!error && data) {
        if (data.locked_until && new Date(data.locked_until).getTime() > now) {
          return { isLimited: true, lockedUntil: data.locked_until, count: data.count };
        }
        if (now - new Date(data.window_start).getTime() <= WINDOW_MS && data.count >= MAX_ATTEMPTS) {
          const lockedUntil = new Date(now + WINDOW_MS).toISOString();
          return { isLimited: true, lockedUntil, count: data.count };
        }
      }
    } catch {
      // Fallback ke layer berikutnya
    }
  }

  // 2. Cek Cookie di browser (tahan terhadap serverless cold-start)
  try {
    const cookieStore = await cookies();
    const cookieVal = cookieStore.get(ATTEMPT_COOKIE_NAME)?.value;
    if (cookieVal) {
      const parsed = JSON.parse(cookieVal) as RateEntry;
      if (parsed.lockedUntil && parsed.lockedUntil > now) {
        return { isLimited: true, lockedUntil: new Date(parsed.lockedUntil).toISOString(), count: parsed.count };
      }
      if (now - parsed.windowStart <= WINDOW_MS && parsed.count >= MAX_ATTEMPTS) {
        const lockedUntil = new Date(now + WINDOW_MS).toISOString();
        return { isLimited: true, lockedUntil, count: parsed.count };
      }
    }
  } catch {
    // Fallback ke in-memory
  }

  // 3. Cek in-memory
  const mem = inMemoryAttempts.get(ip);
  if (mem) {
    if (mem.lockedUntil && mem.lockedUntil > now) {
      return { isLimited: true, lockedUntil: new Date(mem.lockedUntil).toISOString(), count: mem.count };
    }
    if (now - mem.windowStart <= WINDOW_MS && mem.count >= MAX_ATTEMPTS) {
      const lockedUntil = new Date(now + WINDOW_MS).toISOString();
      return { isLimited: true, lockedUntil, count: mem.count };
    }
  }

  return { isLimited: false, count: 0 };
}

async function recordFailedAttempt(ip: string): Promise<{ lockedUntil?: string; remainingAttempts: number }> {
  const now = Date.now();
  let currentCount = 1;
  let windowStart = now;

  // Baca count saat ini dari in-memory / cookie
  const mem = inMemoryAttempts.get(ip);
  if (mem && now - mem.windowStart <= WINDOW_MS) {
    currentCount = mem.count + 1;
    windowStart = mem.windowStart;
  } else {
    try {
      const cookieStore = await cookies();
      const cookieVal = cookieStore.get(ATTEMPT_COOKIE_NAME)?.value;
      if (cookieVal) {
        const parsed = JSON.parse(cookieVal) as RateEntry;
        if (now - parsed.windowStart <= WINDOW_MS) {
          currentCount = parsed.count + 1;
          windowStart = parsed.windowStart;
        }
      }
    } catch {
      // ignore
    }
  }

  const isLocked = currentCount >= MAX_ATTEMPTS;
  const lockedUntilTime = isLocked ? now + WINDOW_MS : undefined;
  const lockedUntilIso = lockedUntilTime ? new Date(lockedUntilTime).toISOString() : undefined;

  // Simpan ke in-memory
  inMemoryAttempts.set(ip, {
    count: currentCount,
    windowStart,
    lockedUntil: lockedUntilTime,
  });

  // Simpan ke cookie (HTTP-only)
  try {
    const cookieStore = await cookies();
    cookieStore.set(
      ATTEMPT_COOKIE_NAME,
      JSON.stringify({
        count: currentCount,
        windowStart,
        lockedUntil: lockedUntilTime,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: Math.ceil(WINDOW_MS / 1000),
        path: "/",
      }
    );
  } catch {
    // ignore
  }

  // Simpan ke Supabase DB jika service role key tersedia
  const db = getServiceSupabase();
  if (db) {
    try {
      await db.from("login_attempts").upsert({
        ip,
        count: currentCount,
        window_start: new Date(windowStart).toISOString(),
        locked_until: lockedUntilIso ?? null,
      });
    } catch {
      // ignore
    }
  }

  const remainingAttempts = Math.max(0, MAX_ATTEMPTS - currentCount);
  return { lockedUntil: lockedUntilIso, remainingAttempts };
}

async function clearAttempts(ip: string): Promise<void> {
  inMemoryAttempts.delete(ip);
  try {
    const cookieStore = await cookies();
    cookieStore.delete(ATTEMPT_COOKIE_NAME);
  } catch {
    // ignore
  }
  const db = getServiceSupabase();
  if (db) {
    try {
      await db.from("login_attempts").delete().eq("ip", ip);
    } catch {
      // ignore
    }
  }
}

export async function checkLoginLockout(): Promise<{ isLocked: boolean; lockedUntil?: string }> {
  const headersList = await headers();
  const ip = getClientIp(headersList);
  const rateLimitState = await checkRateLimit(ip);
  return {
    isLocked: rateLimitState.isLimited,
    lockedUntil: rateLimitState.lockedUntil,
  };
}

const EMAIL_SUFFIX = "@catatjahit.app";

export type LoginResult =
  | { success: true }
  | {
      success: false;
      error: string;
      lockedUntil?: string;
      remainingAttempts?: number;
    };

export async function loginAction(rawInput: unknown): Promise<LoginResult> {
  const headersList = await headers();
  const ip = getClientIp(headersList);

  const rateLimitState = await checkRateLimit(ip);
  if (rateLimitState.isLimited) {
    return {
      success: false,
      error:
        "Terlalu banyak percobaan masuk yang salah (maksimal 5 kali). Akses masuk dikunci sementara selama 5 menit.",
      lockedUntil: rateLimitState.lockedUntil,
      remainingAttempts: 0,
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
    const { lockedUntil, remainingAttempts } = await recordFailedAttempt(ip);
    if (lockedUntil) {
      return {
        success: false,
        error:
          "Terlalu banyak percobaan masuk yang salah (maksimal 5 kali). Akses masuk dikunci sementara selama 5 menit.",
        lockedUntil,
        remainingAttempts: 0,
      };
    }
    return {
      success: false,
      error: `Nama pengguna atau kata sandi salah. Sisa percobaan: ${remainingAttempts} kali sebelum akun dikunci sementara.`,
      remainingAttempts,
    };
  }

  await clearAttempts(ip);
  return { success: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export type ChangePasswordResult =
  | { success: true }
  | { success: false; error: string };

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<ChangePasswordResult> {
  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: "Kata sandi baru minimal 8 karakter." };
  }
  if (newPassword.length > 100) {
    return { success: false, error: "Kata sandi baru terlalu panjang." };
  }

  const supabase = await createClient();

  // Ambil user & email saat ini
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return { success: false, error: "Sesi tidak valid, silakan login ulang." };
  }

  // Re-auth dengan password lama
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (signInErr) {
    return { success: false, error: "Kata sandi lama tidak sesuai." };
  }

  // Update password
  const { error: updateErr } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (updateErr) {
    return {
      success: false,
      error: "Gagal memperbarui kata sandi. Coba lagi.",
    };
  }

  return { success: true };
}

export type GetCurrentUserResult = {
  username: string | null;
  email: string | null;
};

export async function getCurrentUser(): Promise<GetCurrentUserResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { username: null, email: null };

  const displayUsername = user.user_metadata?.display_username as
    | string
    | undefined;
  const usernameFromEmail =
    user.email?.replace("@catatjahit.app", "") ?? null;

  return {
    username: displayUsername ?? usernameFromEmail,
    email: user.email ?? null,
  };
}
