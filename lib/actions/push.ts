"use server";

import { createClient } from "@/lib/supabase/server";
import { sendWelcomePush } from "@/lib/push-notifications";

export interface PushSubscriptionInput {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function savePushSubscription(sub: PushSubscriptionInput) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

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
    const supabase = await createClient();
    await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
    return { success: true };
  } catch (err) {
    console.error("Exception removePushSubscription:", err);
    return { success: false };
  }
}
