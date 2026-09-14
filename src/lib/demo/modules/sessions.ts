import type { Json } from "@/lib/db/database.types";
import { DEMO_FUNNEL_SLUG, DEMO_ORG, DEMO_SHOP_SLUG } from "@/lib/demo/constants";
import type { SeedModule } from "@/lib/demo/types";
import { ANALYTICS_EVENTS } from "@/lib/stats/events";

export type DemoSessionSpec = {
  token: string;
  hoursAgo: number;
  durationMin: number;
  currentStep: number;
  contact: { name: string; email: string; company: string };
  answers: Record<string, Json>;
  utm_source: string | null;
  utm_medium: string | null;
  country: string;
  city: string;
  device: "mobile" | "tablet" | "desktop";
  landing_path: string;
  referrer: string | null;
  pages: { path: string; title: string; minutesAfterStart: number }[];
};

const shopHome = `/b/${DEMO_ORG.slug}/${DEMO_SHOP_SLUG}`;
const shopCatalog = `${shopHome}/catalogue`;
const funnelPath = `/c/${DEMO_ORG.slug}/${DEMO_FUNNEL_SLUG}`;

export const DEMO_SESSIONS: DemoSessionSpec[] = [
  {
    token: "qb-demo-abandon-entrepot",
    hoursAgo: 5,
    durationMin: 12,
    currentStep: 1,
    contact: { name: "Paul Renaud", email: "paul.renaud@dock-ouest.test", company: "Dock Ouest" },
    answers: { project_type: "entrepot", surface: 800 },
    utm_source: "google",
    utm_medium: "cpc",
    country: "FR",
    city: "Lyon",
    device: "desktop",
    landing_path: shopHome,
    referrer: "https://www.google.com/",
    pages: [
      { path: shopHome, title: "Accueil boutique", minutesAfterStart: 0 },
      { path: shopCatalog, title: "Catalogue", minutesAfterStart: 2 },
      { path: funnelPath, title: "Configurateur", minutesAfterStart: 4 },
    ],
  },
  {
    token: "qb-demo-abandon-atelier",
    hoursAgo: 26,
    durationMin: 18,
    currentStep: 2,
    contact: { name: "Inès Vidal", email: "ines.vidal@atelier-sud.test", company: "Atelier Sud" },
    answers: { project_type: "atelier", surface: 120, height: 4.5 },
    utm_source: "linkedin",
    utm_medium: "social",
    country: "FR",
    city: "Marseille",
    device: "mobile",
    landing_path: shopCatalog,
    referrer: "https://www.linkedin.com/",
    pages: [
      { path: shopCatalog, title: "Catalogue", minutesAfterStart: 0 },
      { path: `${shopHome}/p/rayonnage-mi-lourd`, title: "Fiche produit", minutesAfterStart: 3 },
      { path: funnelPath, title: "Configurateur", minutesAfterStart: 7 },
    ],
  },
  {
    token: "qb-demo-abandon-anonyme",
    hoursAgo: 3,
    durationMin: 4,
    currentStep: 0,
    contact: { name: "", email: "", company: "" },
    answers: { project_type: "commerce" },
    utm_source: "direct",
    utm_medium: null,
    country: "BE",
    city: "Bruxelles",
    device: "desktop",
    landing_path: funnelPath,
    referrer: null,
    pages: [{ path: funnelPath, title: "Configurateur", minutesAfterStart: 0 }],
  },
];

function hoursAgoIso(hours: number) {
  return new Date(Date.now() - hours * 3600 * 1000).toISOString();
}

function minutesAfter(iso: string, minutes: number) {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

export const sessionsModule: SeedModule = {
  id: "sessions",
  title: "Sessions abandonnées",
  async run(ctx) {
    if (!ctx.funnel) throw new Error("Funnel démo requis avant les sessions");

    let created = 0;
    for (const spec of DEMO_SESSIONS) {
      const lastActivity = hoursAgoIso(spec.hoursAgo);
      const startedAt = new Date(new Date(lastActivity).getTime() - spec.durationMin * 60_000).toISOString();
      const visitorId = `qb-demo-abandon-vid-${spec.token}`;
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
        landing_path: spec.landing_path,
        referrer: spec.referrer,
        country: spec.country,
        city: spec.city,
        device: spec.device,
        visitor_id: visitorId,
        last_activity_at: lastActivity,
        created_at: startedAt,
        updated_at: lastActivity,
        submitted_quote_id: null,
      };

      const { data: existing } = await ctx.supabase
        .from("quote_sessions")
        .select("id")
        .eq("token", spec.token)
        .maybeSingle();

      let sessionId = existing?.id;
      if (existing) {
        const { error } = await ctx.supabase.from("quote_sessions").update(payload).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { data, error } = await ctx.supabase.from("quote_sessions").insert(payload).select("id").single();
        if (error || !data) throw error ?? new Error("Session démo introuvable");
        sessionId = data.id;
        created += 1;
      }

      await ctx.supabase.from("analytics_events").delete().eq("session_id", sessionId!);
      await ctx.supabase.from("analytics_events").delete().eq("visitor_id", visitorId);

      type DemoEventRow = {
        organization_id: string;
        configurator_id: string;
        session_id: string | undefined;
        visitor_id: string;
        event_type: string;
        created_at: string;
        payload: Json;
        step: number | null;
      };
      const eventRows: DemoEventRow[] = spec.pages.map((page, index) => ({
        organization_id: ctx.org.id,
        configurator_id: ctx.funnel!.id,
        session_id: sessionId,
        visitor_id: visitorId,
        event_type: ANALYTICS_EVENTS.pageView,
        created_at: minutesAfter(startedAt, page.minutesAfterStart),
        payload: {
          path: page.path,
          title: page.title,
          country: spec.country,
          city: spec.city,
          device: spec.device,
        },
        step: index === spec.pages.length - 1 ? spec.currentStep : null,
      }));
      eventRows.push({
        organization_id: ctx.org.id,
        configurator_id: ctx.funnel.id,
        session_id: sessionId,
        visitor_id: visitorId,
        event_type: ANALYTICS_EVENTS.started,
        created_at: minutesAfter(startedAt, spec.pages[spec.pages.length - 1]?.minutesAfterStart ?? 0),
        payload: { path: funnelPath, country: spec.country, city: spec.city, device: spec.device },
        step: 0,
      });
      if (spec.currentStep > 0) {
        for (let step = 1; step <= spec.currentStep; step += 1) {
          eventRows.push({
            organization_id: ctx.org.id,
            configurator_id: ctx.funnel.id,
            session_id: sessionId,
            visitor_id: visitorId,
            event_type: `quotebuilder_step_${step}`,
            created_at: minutesAfter(startedAt, spec.durationMin - spec.currentStep + step),
            payload: { path: funnelPath, country: spec.country, city: spec.city, device: spec.device } as Json,
            step,
          });
        }
      }
      if (spec.contact.email) {
        eventRows.push({
          organization_id: ctx.org.id,
          configurator_id: ctx.funnel.id,
          session_id: sessionId,
          visitor_id: visitorId,
          event_type: ANALYTICS_EVENTS.email,
          created_at: lastActivity,
          payload: { country: spec.country, city: spec.city, device: spec.device } as Json,
          step: spec.currentStep,
        });
      }

      const { error: eventError } = await ctx.supabase.from("analytics_events").insert(eventRows);
      if (eventError) throw eventError;
    }

    return {
      module: "sessions",
      action: created ? "created" : "updated",
      detail: `${DEMO_SESSIONS.length} abandons (${created} nouveaux)`,
    };
  },
};
