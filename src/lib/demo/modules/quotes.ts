import type { Json } from "@/lib/db/database.types";
import type { SeedModule } from "@/lib/demo/types";

type DemoQuoteItem = {
  name: string;
  quantity: number;
  price_min: number;
  price_max: number;
  options?: Record<string, string>;
};

export type DemoQuoteSpec = {
  contact_name: string;
  contact_email: string;
  contact_company: string;
  contact_phone: string;
  score: number;
  score_label: "hot" | "warm" | "cold";
  status: string;
  status_slug: string;
  assignToSales?: boolean;
  daysAgo: number;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  answers: Record<string, Json>;
  items: DemoQuoteItem[];
  note: string | null;
  message: string | null;
};

export const DEMO_QUOTES: DemoQuoteSpec[] = [
  {
    contact_name: "Claire Martin",
    contact_email: "claire.martin@atelier-nord.test",
    contact_company: "Atelier Nord",
    contact_phone: "06 12 34 56 01",
    score: 86,
    score_label: "hot",
    status: "new",
    status_slug: "new",
    assignToSales: true,
    daysAgo: 1,
    utm_source: "linkedin",
    utm_medium: "social",
    utm_campaign: "atelier-q3",
    referrer: "https://www.linkedin.com/",
    answers: {
      project_type: "atelier",
      surface: 180,
      height: 5.5,
      load: "medium",
      notes: "Besoin de ranger outillage et pièces, allée chariot 1,20 m.",
    },
    items: [
      { name: "Rayonnage mi-lourd", quantity: 6, price_min: 420, price_max: 580, options: { finition: "Galvanisé" } },
      { name: "Plateau mélaminé 1200×800", quantity: 18, price_min: 38, price_max: 52 },
    ],
    note: "Premier contact LinkedIn. Relancer lundi avec un plan d’implantation.",
    message: "Pouvez-vous passer à l’atelier mardi matin ?",
  },
  {
    contact_name: "Thomas Berger",
    contact_email: "thomas.berger@logispace.test",
    contact_company: "LogiSpace",
    contact_phone: "06 12 34 56 02",
    score: 64,
    score_label: "warm",
    status: "contacted",
    status_slug: "contacted",
    assignToSales: true,
    daysAgo: 4,
    utm_source: "google",
    utm_medium: "organic",
    utm_campaign: null,
    referrer: "https://www.google.com/",
    answers: {
      project_type: "entrepot",
      surface: 90,
      height: 6,
      load: "light",
      notes: "Petite réserve, picking fréquent.",
    },
    items: [{ name: "Rayonnage picking", quantity: 4, price_min: 310, price_max: 390, options: { niveaux: "4" } }],
    note: "Appelé le 02/09. Envoie un plan de la réserve cette semaine.",
    message: null,
  },
  {
    contact_name: "Léa Moreau",
    contact_email: "lea.moreau@rivage.test",
    contact_company: "Hôtel Rivage",
    contact_phone: "06 12 34 56 03",
    score: 91,
    score_label: "hot",
    status: "in_progress",
    status_slug: "in_progress",
    assignToSales: true,
    daysAgo: 2,
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "hotel-cuisine-2026",
    referrer: "https://www.google.com/",
    answers: {
      project_type: "commerce",
      surface: 420,
      height: 3.8,
      load: "heavy",
      notes: "Rénovation réserve cuisine, 80 couverts. Accès par monte-charge 1,20 m.",
    },
    items: [
      { name: "Rayonnage alimentaire inox", quantity: 8, price_min: 3200, price_max: 4200, options: { finition: "Inox 304" } },
      { name: "Rayonnage picking", quantity: 3, price_min: 900, price_max: 1400 },
    ],
    note: "Cuisine existante à démonter. Devis avant le 15/09 pour le comité.",
    message: "Pouvez-vous passer sur site mercredi matin ?",
  },
  {
    contact_name: "Hugo Pernot",
    contact_email: "hugo.pernot@transalpes.test",
    contact_company: "Transalpes Logistique",
    contact_phone: "06 12 34 56 04",
    score: 78,
    score_label: "hot",
    status: "waiting",
    status_slug: "waiting",
    daysAgo: 6,
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "entrepot-savoie",
    referrer: "https://www.google.com/",
    answers: {
      project_type: "entrepot",
      surface: 2400,
      height: 11,
      load: "heavy",
      notes: "Hall existant, 4 quais. Besoin d’une mezzanine pour pièces détachées.",
    },
    items: [
      { name: "Rayonnage palettes lourd", quantity: 24, price_min: 4500, price_max: 6200 },
      { name: "Mezzanine de stockage", quantity: 1, price_min: 8900, price_max: 12000 },
    ],
    note: "En attente du plan DWG du bureau d’études.",
    message: null,
  },
  {
    contact_name: "Nadia Khelifi",
    contact_email: "nadia.khelifi@maison-verte.test",
    contact_company: "Maison Verte",
    contact_phone: "06 12 34 56 05",
    score: 72,
    score_label: "warm",
    status: "won",
    status_slug: "won",
    assignToSales: true,
    daysAgo: 18,
    utm_source: "referral",
    utm_medium: "partner",
    utm_campaign: "architecte-lyon",
    referrer: null,
    answers: {
      project_type: "commerce",
      surface: 140,
      height: 4.2,
      load: "medium",
      notes: "Boutique bio, réserve + expo.",
    },
    items: [{ name: "Rayonnage mi-lourd", quantity: 10, price_min: 1800, price_max: 2400 }],
    note: "Commande signée. Pose semaine 42.",
    message: "Parfait, on valide la variante gris RAL 7035.",
  },
  {
    contact_name: "Marc Dufour",
    contact_email: "marc.dufour@brico-est.test",
    contact_company: "Brico Est",
    contact_phone: "06 12 34 56 06",
    score: 38,
    score_label: "cold",
    status: "lost",
    status_slug: "lost",
    daysAgo: 22,
    utm_source: "facebook",
    utm_medium: "social",
    utm_campaign: null,
    referrer: "https://www.facebook.com/",
    answers: {
      project_type: "atelier",
      surface: 40,
      height: 3,
      load: "light",
      notes: "Budget très serré, compare avec du matériel d’occasion.",
    },
    items: [{ name: "Rayonnage picking", quantity: 2, price_min: 900, price_max: 1100 }],
    note: "Perdu : a pris de l’occasion. Relancer dans 6 mois.",
    message: null,
  },
  {
    contact_name: "Sophie Lambert",
    contact_email: "sophie.lambert@archives-metro.test",
    contact_company: "Archives Métropole",
    contact_phone: "06 12 34 56 07",
    score: 55,
    score_label: "warm",
    status: "new",
    status_slug: "new",
    daysAgo: 0,
    utm_source: "google",
    utm_medium: "organic",
    utm_campaign: null,
    referrer: "https://www.quotebuilder.co/",
    answers: {
      project_type: "archive",
      surface: 320,
      height: 3.2,
      load: "light",
      notes: "Dossiers administratifs, allées étroites.",
    },
    items: [{ name: "Rayonnage picking", quantity: 14, price_min: 900, price_max: 1300 }],
    note: null,
    message: "Faut-il un avis SSI pour les archives ?",
  },
];

