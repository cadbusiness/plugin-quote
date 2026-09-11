import type { Json } from "@/lib/db/database.types";
import type { SeedModule } from "@/lib/demo/types";

export type DemoSessionSpec = {
  token: string;
  hoursAgo: number;
  currentStep: number;
  contact: { name: string; email: string; company: string };
  answers: Record<string, Json>;
  utm_source: string | null;
  utm_medium: string | null;
};

export const DEMO_SESSIONS: DemoSessionSpec[] = [
  {
    token: "qb-demo-abandon-entrepot",
    hoursAgo: 5,
    currentStep: 1,
    contact: { name: "Paul Renaud", email: "paul.renaud@dock-ouest.test", company: "Dock Ouest" },
    answers: { project_type: "entrepot", surface: 800 },
    utm_source: "google",
    utm_medium: "cpc",
  },
  {
    token: "qb-demo-abandon-atelier",
    hoursAgo: 26,
    currentStep: 2,
    contact: { name: "Inès Vidal", email: "ines.vidal@atelier-sud.test", company: "Atelier Sud" },
    answers: { project_type: "atelier", surface: 120, height: 4.5 },
    utm_source: "linkedin",
    utm_medium: "social",
  },
  {
    token: "qb-demo-abandon-anonyme",
    hoursAgo: 3,
    currentStep: 0,
    contact: { name: "", email: "", company: "" },
    answers: { project_type: "commerce" },
    utm_source: "direct",
    utm_medium: null,
  },
];

function hoursAgoIso(hours: number) {
  return new Date(Date.now() - hours * 3600 * 1000).toISOString();
}

export const sessionsModule: SeedModule = {
  id: "sessions",
  title: "Sessions abandonnées",
  async run(ctx) {
    if (!ctx.funnel) throw new Error("Funnel démo requis avant les sessions");

    let created = 0;
    for (const spec of DEMO_SESSIONS) {
      const stamp = hoursAgoIso(spec.hoursAgo);
      const payload = {
        organization_id: ctx.org.id,
        configurator_id: ctx.funnel.id,
        token: spec.token,
        current_step: spec.currentStep,
        answers: spec.answers as Json,
        contact_draft: {
          name: spec.contact.name || undefined,
          email: spec.contact.email || undefined,
          company: spec.contact.company || undefined,
        } as Json,
        extracted_params: {} as Json,
        customization: {} as Json,
        chat_messages: [] as unknown as Json,
        utm_source: spec.utm_source,
        utm_medium: spec.utm_medium,
        last_activity_at: stamp,
        created_at: stamp,
        updated_at: stamp,
        submitted_quote_id: null,
      };

      const { data: existing } = await ctx.supabase
        .from("quote_sessions")
        .select("id")
        .eq("token", spec.token)
        .maybeSingle();
      if (existing) {
        const { error } = await ctx.supabase.from("quote_sessions").update(payload).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await ctx.supabase.from("quote_sessions").insert(payload);
        if (error) throw error;
        created += 1;
      }
    }

    return {
      module: "sessions",
      action: created ? "created" : "updated",
      detail: `${DEMO_SESSIONS.length} abandons (${created} nouveaux)`,
    };
  },
};
