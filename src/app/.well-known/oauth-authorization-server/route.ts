import { corsPreflight, jsonWithCors } from "@/lib/mcp/cors";
import { authorizationServerMetadata } from "@/lib/mcp/oauth";

export const dynamic = "force-dynamic";

export function GET(req: Request) {
  return jsonWithCors(authorizationServerMetadata(req));
}

export function OPTIONS() {
  return corsPreflight();
}
