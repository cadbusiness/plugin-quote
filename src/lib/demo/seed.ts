import type { User } from "@supabase/supabase-js";
import { DEMO_FUNNEL_SLUG, DEMO_ORG, DEMO_OWNER_EMAIL, DEMO_SALES_EMAIL, DEMO_SEED_VERSION } from "@/lib/demo/constants";
import { ensureDemoOrg } from "@/lib/demo/modules/org";
import { SEED_MODULES } from "@/lib/demo/registry";
import type { DemoClient, SeedContext, SeedModuleResult, SeedReport } from "@/lib/demo/types";

async function hydrateContext(ctx: SeedContext) {
  const { data: funnel } = await ctx.supabase
    .from("configurators")
    .select("*")
    .eq("organization_id", ctx.org.id)
    .eq("slug", DEMO_FUNNEL_SLUG)
    .maybeSingle();
  ctx.funnel = funnel;

  const { data: members } = await ctx.supabase
    .from("memberships")
    .select("user_id, role, invited_email")
    .eq("organization_id", ctx.org.id)
    .eq("status", "active");

  for (const member of members ?? []) {
    if (!member.user_id) continue;
    const stub = { id: member.user_id, email: member.invited_email ?? undefined } as User;
    if (member.role === "owner" || member.invited_email === DEMO_OWNER_EMAIL) ctx.users.owner = stub;
    if (member.role === "sales" || member.invited_email === DEMO_SALES_EMAIL) ctx.users.sales = stub;
  }
}

export async function runDemoSeed(
  supabase: DemoClient,
  options: { only?: string[] } = {},
): Promise<SeedReport> {
  const { org } = await ensureDemoOrg(supabase);
  const wanted = options.only?.length ? new Set(options.only) : null;
  const modules = wanted ? SEED_MODULES.filter((module) => wanted.has(module.id)) : SEED_MODULES;
  if (wanted && !modules.length) {
    throw new Error(`Aucun module pour --only=${[...wanted].join(",")}`);
  }

  const ctx: SeedContext = {
    supabase,
    org,
    funnel: null,
    users: { owner: null, sales: null },
    dryRun: false,
  };
  await hydrateContext(ctx);

  const results: SeedModuleResult[] = [];
  for (const module of modules) {
    const output = await module.run(ctx);
    results.push(...(Array.isArray(output) ? output : [output]));
  }

  return {
    version: DEMO_SEED_VERSION,
    orgId: org.id,
    orgSlug: DEMO_ORG.slug,
    modules: results,
  };
}
