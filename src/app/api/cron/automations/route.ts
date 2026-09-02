import { NextResponse } from "next/server";
import { runAutomations } from "@/lib/crm/automations";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const header = req.headers.get("authorization");
  if (secret && header !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runAutomations();
  return NextResponse.json(result);
}
