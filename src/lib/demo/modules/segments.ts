import type { Json } from "@/lib/db/database.types";
import type { SegmentRules } from "@/lib/segments/types";
import type { SeedModule } from "@/lib/demo/types";

export const DEMO_SEGMENTS: { name: string; description: string; rules: SegmentRules }[] = [
  {
    name: "Prospects chauds",
    description: "Score hot — à rappeler en priorité.",
    rules: { all: [{ field: "score_label", op: "eq", value: "hot" }] },
  },
  {
    name: "B2B",
    description: "Demandes avec une société renseignée.",
    rules: { all: [{ field: "audience", op: "eq", value: "b2b" }] },
  },
  {
    name: "Projets entrepôt",
    description: "Type d’espace = entrepôt.",
    rules: { all: [{ field: "answer", op: "eq", value: "entrepot", answerKey: "project_type" }] },
  },
];

export const segmentsModule: SeedModule = {
  id: "segments",
  title: "Segmentation",
  async run(ctx) {
    const { data: existing } = await ctx.supabase
      .from("contact_segments")
      .select("id, name")
      .eq("organization_id", ctx.org.id);
    const byName = new Map((existing ?? []).map((row) => [row.name, row.id]));

    let created = 0;
    for (const segment of DEMO_SEGMENTS) {
      const payload = {
        organization_id: ctx.org.id,
        name: segment.name,
        description: segment.description,
        rules: segment.rules as unknown as Json,
        created_by: ctx.users.owner?.id ?? null,
      };
      const id = byName.get(segment.name);
      if (id) {
        const { error } = await ctx.supabase.from("contact_segments").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await ctx.supabase.from("contact_segments").insert(payload);
        if (error) throw error;
        created += 1;
      }
    }

    return {
      module: "segments",
      action: created ? "created" : "updated",
      detail: `${DEMO_SEGMENTS.length} segments`,
    };
  },
};
