export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { isSubscriptionGatingEnabled } from "@/lib/subscription/access";
import { getAccessForRequest } from "@/lib/subscription/session";

export async function GET(request: Request) {
  const access = await getAccessForRequest(request);
  return NextResponse.json({
    level: access.level,
    full: access.full,
    email: access.email,
    gatingEnabled: isSubscriptionGatingEnabled(),
  });
}
