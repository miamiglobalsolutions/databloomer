export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { AccessLevel } from "@/lib/subscription/access";
import { setAccessCookies } from "@/lib/subscription/cookies";

type LoginBody = {
  code?: string;
  target?: "subscriber" | "admin";
};

function validateCode(code: string, target: "subscriber" | "admin"): AccessLevel | null {
  const adminCode = process.env.ADMIN_ACCESS_CODE?.trim();
  const subscriberCode = process.env.SUBSCRIBER_ACCESS_CODE?.trim();

  if (target === "admin") {
    if (!adminCode) return null;
    return code === adminCode ? "admin" : null;
  }

  if (target === "subscriber" && subscriberCode && code === subscriberCode) {
    return "subscriber";
  }

  if (adminCode && code === adminCode) return "admin";
  if (subscriberCode && code === subscriberCode) return "subscriber";
  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;
    const code = body.code?.trim();
    const target = body.target ?? "subscriber";
    if (!code) {
      return NextResponse.json({ error: "Access code is required." }, { status: 400 });
    }

    if (target === "admin" && !process.env.ADMIN_ACCESS_CODE?.trim()) {
      return NextResponse.json(
        { error: "Admin access is not configured. Set ADMIN_ACCESS_CODE in Vercel." },
        { status: 503 },
      );
    }

    const level = validateCode(code, target);
    if (!level) {
      return NextResponse.json({ error: "Invalid access code." }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true, level });
    setAccessCookies(res, { level });
    return res;
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
}
