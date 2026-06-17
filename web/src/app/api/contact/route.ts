export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getContactInbox, sendMail } from "@/lib/email/send-mail";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    };

    const name = body.name?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const subject = body.subject?.trim() || "General inquiry";
    const message = body.message?.trim() ?? "";

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }
    if (!message || message.length < 10) {
      return NextResponse.json(
        { error: "Please include a message (at least 10 characters)." },
        { status: 400 },
      );
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: "Message is too long." }, { status: 400 });
    }

    const inbox = getContactInbox();
    if (!inbox) {
      return NextResponse.json(
        { error: "Contact form is not configured yet. Please try again later." },
        { status: 503 },
      );
    }

    const result = await sendMail({
      to: inbox,
      replyTo: email,
      subject: `[DataBloomer Contact] ${subject}`,
      html: `
        <h2>Contact form — DataBloomer</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <p><strong>Message:</strong></p>
        <pre style="white-space:pre-wrap;font-family:sans-serif;">${escapeHtml(message)}</pre>
      `,
      text: `Contact form\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
    });

    if (!result.sent) {
      return NextResponse.json(
        { error: result.reason ?? "Could not send message." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Contact failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
