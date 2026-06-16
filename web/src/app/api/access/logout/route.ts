export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { clearAccessCookies } from "@/lib/subscription/cookies";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearAccessCookies(res);
  return res;
}
