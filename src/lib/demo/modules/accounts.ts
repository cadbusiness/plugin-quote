import type { User } from "@supabase/supabase-js";
import {
  DEMO_ACCOUNTS,
  DEMO_OWNER_EMAIL,
  DEMO_SALES_EMAIL,
  requireDemoPassword,
} from "@/lib/demo/constants";
import type { DemoClient, SeedModule, SeedUsers } from "@/lib/demo/types";

async function findUserByEmail(supabase: DemoClient, email: string): Promise<User | null> {
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((user) => user.email === email);
    if (found) return found;
    if (data.users.length < 200) return null;
  }
  return null;
}

async function upsertDemoUser(
  supabase: DemoClient,
  email: string,
  password: string,
  appMetadata: Record<string, string>,
) {
  const payload = { email, password, email_confirm: true, app_metadata: appMetadata };
  const { data: created, error: createError } = await supabase.auth.admin.createUser(payload);
  if (!createError && created.user) return created.user;

  const existing = await findUserByEmail(supabase, email);
  if (!existing) throw createError ?? new Error(`Utilisateur introuvable: ${email}`);

  const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(existing.id, payload);
  if (updateError || !updated.user) throw updateError ?? new Error(`Impossible de mettre à jour ${email}`);
  return updated.user;
}

export async function ensureDemoUsers(supabase: DemoClient): Promise<SeedUsers> {
  const password = requireDemoPassword();
  const users: SeedUsers = { owner: null, sales: null };

  for (const account of DEMO_ACCOUNTS) {
    const user = await upsertDemoUser(
      supabase,
      account.email,
      password,
      account.platform ? { role: account.platform } : {},
    );
    if (account.email === DEMO_OWNER_EMAIL) users.owner = user;
    if (account.email === DEMO_SALES_EMAIL) users.sales = user;
  }
  return users;
}

export const accountsModule: SeedModule = {
  id: "accounts",
  title: "Comptes et memberships",
  async run(ctx) {
    const users = await ensureDemoUsers(ctx.supabase);
    ctx.users = users;

    const memberships = DEMO_ACCOUNTS.flatMap((account) =>
      account.role ? [{ email: account.email, role: account.role }] : [],
    );
    for (const account of memberships) {
      const user = account.email === DEMO_OWNER_EMAIL ? users.owner : users.sales;
      if (!user) continue;
      const { data: existing } = await ctx.supabase
        .from("memberships")
        .select("id, role, status")
        .eq("organization_id", ctx.org.id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (existing) {
        if (existing.role !== account.role || existing.status !== "active") {
          const { error } = await ctx.supabase
            .from("memberships")
            .update({ role: account.role, status: "active" })
            .eq("id", existing.id);
          if (error) throw error;
        }
        continue;
      }
      const { error } = await ctx.supabase.from("memberships").insert({
        organization_id: ctx.org.id,
        user_id: user.id,
        role: account.role,
        status: "active",
      });
      if (error) throw error;
    }

    return {
      module: "accounts",
      action: "updated",
      detail: DEMO_ACCOUNTS.map((account) => account.email).join(", "),
    };
  },
};
