import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sendDeadlineReminderPush } from "@/lib/push-notifications";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  const isAuthorizedCron =
    cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!isAuthorizedCron && process.env.NODE_ENV === "production") {
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
