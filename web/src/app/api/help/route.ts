export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getContactInbox, sendMail } from "@/lib/email/send-mail";
import { getAccessForRequest } from "@/lib/subscription/session";

const ISSUE_TYPES = new Set([
  "login",
  "billing",
  "dashboard",
  "map",
  "export",
  "other",
]);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  try {
    const access = await getAccessForRequest(request);
    if (!access.full) {
      return NextResponse.json(
        { error: "Subscriber sign-in required for technical support." },
        { status: 403 },
      );
    }

    const body = (await request.json()) as {
      email?: string;
      issueType?: string;
      message?: string;
    };

    const email = (body.email?.trim().toLowerCase() || access.email || "").trim();
    const issueType = body.issueType?.trim() ?? "other";
    const message = body.message?.trim() ?? "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }
    if (!ISSUE_TYPES.has(issueType)) {
      return NextResponse.json({ error: "Invalid issue type." }, { status: 400 });
    }
    if (!message || message.length < 10) {
      return NextResponse.json(
        { error: "Please describe the issue (at least 10 characters)." },
        { status: 400 },
      );
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: "Message is too long." }, { status: 400 });
    }

    const inbox = getContactInbox();
    if (!inbox) {
      return NextResponse.json(
        { error: "Support inbox is not configured yet. Please try again later." },
        { status: 503 },
      );
    }

    const issueLabel: Record<string, string> = {
      login: "Sign-in / access",
      billing: "Billing / subscription",
      dashboard: "Dashboard / leads",
      map: "Map view",
      export: "CSV export",
      other: "Other technical issue",
    };

    const result = await sendMail({
      to: inbox,
      replyTo: email,
      subject: `[DataBloomer Support] ${issueLabel[issueType] ?? issueType}`,
      html: `
        <h2>Subscriber technical support</h2>
        <p><strong>Access level:</strong> ${escapeHtml(access.level)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Issue type:</strong> ${escapeHtml(issueLabel[issueType] ?? issueType)}</p>
        <p><strong>Details:</strong></p>
        <pre style="white-space:pre-wrap;font-family:sans-serif;">${escapeHtml(message)}</pre>
      `,
      text: `Subscriber support\n\nLevel: ${access.level}\nEmail: ${email}\nIssue: ${issueLabel[issueType] ?? issueType}\n\n${message}`,
    });

    if (!result.sent) {
      return NextResponse.json(
        { error: result.reason ?? "Could not send support request." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Support request failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
