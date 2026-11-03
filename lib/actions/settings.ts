"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import {
  notificationSettingsSchema,
  type NotificationSettingsInput,
} from "@/lib/validations/settings";

export interface SettingsResponse<T = NotificationSettingsInput> {
  success: boolean;
  data?: T;
  error?: string;
}

const DEFAULT_SETTINGS: NotificationSettingsInput = {
  deadline_days: 3,
  notif_time: "08:00",
  is_active: true,
};

export async function getNotificationSettings(): Promise<SettingsResponse> {
  try {
    const auth = await requireAuth();
    if (!auth.authenticated) {
      return { success: false, error: auth.error, data: DEFAULT_SETTINGS };
    }

    const { data, error } = await auth.supabase
      .from("notification_settings")
      .select("deadline_days, notif_time, is_active")
      .eq("user_id", auth.user.id)
      .maybeSingle();

    if (error || !data) {
      return { success: true, data: DEFAULT_SETTINGS };
    }

    return {
      success: true,
      data: {
        deadline_days: data.deadline_days ?? 3,
        notif_time: data.notif_time ?? "08:00",
        is_active: data.is_active ?? true,
      },
    };
  } catch {
    return {
      success: true,
      data: DEFAULT_SETTINGS,
    };
  }
}

export async function saveNotificationSettings(
  rawInput: unknown
): Promise<SettingsResponse> {
  try {
    const auth = await requireAuth();
    if (!auth.authenticated) {
      return { success: false, error: auth.error };
    }

    const parsed = notificationSettingsSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Pengaturan tidak valid",
      };
    }

    const { deadline_days, notif_time, is_active } = parsed.data;

    const { error } = await auth.supabase
      .from("notification_settings")
      .upsert(
        {
          user_id: auth.user.id,
          deadline_days,
          notif_time,
          is_active,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/beranda");
    return { success: true, data: parsed.data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menyimpan pengaturan";
    return { success: false, error: message };
  }
}

