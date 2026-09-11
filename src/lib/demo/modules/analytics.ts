import { ANALYTICS_EVENTS } from "@/lib/stats/events";
import type { SeedModule } from "@/lib/demo/types";

const VISITOR_PREFIX = "qb-demo-visitor-";

function dayStamp(daysAgo: number, hour: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  date.setUTCHours(hour, 20, 0, 0);
  return date.toISOString();
}

export const analyticsModule: SeedModule = {
  id: "analytics",
  title: "Événements stats",
  async run(ctx) {
    if (!ctx.funnel) throw new Error("Funnel démo requis avant les stats");

    const { count } = await ctx.supabase
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", ctx.org.id)
      .like("visitor_id", `${VISITOR_PREFIX}%`);
    if ((count ?? 0) > 0) {
      return { module: "analytics", action: "skipped", detail: "Événements démo déjà présents" };
    }

    const rows = [];
    for (let day = 1; day <= 21; day += 1) {
      const visitors = 3 + (day % 4);
      for (let i = 0; i < visitors; i += 1) {
        const visitorId = `${VISITOR_PREFIX}${day}-${i}`;
        const viewAt = dayStamp(day, 8 + i);
        rows.push({
          organization_id: ctx.org.id,
          configurator_id: ctx.funnel.id,
          visitor_id: visitorId,
          event_type: ANALYTICS_EVENTS.pageView,
          created_at: viewAt,
          payload: { path: `/c/${ctx.org.slug}/${ctx.funnel.slug}` },
        });
        if (i < visitors - 1) {
          rows.push({
            organization_id: ctx.org.id,
            configurator_id: ctx.funnel.id,
            visitor_id: visitorId,
            event_type: ANALYTICS_EVENTS.started,
            created_at: dayStamp(day, 9 + i),
            payload: {},
          });
        }
        if (i === 0) {
          rows.push({
            organization_id: ctx.org.id,
            configurator_id: ctx.funnel.id,
            visitor_id: visitorId,
            event_type: ANALYTICS_EVENTS.email,
            created_at: dayStamp(day, 10),
            payload: {},
          });
        }
        if (i === 0 && day % 3 === 0) {
          rows.push({
            organization_id: ctx.org.id,
            configurator_id: ctx.funnel.id,
            visitor_id: visitorId,
            event_type: ANALYTICS_EVENTS.submitted,
            created_at: dayStamp(day, 11),
            payload: {},
          });
        }
        if (i === 1 && day % 4 === 0) {
          rows.push({
            organization_id: ctx.org.id,
            configurator_id: ctx.funnel.id,
            visitor_id: visitorId,
            event_type: ANALYTICS_EVENTS.abandoned,
            created_at: dayStamp(day, 12),
            payload: {},
          });
        }
      }
    }

    const { error } = await ctx.supabase.from("analytics_events").insert(rows);
    if (error) throw error;
    return { module: "analytics", action: "created", detail: `${rows.length} événements sur 21 jours` };
  },
};
