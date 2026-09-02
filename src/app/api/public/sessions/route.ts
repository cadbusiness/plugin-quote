import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/public/session";

const schema = z.object({
  orgSlug: z.string().min(1),
  configuratorSlug: z.string().min(1),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }
  const session = await createSession(parsed.data.orgSlug, parsed.data.configuratorSlug);
  if (!session) {
    return NextResponse.json({ error: "Configurateur introuvable" }, { status: 404 });
  }
  return NextResponse.json(session);
}
