import { NextResponse } from "next/server";
import { wordpressPluginUpdatePayload } from "@/lib/integrations/plugin-release";

export const dynamic = "force-dynamic";

export async function GET() {
  const payload = wordpressPluginUpdatePayload();
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, max-age=60, must-revalidate",
    },
  });
}
