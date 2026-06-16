import type { NextResponse } from "next/server";
import type { AccessLevel } from "@/lib/subscription/access";

export const ACCESS_COOKIE_NAME = "databloomer_access";
export const SUBSCRIBER_EMAIL_COOKIE_NAME = "databloomer_subscriber_email";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

export function setAccessCookies(
  res: NextResponse,
  options: { level: AccessLevel; email?: string | null },
): void {
  res.cookies.set(ACCESS_COOKIE_NAME, options.level, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS,
  });

  if (options.email) {
    res.cookies.set(SUBSCRIBER_EMAIL_COOKIE_NAME, options.email.trim().toLowerCase(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: THIRTY_DAYS,
    });
  }
}

export function clearAccessCookies(res: NextResponse): void {
  res.cookies.set(ACCESS_COOKIE_NAME, "preview", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  res.cookies.set(SUBSCRIBER_EMAIL_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
