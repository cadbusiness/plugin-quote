import { randomUUID } from "node:crypto";
import { mergeContact, sanitizeAnswers, type ContactPatch } from "@/lib/visitor-requests/channel";
import { buildSalesBrief, salesRecipientDecision } from "@/lib/visitor-requests/brief";
import { applyLineOps } from "@/lib/visitor-requests/lines";
import type { VisitorRequestStore } from "@/lib/visitor-requests/store";
import { hashVisitorToken, newVisitorToken } from "@/lib/visitor-requests/token";
import {
  displayName,
  emptyContact,
  toPublicRequest,
  type LineCommand,
  type PublicVisitorRequest,
  type SalesNotice,
  type VisitorRequestRecord,
} from "@/lib/visitor-requests/types";

export type VisitorScope = {
  organizationId: string;
  configuratorId: string;
  connectionId: string | null;
};

export type VisitorAccess = {
  presentedToken: string | null;
  /** Header bearer must already exist. A cookie miss can mint a new visitor. */
  strict: boolean;
};

export type DraftCommand = {
  lines?: { productId: string; quantity: number; options?: Record<string, string> }[] | null;
  ops?: LineCommand[] | null;
  answers?: unknown;
  contact?: ContactPatch;
};

export type ServiceOk = {
  ok: true;
  skipped?: false;
  token: string;
  request: PublicVisitorRequest;
};

export type ServiceSkipped = {
  ok: true;
  skipped: true;
  token: string | null;
  request: null;
};

export type ServiceCode =
  | "needs_channel"
  | "empty_request"
  | "unknown_product"
  | "invalid_quantity"
  | "invalid_contact"
  | "invalid_answers"
  | "invalid_visitor";

export type ServiceFailure = {
  ok: false;
  code: ServiceCode;
  message: string;
  token: string | null;
  request: PublicVisitorRequest | null;
};

export type ServiceResult = ServiceOk | ServiceSkipped | ServiceFailure;

export type VisitorRequestDeps = {
  store: VisitorRequestStore;
  notify: (notice: SalesNotice) => Promise<{ sent: boolean }>;
  now?: () => string;
};

function nowIso(deps: VisitorRequestDeps) {
  return deps.now ? deps.now() : new Date().toISOString();
}

function blankRequest(scope: VisitorScope, identityId: string): VisitorRequestRecord {
  return {
    id: randomUUID(),
    organizationId: scope.organizationId,
    identityId,
    configuratorId: scope.configuratorId,
    connectionId: scope.connectionId,
    status: "draft",
    quoteId: null,
    contact: emptyContact(),
    answers: {},
    salesNotifiedAt: null,
    submittedAt: null,
    lines: [],
  };
}

async function resolveIdentity(
  deps: VisitorRequestDeps,
  scope: VisitorScope,
  access: VisitorAccess,
): Promise<{ ok: true; identityId: string; token: string } | ServiceFailure> {
  if (access.presentedToken) {
    const found = await deps.store.findIdentity({
      organizationId: scope.organizationId,
      connectionId: scope.connectionId,
      tokenHash: hashVisitorToken(access.presentedToken),
    });
    if (found) {
      await deps.store.touchIdentity(found.id);
      return { ok: true, identityId: found.id, token: access.presentedToken };
    }
    if (access.strict) {
      return {
        ok: false,
        code: "invalid_visitor",
        message: "Visiteur inconnu",
        token: null,
        request: null,
      };
    }
  }
  const token = newVisitorToken();
  const created = await deps.store.createIdentity({
    organizationId: scope.organizationId,
    connectionId: scope.connectionId,
    tokenHash: hashVisitorToken(token),
  });
  return { ok: true, identityId: created.id, token };
}

function commandOf(input: DraftCommand): { mode: "merge" | "replace"; ops: LineCommand[] } | null {
  if (input.lines) {
    return {
      mode: "replace",
      ops: input.lines.map((line) => ({
        op: "set" as const,
        productId: line.productId,
        quantity: line.quantity,
        options: line.options,
      })),
    };
  }
  if (input.ops && input.ops.length) return { mode: "merge", ops: input.ops };
  return null;
}

function productIdsFor(ops: LineCommand[]) {
  return [...new Set(ops.filter((op) => op.op !== "remove" && !(op.op === "set" && op.quantity <= 0)).map((op) => op.productId))];
}

async function applyCommand(
  deps: VisitorRequestDeps,
  request: VisitorRequestRecord,
  input: DraftCommand,
): Promise<{ ok: true; request: VisitorRequestRecord } | ServiceFailure> {
  let next = request;
  if (input.answers !== undefined) {
    const answers = sanitizeAnswers(input.answers);
    if (!answers.ok) {
      return {
        ok: false,
        code: "invalid_answers",
        message: "Réponses invalides",
        token: null,
        request: null,
      };
    }
    next = { ...next, answers: { ...next.answers, ...answers.answers } };
  }
  const command = commandOf(input);
  if (!command) return { ok: true, request: next };
  const catalogRows = await deps.store.productsByIds({
    organizationId: next.organizationId,
    configuratorId: next.configuratorId,
    ids: productIdsFor(command.ops),
  });
  const catalog = new Map(catalogRows.map((row) => [row.id, row]));
  const applied = applyLineOps(next.lines, command.ops, catalog, command.mode);
  if (!applied.ok) {
    return { ok: false, code: applied.code, message: applied.message, token: null, request: null };
  }
  return { ok: true, request: { ...next, lines: applied.lines } };
}

