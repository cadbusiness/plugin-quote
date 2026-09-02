import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/wizard/validate";
import { submitQuote } from "@/lib/quotes/submit";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = req.headers.get("x-session-token")?.trim() ?? "";
  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Coordonnées invalides" }, { status: 400 });
  }
  try {
    const result = await submitQuote({ sessionId: id, token, contact: parsed.data });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Soumission impossible";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
