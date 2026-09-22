import { postVisitorSubmit } from "@/lib/visitor-requests/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return postVisitorSubmit(req);
}
