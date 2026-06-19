import { NextResponse } from "next/server";
import { getAccessForRequest } from "@/lib/subscription/session";

export async function requireAdminAccess(
  request: Request,
): Promise<
  | { ok: true; email: string | null }
  | { ok: false; response: NextResponse }
> {
  const access = await getAccessForRequest(request);
  if (access.level !== "admin") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Admin access required" }, { status: 403 }),
    };
  }
  return { ok: true, email: access.email };
}
