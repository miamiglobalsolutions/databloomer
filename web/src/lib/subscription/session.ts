import { hasFullAccess, type AccessLevel } from "@/lib/subscription/access";
import { isActiveStripeSubscriber } from "@/lib/subscription/stripe-subscribers";
import {
  ACCESS_COOKIE_NAME,
  SUBSCRIBER_EMAIL_COOKIE_NAME,
} from "@/lib/subscription/cookies";

function readCookie(
  cookieHeader: string | null | undefined,
  name: string,
): string | null {
  if (!cookieHeader) return null;
  const entry = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  if (!entry) return null;
  const value = decodeURIComponent(entry.split("=")[1] ?? "").trim();
  return value || null;
}

export function parseAccessLevelFromCookieHeader(
  cookieHeader: string | null | undefined,
): AccessLevel {
  const value = readCookie(cookieHeader, ACCESS_COOKIE_NAME);
  if (value === "admin" || value === "subscriber") return value;
  return "preview";
}

export function parseSubscriberEmailFromCookieHeader(
  cookieHeader: string | null | undefined,
): string | null {
  return readCookie(cookieHeader, SUBSCRIBER_EMAIL_COOKIE_NAME);
}

export async function getAccessForRequest(request: Request): Promise<{
  level: AccessLevel;
  full: boolean;
  email: string | null;
}> {
  const cookieHeader = request.headers.get("cookie");
  const cookieLevel = parseAccessLevelFromCookieHeader(cookieHeader);
  const email = parseSubscriberEmailFromCookieHeader(cookieHeader);

  if (cookieLevel === "admin") {
    return { level: "admin", full: true, email };
  }

  if (cookieLevel === "subscriber") {
    return { level: "subscriber", full: hasFullAccess("subscriber"), email };
  }

  if (email && (await isActiveStripeSubscriber(email))) {
    return { level: "subscriber", full: hasFullAccess("subscriber"), email };
  }

  return { level: "preview", full: hasFullAccess("preview"), email };
}