async function persistQuote(deps: VisitorRequestDeps, request: VisitorRequestRecord) {
  const contact = { ...request.contact, name: displayName(request.contact) };
  if (!request.quoteId) {
    const quote = await deps.store.createQuote({
      organizationId: request.organizationId,
      configuratorId: request.configuratorId,
      contact,
      answers: request.answers,
      lines: request.lines,
    });
    return { ...request, quoteId: quote.id };
  }
  await deps.store.syncQuote({
    quoteId: request.quoteId,
    organizationId: request.organizationId,
    configuratorId: request.configuratorId,
    contact,
    answers: request.answers,
    lines: request.lines,
  });
  return request;
}

/** First submit only. Never addresses the prospect. Does not start nurture workflows. */
async function notifySalesOnce(deps: VisitorRequestDeps, request: VisitorRequestRecord) {
  if (!request.quoteId || request.salesNotifiedAt) return request;
  const ctx = await deps.store.salesContext(request.organizationId);
  const decision = salesRecipientDecision(ctx.salesEmail, request.contact.email);
  if (!decision.ok) return { ...request, salesNotifiedAt: nowIso(deps) };
  const brief = buildSalesBrief({
    template: ctx.template,
    salesName: ctx.salesName,
    contact: request.contact,
    lines: request.lines,
    answers: request.answers,
  });
  const result = await deps.notify({
    to: decision.to,
    subject: brief.subject,
    text: brief.text,
    organizationId: request.organizationId,
    quoteId: request.quoteId,
    contactEmail: request.contact.email,
  });
  if (result.sent) {
    await deps.store.recordSalesNotice({
      organizationId: request.organizationId,
      quoteId: request.quoteId,
    });
  }
  return { ...request, salesNotifiedAt: nowIso(deps) };
}

function failure(code: ServiceCode, message: string, token: string | null, request: VisitorRequestRecord | null): ServiceFailure {
  return {
    ok: false,
    code,
    message,
    token,
    request: request ? toPublicRequest(request) : null,
  };
}

export async function readVisitorRequest(
  deps: VisitorRequestDeps,
  scope: VisitorScope,
  access: VisitorAccess,
): Promise<ServiceOk | ServiceSkipped | ServiceFailure> {
  if (!access.presentedToken) return { ok: true, skipped: true, token: null, request: null };
  const found = await deps.store.findIdentity({
    organizationId: scope.organizationId,
    connectionId: scope.connectionId,
    tokenHash: hashVisitorToken(access.presentedToken),
  });
  if (!found) {
    if (access.strict) return failure("invalid_visitor", "Visiteur inconnu", null, null);
    return { ok: true, skipped: true, token: null, request: null };
  }
  await deps.store.touchIdentity(found.id);
  const request = await deps.store.findRequestByIdentity(found.id);
  if (!request) return { ok: true, skipped: true, token: access.presentedToken, request: null };
  return { ok: true, token: access.presentedToken, request: toPublicRequest(request) };
}

export async function upsertVisitorRequest(
  deps: VisitorRequestDeps,
  scope: VisitorScope,
  access: VisitorAccess,
  input: DraftCommand,
): Promise<ServiceResult> {
  const command = commandOf(input);
  const hasAnswers = input.answers !== undefined;
  if (!access.presentedToken && !access.strict && !hasAnswers && (!command || command.ops.length === 0)) {
    return { ok: true, skipped: true, token: null, request: null };
  }

  const identity = await resolveIdentity(deps, scope, access);
  if (!identity.ok) return identity;

  const existing = await deps.store.findRequestByIdentity(identity.identityId);
  let request = existing ?? blankRequest(scope, identity.identityId);
  if (request.lines.length === 0 && request.status === "draft") {
    request = { ...request, configuratorId: scope.configuratorId, connectionId: scope.connectionId };
  }
  const applied = await applyCommand(deps, request, input);
  if (!applied.ok) return { ...applied, token: identity.token };
  request = applied.request;
  if (request.status === "submitted") request = await persistQuote(deps, request);
  request = await deps.store.saveRequest(request);
  return { ok: true, token: identity.token, request: toPublicRequest(request) };
}

export async function submitVisitorRequest(
  deps: VisitorRequestDeps,
  scope: VisitorScope,
  access: VisitorAccess,
  input: DraftCommand,
): Promise<ServiceResult> {
  const identity = await resolveIdentity(deps, scope, access);
  if (!identity.ok) return identity;

  const existing = await deps.store.findRequestByIdentity(identity.identityId);
  let request = existing ?? blankRequest(scope, identity.identityId);
  if (request.lines.length === 0 && request.status === "draft") {
    request = { ...request, configuratorId: scope.configuratorId, connectionId: scope.connectionId };
  }
  const applied = await applyCommand(deps, request, input);
  if (!applied.ok) return { ...applied, token: identity.token };
  request = applied.request;

  const contact = mergeContact(request.contact, input.contact ?? {});
  if (!contact.ok) return failure("invalid_contact", contact.message, identity.token, request);
  request = { ...request, contact: contact.contact };

  if (!request.contact.email && !request.contact.phone) {
    request = await deps.store.saveRequest(request);
    return failure("needs_channel", "Indiquez un email ou un téléphone", identity.token, request);
  }
  if (request.lines.length === 0) {
    request = await deps.store.saveRequest(request);
    return failure("empty_request", "Ajoutez au moins un produit", identity.token, request);
  }

  request = {
    ...request,
    status: "submitted",
    submittedAt: request.submittedAt ?? nowIso(deps),
  };
  request = await persistQuote(deps, request);
  request = await deps.store.saveRequest(request);
  if (!request.salesNotifiedAt) {
    try {
      const notified = await notifySalesOnce(deps, request);
      request = await deps.store.saveRequest(notified);
    } catch (error) {
      console.error("Sales notice failed", error);
    }
  }
  return { ok: true, token: identity.token, request: toPublicRequest(request) };
}
