import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sendDeadlineReminderPush } from "@/lib/push-notifications";
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

  const result = await sendDeadlineReminderPush();
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  return GET(request);
}
