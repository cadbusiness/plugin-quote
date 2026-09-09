import { z } from "zod";

export type LeadStatus = "new" | "contacted" | "in_progress" | "won" | "lost";
export type LeadScore = "hot" | "warm" | "cold";
export type StatsPeriod = "today" | "week" | "month" | "custom";
export type FollowupTemplate = "reminder_24h" | "nudge_3d" | "reactivation_30d";

export class QuoteBuilderClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(apiKey: string, baseUrl = process.env.QB_API_URL ?? "https://app.quotebuilder.io") {
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
    funnel_id: string;
    data?: Record<string, unknown>;
  }) {
    return this.request<{ lead: unknown }>("POST", "/api/leads", args);
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

  triggerFollowup(args: { lead_id: string; template: FollowupTemplate }) {
    return this.request<{ followup: unknown }>("POST", "/api/automation/trigger", args);
  }

  getPendingFollowups() {
    return this.request<{ followups: unknown[] }>("GET", "/api/automation/pending");
  }
}

export const leadStatusSchema = z.enum(["new", "contacted", "in_progress", "won", "lost"]);
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
