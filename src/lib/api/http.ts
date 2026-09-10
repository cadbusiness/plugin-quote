import { NextResponse } from "next/server";
import { authenticateApiKey, type ApiAuthContext } from "@/lib/api/keys";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireApiAuth(req: Request): Promise<ApiAuthContext | NextResponse> {
  try {
    const ctx = await authenticateApiKey(req);
    if (!ctx) return jsonError("Clé API invalide ou révoquée", 401);
    return ctx;
  } catch (error) {
    console.error("API auth failed", error);
    return jsonError("Authentification impossible", 500);
  }
}

export function isApiAuth(value: ApiAuthContext | NextResponse): value is ApiAuthContext {
  return !(value instanceof NextResponse);
}
