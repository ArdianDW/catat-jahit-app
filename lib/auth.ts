import { createClient } from "@/lib/supabase/server";
import type { User, SupabaseClient } from "@supabase/supabase-js";

export type AuthResult =
  | {
      authenticated: true;
      user: User;
      supabase: SupabaseClient;
    }
  | {
      authenticated: false;
      error: string;
      user?: never;
      supabase?: never;
    };

export async function requireAuth(): Promise<AuthResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        authenticated: false,
        error: "Akses ditolak: Sesi tidak valid atau telah berakhir. Silakan masuk kembali.",
      };
    }

    return {
      authenticated: true,
      user,
      supabase,
    };
  } catch (err) {
    console.error("Exception in requireAuth:", err);
    return {
      authenticated: false,
      error: "Terjadi kesalahan sistem saat memverifikasi sesi autentikasi.",
    };
  }
}
