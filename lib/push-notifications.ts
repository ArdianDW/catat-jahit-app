import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@catatjahit.app";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

export interface ReminderResult {
  success: boolean;
  message: string;
  totalOrders: number;
  totalSubscribers: number;
  sentCount: number;
  failedCount: number;
}

export async function sendDeadlineReminderPush(): Promise<ReminderResult> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    return {
      success: false,
      message: "Kunci VAPID belum dikonfigurasi di lingkungan server.",
      totalOrders: 0,
      totalSubscribers: 0,
      sentCount: 0,
      failedCount: 0,
    };
  }

  const supabase = await createClient();

  const { data: subscriptions, error: subError } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth");

  if (subError) {
    console.error("Error fetching push subscriptions:", subError);
    return {
      success: false,
      message: `Gagal membaca push subscriptions: ${subError.message}`,
      totalOrders: 0,
      totalSubscribers: 0,
      sentCount: 0,
      failedCount: 0,
    };
  }

  const activeSubs = subscriptions || [];
  if (activeSubs.length === 0) {
    return {
      success: true,
      message: "Belum ada perangkat yang mengaktifkan izin notifikasi push.",
      totalOrders: 0,
      totalSubscribers: 0,
      sentCount: 0,
      failedCount: 0,
    };
  }

  const todayStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
  }).format(new Date());

  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() + 3);
  const limitStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
  }).format(limitDate);

  const { data: orders, error: orderError } = await supabase
    .from("orders")
    .select(
      `
      id,
      nomor_order,
      tanggal_deadline,
      status,
      pelanggan:pelanggan_id ( nama_pelanggan )
    `
    )
    .in("status", ["Antri", "Dikerjakan"])
    .lte("tanggal_deadline", limitStr)
    .order("tanggal_deadline", { ascending: true });

  if (orderError) {
    console.error("Error fetching deadline orders:", orderError);
    return {
      success: false,
      message: `Gagal membaca pesanan deadline: ${orderError.message}`,
      totalOrders: 0,
      totalSubscribers: activeSubs.length,
      sentCount: 0,
      failedCount: 0,
    };
  }

  const urgentOrders = (orders as {
    id: string;
    nomor_order: string;
    tanggal_deadline: string;
    status: string;
    pelanggan: { nama_pelanggan: string } | null;
  }[]) || [];

  if (urgentOrders.length === 0 && !isTest) {
    return {
      success: true,
      message: "Tidak ada pesanan yang mendekati deadline (H-3 s.d lewat deadline). Notifikasi tidak dikirim.",
      totalOrders: 0,
      totalSubscribers: activeSubs.length,
      sentCount: 0,
      failedCount: 0,
    };
  }

  let notifTitle = "CatatJahit - Pengingat Deadline Pagi";
  let notifBody = "Semua pesanan jahit terpantau aman dan terkendali.";
  const targetUrl = "/beranda";

  if (urgentOrders.length === 1) {
    const single = urgentOrders[0];
    const nama = single.pelanggan?.nama_pelanggan || single.nomor_order;

    const diffDays = Math.round(
      (new Date(single.tanggal_deadline).getTime() - new Date(todayStr).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) {
      notifTitle = "🚨 Pesanan Lewat Deadline!";
      notifBody = `Pesanan ${nama} sudah lewat deadline ${Math.abs(diffDays)} hari. Segera selesaikan!`;
    } else if (diffDays === 0) {
      notifTitle = "⚠️ Deadline Hari Ini!";
      notifBody = `Pesanan ${nama} harus selesai hari ini. Semangat menjahit!`;
    } else if (diffDays === 1) {
      notifTitle = "⏰ Deadline Besok!";
      notifBody = `Pesanan ${nama} memiliki batas waktu pengerjaan besok.`;
    } else {
      notifTitle = "🧵 Pengingat Deadline (H-3)";
      notifBody = `Pesanan ${nama} tersisa ${diffDays} hari lagi.`;
    }
  } else {
    const overdueCount = urgentOrders.filter(
      (o) => o.tanggal_deadline < todayStr
    ).length;
    const todayCount = urgentOrders.filter(
      (o) => o.tanggal_deadline === todayStr
    ).length;

    if (overdueCount > 0) {
      notifTitle = `🚨 ${overdueCount} Pesanan Lewat Deadline!`;
      notifBody = `Ada total ${urgentOrders.length} pesanan yang harus diprioritaskan hari ini. Ketuk untuk membuka.`;
    } else if (todayCount > 0) {
      notifTitle = `⚠️ ${todayCount} Pesanan Deadline Hari Ini!`;
      notifBody = `Ada total ${urgentOrders.length} pesanan mendekati deadline dalam waktu dekat.`;
    } else {
      notifTitle = `🧵 ${urgentOrders.length} Pesanan Mendekati Deadline`;
      notifBody = `Pengingat pagi: ada ${urgentOrders.length} pesanan yang harus diselesaikan dalam 3 hari ke depan.`;
    }
  }

  const payload = JSON.stringify({
    title: notifTitle,
    body: notifBody,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    url: targetUrl,
  });

  let sentCount = 0;
  let failedCount = 0;

  for (const sub of activeSubs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        payload
      );
      sentCount++;
    } catch (err: unknown) {
      failedCount++;
      const statusCode = (err as { statusCode?: number })?.statusCode;
      if (statusCode === 410 || statusCode === 404) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", sub.endpoint);
      }
    }
  }

  return {
    success: true,
    message: `Notifikasi berhasil dikirim ke ${sentCount} perangkat (${failedCount} gagal/kedaluwarsa).`,
    totalOrders: urgentOrders.length,
    totalSubscribers: activeSubs.length,
    sentCount,
    failedCount,
  };
}

export async function sendWelcomePush(sub: {
  endpoint: string;
  p256dh: string;
  auth: string;
}) {
  if (!vapidPublicKey || !vapidPrivateKey) {
    return { success: false, error: "Kunci VAPID belum dikonfigurasi." };
  }

  try {
    const payload = JSON.stringify({
      title: "CatatJahit - Notifikasi Aktif! 🔔",
      body: "Pengingat deadline otomatis telah aktif dan akan dikirim setiap jam 08:00 WIB.",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      url: "/beranda",
    });

    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      },
      payload
    );

    return { success: true };
  } catch (err: unknown) {
    console.error("Error sendWelcomePush:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal mengirim notifikasi selamat datang",
    };
  }
}
