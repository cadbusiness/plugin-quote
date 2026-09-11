import { accountsModule } from "@/lib/demo/modules/accounts";
import { analyticsModule } from "@/lib/demo/modules/analytics";
import { catalogModule } from "@/lib/demo/modules/catalog";
import { crmModule } from "@/lib/demo/modules/crm";
import { funnelModule } from "@/lib/demo/modules/funnel";
import { orgModule } from "@/lib/demo/modules/org";
import { quotesModule } from "@/lib/demo/modules/quotes";
import { segmentsModule } from "@/lib/demo/modules/segments";
import { sessionsModule } from "@/lib/demo/modules/sessions";
import { shopModule } from "@/lib/demo/modules/shop";
import type { SeedModule } from "@/lib/demo/types";
import { WALKTHROUGH_SCREENS } from "@/lib/demo/walkthrough";

export const SEED_MODULES: SeedModule[] = [
  orgModule,
  accountsModule,
  crmModule,
  funnelModule,
  catalogModule,
  quotesModule,
  sessionsModule,
  shopModule,
  segmentsModule,
  analyticsModule,
];

export function seedModuleIds() {
  return SEED_MODULES.map((module) => module.id);
}

export function walkthroughModuleIds() {
  return [...new Set(WALKTHROUGH_SCREENS.map((screen) => screen.seedModule))];
}
