import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/public/session";
import { applyAgentTurn } from "@/lib/public/agent-turn";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

const schema = z.object({ message: z.string().min(1).max(4000) });

/** Site card and chat block. Does not require the public funnel to be in Chat IA mode. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const limited = rateLimit(`sessions:agent:${clientIp(req)}`, 20, 60000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);

  const { id } = await params;
  const token = req.headers.get("x-session-token")?.trim() ?? "";
  const session = await getSession(id, token);
  if (!session) return NextResponse.json({ error: "Session introuvable" }, { status: 404 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Message invalide" }, { status: 400 });
  }

  try {
    const result = await applyAgentTurn({
      sessionId: id,
      token,
      message: parsed.data.message,
      requireChat: false,
    });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json(result.turn);
  } catch (error) {
    const raw = error instanceof Error ? error.message : "";
    const message = /ANTHROPIC_API_KEY/.test(raw) || !raw ? "Agent indisponible" : raw;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
