"use server";

import { requireAuth } from "@/lib/auth";
import { sendWelcomePush } from "@/lib/push-notifications";
import { pushSubscriptionSchema } from "@/lib/validations/push";

export async function savePushSubscription(rawInput: unknown) {
  try {
    const auth = await requireAuth();
    if (!auth.authenticated) {
      return { success: false, error: auth.error };
    }
    const supabase = auth.supabase;
    const user = auth.user;

    const parsed = pushSubscriptionSchema.safeParse(rawInput);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return { success: false, error: firstError?.message || "Data subscription tidak valid." };
    }
    const sub = parsed.data;

    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        user_id: user?.id || null,
      },
      { onConflict: "endpoint" }
    );

    if (error) {
      console.error("Error savePushSubscription:", error);
      return { success: false, error: error.message };
    }

    await sendWelcomePush({
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    });

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    console.error("Exception savePushSubscription:", err);
    return { success: false, error: message };
  }
}

export async function removePushSubscription(endpoint: string) {
  try {
    const auth = await requireAuth();
    if (!auth.authenticated) {
      return { success: false, error: auth.error };
    }
    const supabase = auth.supabase;

    await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
    return { success: true };
  } catch (err) {
    console.error("Exception removePushSubscription:", err);
    return { success: false };
  }
}
