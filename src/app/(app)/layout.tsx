import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthUser, getOrgContext, isAdminRole } from "@/lib/auth/org";
import { isSuperAdmin } from "@/lib/auth/platform";
import { AppFooter } from "@/components/app-shell/app-footer";
import { AppHeader } from "@/components/app-shell/app-header";
import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { createClient } from "@/lib/supabase/server";
import { getSidebarSnapshot } from "@/lib/crm/sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getOrgContext();
  const user = await getAuthUser();
  const sidebarCollapsed = (await cookies()).get("qb-sidebar")?.value === "1";
  if (!ctx) redirect(isSuperAdmin(user) ? "/admin" : "/onboarding");
  const supabase = await createClient();
  const [{ data: notifications }, snapshot] = await Promise.all([
    supabase
      .from("notifications")
      .select("id, body, quote_id")
      .eq("user_id", ctx.userId)
      .is("read_at", null)
      .order("created_at", { ascending: false })
      .limit(20),
    getSidebarSnapshot(supabase, ctx.organization.id),
  ]);

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50">
      <AppSidebar
        isAdmin={isAdminRole(ctx.role)}
        isPlatformAdmin={isSuperAdmin(user)}
        email={ctx.email}
        snapshot={snapshot}
        collapsed={sidebarCollapsed}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AppHeader
          orgName={ctx.organization.name}
          plan={ctx.organization.plan}
          isAdmin={isAdminRole(ctx.role)}
          notifications={notifications ?? []}
        />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 w-full flex-1 flex-col overflow-auto px-4 lg:px-6">{children}</div>
          <AppFooter />
        </main>
      </div>
    </div>
  );
}
