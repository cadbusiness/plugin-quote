import { NextResponse } from "next/server";
import { assertCronAuth } from "@/lib/cron/auth";
import { runAutomations } from "@/lib/crm/automations";

export async function GET(req: Request) {
  const denied = assertCronAuth(req);
  if (denied) return denied;
  const result = await runAutomations();
  return NextResponse.json(result);
}