function daysAgoIso(days: number, hours = 10) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  date.setUTCHours(hours, 15, 0, 0);
  return date.toISOString();
}

export const quotesModule: SeedModule = {
  id: "quotes",
  title: "Demandes, scores, pipeline",
  async run(ctx) {
    if (!ctx.funnel) throw new Error("Funnel démo requis avant les devis");

    const { data: statuses } = await ctx.supabase
      .from("quote_statuses")
      .select("id, slug, label")
      .eq("organization_id", ctx.org.id);
    const statusBySlug = new Map((statuses ?? []).map((row) => [row.slug, row]));

    const { data: existing } = await ctx.supabase
      .from("quotes")
      .select("id, contact_email")
      .eq("organization_id", ctx.org.id);
    const byEmail = new Map((existing ?? []).map((row) => [row.contact_email, row.id]));

    let created = 0;
    for (const spec of DEMO_QUOTES) {
      const status = statusBySlug.get(spec.status_slug);
      const createdAt = daysAgoIso(spec.daysAgo);
      const row = {
        organization_id: ctx.org.id,
        configurator_id: ctx.funnel.id,
        contact_name: spec.contact_name,
        contact_email: spec.contact_email,
        contact_company: spec.contact_company,
        contact_phone: spec.contact_phone,
        score: spec.score,
        score_label: spec.score_label,
        status: spec.status,
        status_id: status?.id ?? null,
        assigned_to: spec.assignToSales ? ctx.users.sales?.id ?? null : null,
        answers: spec.answers as Json,
        extracted_params: {} as Json,
        utm_source: spec.utm_source,
        utm_medium: spec.utm_medium,
        utm_campaign: spec.utm_campaign,
        referrer: spec.referrer,
        created_at: createdAt,
      };

      let quoteId = byEmail.get(spec.contact_email);
      if (quoteId) {
        const { error } = await ctx.supabase.from("quotes").update(row).eq("id", quoteId);
        if (error) throw error;
      } else {
        const { data, error } = await ctx.supabase.from("quotes").insert(row).select("id").single();
        if (error || !data) throw error ?? new Error(spec.contact_email);
        quoteId = data.id;
        byEmail.set(spec.contact_email, quoteId);
        created += 1;
      }

      if (spec.assignToSales && ctx.users.sales) {
        const { data: assignee } = await ctx.supabase
          .from("quote_assignees")
          .select("quote_id")
          .eq("quote_id", quoteId)
          .eq("user_id", ctx.users.sales.id)
          .maybeSingle();
        if (!assignee) {
          const { error } = await ctx.supabase.from("quote_assignees").insert({
            organization_id: ctx.org.id,
            quote_id: quoteId,
            user_id: ctx.users.sales.id,
          });
          if (error) throw error;
        }
      }

      const { count: itemCount } = await ctx.supabase
        .from("quote_items")
        .select("id", { count: "exact", head: true })
        .eq("quote_id", quoteId);
      if (!(itemCount ?? 0) && spec.items.length) {
        const { error } = await ctx.supabase.from("quote_items").insert(
          spec.items.map((item) => ({
            organization_id: ctx.org.id,
            quote_id: quoteId,
            name: item.name,
            quantity: item.quantity,
            price_min: item.price_min,
            price_max: item.price_max,
            options: item.options ?? {},
          })),
        );
        if (error) throw error;
      }

      const { count: noteCount } = await ctx.supabase
        .from("quote_notes")
        .select("id", { count: "exact", head: true })
        .eq("quote_id", quoteId);
      if (!(noteCount ?? 0) && spec.note) {
        const { error } = await ctx.supabase.from("quote_notes").insert({
          organization_id: ctx.org.id,
          quote_id: quoteId,
          author_id: ctx.users.sales?.id ?? null,
          content: spec.note,
        });
        if (error) throw error;
      }

      const { count: activityCount } = await ctx.supabase
        .from("quote_activities")
        .select("id", { count: "exact", head: true })
        .eq("quote_id", quoteId);
      if (!(activityCount ?? 0)) {
        const submitted = new Date(createdAt);
        const later = new Date(submitted.getTime() + 36 * 60 * 1000);
        const { error } = await ctx.supabase.from("quote_activities").insert([
          {
            organization_id: ctx.org.id,
            quote_id: quoteId,
            type: "submitted",
            payload: { score: spec.score, label: spec.score_label },
            created_at: submitted.toISOString(),
          },
          {
            organization_id: ctx.org.id,
            quote_id: quoteId,
            type: "email_sent",
            payload: { template_kind: "prospect_confirm" },
            created_at: new Date(submitted.getTime() + 2 * 60 * 1000).toISOString(),
          },
          {
            organization_id: ctx.org.id,
            quote_id: quoteId,
            type: "status_changed",
            payload: { status: spec.status_slug, label: status?.label ?? spec.status_slug },
            created_at: later.toISOString(),
          },
        ]);
        if (error) throw error;
      }

      const { count: messageCount } = await ctx.supabase
        .from("prospect_messages")
        .select("id", { count: "exact", head: true })
        .eq("quote_id", quoteId);
      if (!(messageCount ?? 0) && spec.message) {
        const { error } = await ctx.supabase.from("prospect_messages").insert({
          organization_id: ctx.org.id,
          quote_id: quoteId,
          sender: "prospect",
          content: spec.message,
        });
        if (error) throw error;
      }
    }

    return {
      module: "quotes",
      action: created ? "created" : "updated",
      detail: `${DEMO_QUOTES.length} demandes (${created} nouvelles)`,
    };
  },
};
