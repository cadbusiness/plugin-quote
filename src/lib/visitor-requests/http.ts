import { NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { createSupabaseVisitorStore } from "@/lib/visitor-requests/supabase-store";
import { sendSalesNotice } from "@/lib/visitor-requests/notify";
import { resolveVisitorScope } from "@/lib/visitor-requests/scope";
import {
  readVisitorRequest,
  submitVisitorRequest,
  upsertVisitorRequest,
  type DraftCommand,
  type ServiceResult,
} from "@/lib/visitor-requests/service";
import { presentedVisitorToken, visitorCookieName, visitorCookieOptions } from "@/lib/visitor-requests/token";

const lineSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int(),
  options: z.record(z.string(), z.string()).optional(),
});

const opSchema = z.discriminatedUnion("op", [
  lineSchema.extend({ op: z.literal("add"), quantity: z.number().int().positive() }),
  lineSchema.extend({ op: z.literal("set") }),
  z.object({ op: z.literal("remove"), productId: z.string().uuid() }),
]);

const scopeSchema = z.object({
  orgSlug: z.string().min(1),
  configuratorSlug: z.string().min(1).optional(),
  configuratorId: z.string().uuid().optional(),
  shopSlug: z.string().min(1).optional(),
  connectionId: z.string().uuid().optional(),
});

const mutationSchema = scopeSchema
  .extend({
    lines: z.array(lineSchema).max(40).optional(),
    ops: z.array(opSchema).max(40).optional(),
    answers: z.unknown().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    name: z.string().optional(),
    company: z.string().optional(),
  })
  .refine((value) => !(value.lines && value.ops), { message: "lines or ops" });

function deps() {
  return { store: createSupabaseVisitorStore(), notify: sendSalesNotice };
}

export function visitorResponse(orgSlug: string, result: ServiceResult) {
  if (!result.ok) {
    const status = result.code === "invalid_visitor" ? 401 : 400;
    const res = NextResponse.json(
      {
        error: result.message,
        code: result.code,
        request: result.request,
        needsChannel: result.request?.needsChannel ?? true,
        channel: result.request?.channel ?? null,
        recognized: result.request?.recognized ?? false,
        visitorToken: result.token,
      },
      { status },
    );
    if (result.token) {
      res.cookies.set(visitorCookieName(orgSlug), result.token, visitorCookieOptions());
    }
    return res;
  }
  if (result.skipped || !result.request) {
    const res = NextResponse.json({
      request: null,
      needsChannel: true,
      channel: null,
      recognized: false,
      visitorToken: result.token,
    });
    if (result.token) {
      res.cookies.set(visitorCookieName(orgSlug), result.token, visitorCookieOptions());
    }
    return res;
  }
  const res = NextResponse.json({
    request: result.request,
    needsChannel: result.request.needsChannel,
    channel: result.request.channel,
    recognized: result.request.recognized,
    visitorToken: result.token,
  });
  res.cookies.set(visitorCookieName(orgSlug), result.token, visitorCookieOptions());
  return res;
}

async function readBody(req: Request) {
  const parsed = mutationSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return { ok: false as const, response: NextResponse.json({ error: "Payload invalide" }, { status: 400 }) };
  return { ok: true as const, data: parsed.data };
}

function commandFrom(data: z.infer<typeof mutationSchema>): DraftCommand {
  return {
    lines: data.lines,
    ops: data.ops,
    answers: data.answers,
    contact: {
      email: data.email,
      phone: data.phone,
      name: data.name,
      company: data.company,
    },
  };
}

export async function getVisitorRequest(req: Request) {
  const limited = rateLimit(`visitor-requests:get:${clientIp(req)}`, 60, 60_000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);
  const url = new URL(req.url);
  const parsed = scopeSchema.safeParse({
    orgSlug: url.searchParams.get("orgSlug") ?? "",
    configuratorSlug: url.searchParams.get("configuratorSlug") ?? undefined,
    configuratorId: url.searchParams.get("configuratorId") ?? undefined,
    shopSlug: url.searchParams.get("shopSlug") ?? undefined,
    connectionId: url.searchParams.get("connectionId") ?? undefined,
  });
  if (!parsed.success) return NextResponse.json({ error: "Funnel ou boutique requis" }, { status: 400 });
  const scope = await resolveVisitorScope(parsed.data);
  if (!scope.ok) return NextResponse.json({ error: scope.error }, { status: scope.status });
  const presented = presentedVisitorToken(req, parsed.data.orgSlug);
  const result = await readVisitorRequest(deps(), scope.scope, {
    presentedToken: presented.token,
    strict: presented.strict,
  });
  return visitorResponse(parsed.data.orgSlug, result);
}

export async function postVisitorRequest(req: Request) {
  const limited = rateLimit(`visitor-requests:write:${clientIp(req)}`, 40, 60_000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);
  const body = await readBody(req);
  if (!body.ok) return body.response;
  const scope = await resolveVisitorScope(body.data);
  if (!scope.ok) return NextResponse.json({ error: scope.error }, { status: scope.status });
  const presented = presentedVisitorToken(req, body.data.orgSlug);
  const result = await upsertVisitorRequest(deps(), scope.scope, {
    presentedToken: presented.token,
    strict: presented.strict,
  }, commandFrom(body.data));
  return visitorResponse(body.data.orgSlug, result);
}

export async function postVisitorSubmit(req: Request) {
  const limited = rateLimit(`visitor-requests:submit:${clientIp(req)}`, 15, 60_000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);
  const body = await readBody(req);
  if (!body.ok) return body.response;
  const scope = await resolveVisitorScope(body.data);
  if (!scope.ok) return NextResponse.json({ error: scope.error }, { status: scope.status });
  const presented = presentedVisitorToken(req, body.data.orgSlug);
  const result = await submitVisitorRequest(deps(), scope.scope, {
    presentedToken: presented.token,
    strict: presented.strict,
  }, commandFrom(body.data));
  return visitorResponse(body.data.orgSlug, result);
}
