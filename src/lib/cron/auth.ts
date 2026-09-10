import { NextResponse } from "next/server";

/** Fail-closed: cron routes require CRON_SECRET and a matching Bearer token. */
export function assertCronAuth(req: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET?.trim();
  const header = req.headers.get("authorization");
  if (!secret || header !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
