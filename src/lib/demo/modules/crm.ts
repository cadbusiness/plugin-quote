import { seedOrgCrm } from "@/lib/crm/seed";
import type { SeedModule } from "@/lib/demo/types";

export const crmModule: SeedModule = {
  id: "crm",
  title: "Statuts, e-mails, parcours",
  async run(ctx) {
    await seedOrgCrm(ctx.supabase, ctx.org.id);
    return {
      module: "crm",
      action: "updated",
      detail: "quote_statuses + email_templates + workflows (insert-if-missing)",
    };
  },
};
