import { NextResponse } from "next/server";
import { getSession, updateSession } from "@/lib/public/session";

function tokenFrom(req: Request) {
  return req.headers.get("x-session-token")?.trim() ?? "";
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getSession(id, tokenFrom(req));
  if (!session) return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  return NextResponse.json(session);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = tokenFrom(req);
  const body = await req.json().catch(() => ({}));
  const session = await updateSession(id, token, {
    mode: body.mode,
    currentStep: body.currentStep,
    answers: body.answers,
    extractedParams: body.extractedParams,
    chatMessages: body.chatMessages,
    selectedSuggestionId: body.selectedSuggestionId,
    customization: body.customization,
    contactDraft: body.contactDraft,
    attribution: body.attribution,
  });
  if (!session) return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  return NextResponse.json(session);
}
