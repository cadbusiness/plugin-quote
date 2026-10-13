import { isApiAuth, jsonOk, requireApiAuth } from "@/lib/api/http";
import { apiListFunnelTemplates } from "@/lib/api/funnel-config";

export async function GET(req: Request) {
  const auth = await requireApiAuth(req);
  if (!isApiAuth(auth)) return auth;
  return jsonOk(apiListFunnelTemplates());
}
