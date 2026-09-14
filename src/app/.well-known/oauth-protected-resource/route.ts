import { corsPreflight, jsonWithCors } from "@/lib/mcp/cors";
import { protectedResourceMetadata } from "@/lib/mcp/oauth";

export const dynamic = "force-dynamic";

export function GET(req: Request) {
  return jsonWithCors(protectedResourceMetadata(req));
}

export function OPTIONS() {
  return corsPreflight();
}
