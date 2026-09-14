import { applyCors, corsPreflight } from "@/lib/mcp/cors";
import { mcpHttpHandler } from "@/lib/mcp/handler";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function handle(req: Request) {
  if (req.method === "OPTIONS") return corsPreflight();
  return applyCors(await mcpHttpHandler(req));
}

export { handle as GET, handle as POST, handle as DELETE, handle as OPTIONS };
