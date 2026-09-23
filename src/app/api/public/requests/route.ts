import { getVisitorRequest, postVisitorRequest } from "@/lib/visitor-requests/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return getVisitorRequest(req);
}

export async function POST(req: Request) {
  return postVisitorRequest(req);
}
