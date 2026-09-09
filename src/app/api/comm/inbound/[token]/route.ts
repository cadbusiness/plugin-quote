import { NextResponse } from "next/server";
import { ingestInboundEmail, readInboundPayload } from "@/lib/comm/inbound";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!token) return NextResponse.json({ error: "Token manquant" }, { status: 400 });
  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const payload = readInboundPayload(body);
  if (!payload.from) {
    return NextResponse.json({ error: "from manquant" }, { status: 400 });
  }
  const result = await ingestInboundEmail({ token, ...payload });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}
