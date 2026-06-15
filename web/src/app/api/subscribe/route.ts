import { NextResponse } from "next/server";
import { query } from "@/lib/db/client";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    await query(
      `INSERT INTO digest_subscribers (email, active)
       VALUES ($1, TRUE)
       ON CONFLICT (email) DO UPDATE SET active = TRUE, subscribed_at = NOW()`,
      [email],
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Subscribe failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
