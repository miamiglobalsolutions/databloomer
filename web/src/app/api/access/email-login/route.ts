export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { setAccessCookies } from "@/lib/subscription/cookies";
import { isActiveStripeSubscriber } from "@/lib/subscription/stripe-subscribers";

type Body = { email?: string };

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const email = body.email?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const active = await isActiveStripeSubscriber(email);
    if (!active) {
      return NextResponse.json(
        {
          error:
            "No active subscription found for this email. Subscribe first, then try again.",
        },
        { status: 403 },
      );
    }

    const res = NextResponse.json({ ok: true, level: "subscriber" });
    setAccessCookies(res, { level: "subscriber", email });
    return res;
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
}
