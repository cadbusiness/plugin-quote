import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/db/database.types";

export type DemoClient = SupabaseClient<Database>;

export type DemoOrg = Database["public"]["Tables"]["organizations"]["Row"];
export type DemoFunnel = Database["public"]["Tables"]["configurators"]["Row"];

export type SeedUsers = {
  owner: User | null;
  sales: User | null;
};

export type SeedContext = {
  supabase: DemoClient;
  org: DemoOrg;
  funnel: DemoFunnel | null;
  users: SeedUsers;
  dryRun: boolean;
};

export type SeedModuleResult = {
  module: string;
  action: "created" | "updated" | "skipped" | "noop";
  detail: string;
};

export type SeedModule = {
  id: string;
  title: string;
  run: (ctx: SeedContext) => Promise<SeedModuleResult | SeedModuleResult[]>;
};

export type SeedReport = {
  version: number;
  orgId: string;
  orgSlug: string;
  modules: SeedModuleResult[];
};

export type JsonMap = Record<string, Json>;
