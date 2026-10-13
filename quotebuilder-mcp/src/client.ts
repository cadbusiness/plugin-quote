import { z } from "zod";

import { leadFromDetailPayload, sliceQuoteStatus, type QuoteStatusSlice } from "./quote-status.js";

export type LeadStatus = "new" | "contacted" | "in_progress" | "won" | "lost" | "waiting";
export type LeadScore = "hot" | "warm" | "cold";
export type StatsPeriod = "today" | "week" | "month" | "custom";
export type FollowupTemplate = "reminder_24h" | "nudge_3d" | "reactivation_30d";

export class QuoteBuilderClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(apiKey: string, baseUrl = process.env.QB_API_URL || "https://www.quotebuilder.co") {
    if (!apiKey) {
      throw new Error("QB_API_KEY manquante");
    }
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await res.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!res.ok) {
      const message =
        data && typeof data === "object" && data !== null && "error" in data
          ? String((data as { error: unknown }).error)
          : `HTTP ${res.status}`;
      throw new Error(message);
    }

    return data as T;
  }

  getLeads(args: { status?: LeadStatus; score?: LeadScore; days?: number }) {
    const params = new URLSearchParams();
    if (args.status) params.set("status", args.status);
    if (args.score) params.set("score", args.score);
    if (args.days != null) params.set("days", String(args.days));
    const qs = params.toString();
    return this.request<{ leads: unknown[] }>("GET", `/api/leads${qs ? `?${qs}` : ""}`);
  }

  getLeadDetail(leadId: string) {
    return this.request<{ lead: unknown }>("GET", `/api/leads/${encodeURIComponent(leadId)}`);
  }

  updateLeadStatus(args: { lead_id: string; status: string; note?: string }) {
    return this.request<{ lead: unknown }>("PATCH", `/api/leads/${encodeURIComponent(args.lead_id)}`, {
      status: args.status,
      note: args.note,
    });
  }

  createLead(args: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    funnel_id: string;
    data?: Record<string, unknown>;
    run_autopilot?: boolean;
  }) {
    return this.request<{ lead: unknown }>("POST", "/api/leads", args);
  }

  async getQuoteStatus(quoteId: string): Promise<QuoteStatusSlice> {
    const raw = await this.request<unknown>(
      "GET",
      `/api/leads/${encodeURIComponent(quoteId)}?view=status`,
    );
    if (raw && typeof raw === "object" && raw !== null && "quote" in raw) {
      return sliceQuoteStatus((raw as { quote: unknown }).quote);
    }
    return sliceQuoteStatus(leadFromDetailPayload(raw));
  }

  getStats(args: { period: StatsPeriod; from?: string; to?: string }) {
    const params = new URLSearchParams({ period: args.period });
    if (args.from) params.set("from", args.from);
    if (args.to) params.set("to", args.to);
    return this.request<{ stats: unknown }>("GET", `/api/stats?${params.toString()}`);
  }

  listFunnels() {
    return this.request<{ funnels: unknown[] }>("GET", "/api/funnels");
  }

  getFunnelPerformance(funnelId: string) {
    return this.request<{ performance: unknown }>(
      "GET",
      `/api/funnels/${encodeURIComponent(funnelId)}/performance`,
    );
  }

  getFunnel(funnelId: string) {
    return this.request<{ funnel: unknown }>("GET", `/api/funnels/${encodeURIComponent(funnelId)}`);
  }

  listFunnelTemplates() {
    return this.request<{ templates: unknown[] }>("GET", "/api/funnels/templates");
  }

  createFunnel(args: Record<string, unknown>) {
    return this.request<{ funnel: unknown }>("POST", "/api/funnels", args);
  }

  /** PUT /api/funnels/:id/{steps,rules,chat-agent,tracking}; body is validated server-side. */
  updateFunnel(funnelId: string, part: "steps" | "rules" | "chat-agent" | "tracking", body: Record<string, unknown>) {
    return this.request<unknown>("PUT", `/api/funnels/${encodeURIComponent(funnelId)}/${part}`, body);
  }

  getEmbedCode(funnelId: string) {
    return this.request<{ embed: unknown }>("GET", `/api/funnels/${encodeURIComponent(funnelId)}/embed`);
  }

  publishFunnel(funnelId: string, body: { publish: boolean; confirm: boolean }) {
    return this.request<{ funnel: unknown }>("POST", `/api/funnels/${encodeURIComponent(funnelId)}/publish`, body);
  }

  triggerFollowup(args: { lead_id: string; template: FollowupTemplate }) {
    return this.request<{ followup: unknown }>("POST", "/api/automation/trigger", args);
  }

  getPendingFollowups() {
    return this.request<{ followups: unknown[] }>("GET", "/api/automation/pending");
  }

  getLeadTimeline(leadId: string, limit?: number) {
    const qs = limit ? `?limit=${limit}` : "";
    return this.request<{ timeline: unknown }>("GET", `/api/leads/${encodeURIComponent(leadId)}/timeline${qs}`);
  }

  addLeadNote(args: { lead_id: string; content: string }) {
    return this.request<{ note: unknown }>("POST", `/api/leads/${encodeURIComponent(args.lead_id)}/notes`, {
      content: args.content,
    });
  }

  assignLead(args: { lead_id: string; assignee: string; mode?: AssignMode; notify?: boolean }) {
    return this.request<{ assignment: unknown }>("POST", `/api/leads/${encodeURIComponent(args.lead_id)}/assign`, {
      assignee: args.assignee,
      mode: args.mode,
      notify: args.notify,
    });
  }

  listTeam() {
    return this.request<{ members: unknown[] }>("GET", "/api/team");
  }

  getAdsPerformance(args: PeriodArgs & { campaign?: string }) {
    const params = periodParams(args);
    if (args.campaign) params.set("campaign", args.campaign);
    return this.request<{ performance: unknown }>("GET", withQuery("/api/insights/ads-performance", params));
  }

  getAttributionBreakdown(args: PeriodArgs & { group_by?: AttributionGroupBy; limit?: number }) {
    const params = periodParams(args);
    if (args.group_by) params.set("group_by", args.group_by);
    if (args.limit != null) params.set("limit", String(args.limit));
    return this.request<{ attribution: unknown }>("GET", withQuery("/api/insights/attribution", params));
  }

  getConversionUploads(args: PeriodArgs & { status?: string }) {
    const params = periodParams(args);
    if (args.status) params.set("status", args.status);
    return this.request<{ diagnostics: unknown }>("GET", withQuery("/api/insights/conversion-uploads", params));
  }

  searchCatalog(args: {
    query?: string;
    category?: string;
    funnel_id?: string;
    in_stock_only?: boolean;
    include_inactive?: boolean;
    limit?: number;
    max_variants?: number;
  }) {
    const params = new URLSearchParams();
    if (args.query) params.set("q", args.query);
    if (args.category) params.set("category", args.category);
    if (args.funnel_id) params.set("funnel_id", args.funnel_id);
    if (args.in_stock_only) params.set("in_stock_only", "1");
    if (args.include_inactive) params.set("include_inactive", "1");
    if (args.limit != null) params.set("limit", String(args.limit));
    if (args.max_variants != null) params.set("max_variants", String(args.max_variants));
    return this.request<{ catalog: unknown }>("GET", withQuery("/api/catalog/search", params));
  }
}

export type PeriodArgs = { days?: number; from?: string; to?: string };
export type AttributionGroupBy = "source" | "source_medium" | "campaign" | "full";
export type AssignMode = "add" | "replace" | "remove";

function periodParams(args: PeriodArgs) {
  const params = new URLSearchParams();
  if (args.days != null) params.set("days", String(args.days));
  if (args.from) params.set("from", args.from);
  if (args.to) params.set("to", args.to);
  return params;
}

function withQuery(path: string, params: URLSearchParams) {
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export const leadStatusSchema = z.enum(["new", "contacted", "in_progress", "won", "lost", "waiting"]);
export const leadScoreSchema = z.enum(["hot", "warm", "cold"]);
export const statsPeriodSchema = z.enum(["today", "week", "month", "custom"]);
export const followupTemplateSchema = z.enum(["reminder_24h", "nudge_3d", "reactivation_30d"]);

export function textResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

export function errorResult(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return {
    isError: true as const,
    content: [{ type: "text" as const, text: message }],
  };
}
