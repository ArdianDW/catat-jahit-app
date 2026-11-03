import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sendDeadlineReminderPush } from "@/lib/push-notifications";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function isAuthorized(authHeader: string | null, secret: string | undefined): boolean {
  if (!authHeader || !secret) return false;
  const expected = `Bearer ${secret}`;
  const headerBuf = Buffer.from(authHeader);
  const expectedBuf = Buffer.from(expected);
  if (headerBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(headerBuf, expectedBuf);
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (process.env.NODE_ENV === "production" && !cronSecret) {
    console.error("[cron/reminder] CRON_SECRET belum disetel di environment produksi!");
    return NextResponse.json(
      { success: false, error: "Konfigurasi server tidak lengkap" },
      { status: 500 }
    );
  }

  if (!isAuthorized(authHeader, cronSecret) && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { success: false, error: "Akses tidak diizinkan" },
      { status: 401 }
    );
  }

  const isManualTest = request.nextUrl.searchParams.get("test") === "true";

  if (!isManualTest) {
    try {
      const supabase = await createClient();
      const { data: settingData } = await supabase
        .from("notification_settings")
        .select("notif_time, is_active")
        .limit(1)
        .maybeSingle();

      if (settingData) {
        if (settingData.is_active === false) {
          return NextResponse.json({
            success: true,
            skipped: true,
            message: "Notifikasi dinonaktifkan di pengaturan",
          });
        }

        const currentHourWib = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Jakarta",
          hour: "numeric",
          hour12: false,
        }).format(new Date());

        const targetHour = (settingData.notif_time || "08:00").split(":")[0];

        if (parseInt(currentHourWib, 10) !== parseInt(targetHour, 10)) {
          return NextResponse.json({
            success: true,
            skipped: true,
            message: `Jam saat ini (${currentHourWib} WIB) belum sesuai jam target (${targetHour} WIB)`,
          });
        }
      }
    } catch {
    }
  }

  const result = await sendDeadlineReminderPush(isManualTest);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  return GET(request);
}
