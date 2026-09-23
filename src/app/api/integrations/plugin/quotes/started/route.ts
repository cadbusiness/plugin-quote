import { NextResponse } from "next/server";
import { authenticatePlugin, unauthorized } from "@/lib/integrations/plugin";
import { captureStartedQuote, loadStartedResume } from "@/lib/integrations/plugin-started";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Refill a started request from the resume link. Same plugin auth. No e-mail in the logs we return to analytics. */
export async function GET(req: Request) {
  const limited = rateLimit(`plugin:started:${clientIp(req)}`, 60, 60000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);
  const row = await authenticatePlugin(req);
  if (!row) return unauthorized();
  const token = new URL(req.url).searchParams.get("token")?.trim() ?? "";
  try {
    const result = await loadStartedResume(row.organization_id, token);
    if (!result.ok) {
      return NextResponse.json({ error: result.error, code: result.code }, { status: result.status });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("plugin resume failed", error);
    return NextResponse.json(
      { error: "La reprise n'a pas pu être chargée. Réessayez dans un moment.", code: "resume_failed" },
      { status: 500 },
    );
  }
}

/** Records the e-mail when the visitor leaves the field. Same dossier is completed by POST /quotes. */
export async function POST(req: Request) {
  const limited = rateLimit(`plugin:started:${clientIp(req)}`, 30, 60000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);
  const row = await authenticatePlugin(req);
  if (!row) return unauthorized();
  const body = await req.json().catch(() => null);
  try {
    const result = await captureStartedQuote(row, body);
    if (!result.ok) {
      return NextResponse.json({ error: result.error, code: result.code }, { status: result.status });
    }
    return NextResponse.json({
      ok: true,
      quoteId: result.quoteId,
      status: result.status,
      alreadyStarted: result.alreadyStarted,
      alreadySubmitted: result.alreadySubmitted,
      externalId: result.externalId,
      resumeUrl: result.resumeUrl,
    });
  } catch (error) {
    console.error("plugin start failed", error);
    return NextResponse.json(
      { error: "La demande n'a pas pu être enregistrée. Réessayez dans un moment.", code: "start_failed" },
      { status: 500 },
    );
  }
}
