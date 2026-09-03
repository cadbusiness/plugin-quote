import { redirect } from "next/navigation";
import { getAuthUser, getOrgContext, isAdminRole } from "@/lib/auth/org";
import { isSuperAdmin } from "@/lib/auth/platform";
import { AppHeader } from "@/components/app-shell/app-header";
import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getOrgContext();
  const user = await getAuthUser();
  if (!ctx) redirect(isSuperAdmin(user) ? "/admin" : "/onboarding");
  const supabase = await createClient();
  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, body, quote_id")
    .eq("user_id", ctx.userId)
    .is("read_at", null)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <AppHeader
        orgName={ctx.organization.name}
        email={ctx.email}
        notifications={notifications ?? []}
      />
      <div className="flex min-h-0 flex-1">
        <AppSidebar isAdmin={isAdminRole(ctx.role)} isPlatformAdmin={isSuperAdmin(user)} />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto">
          <div className="flex min-h-0 w-full flex-1 flex-col px-4 lg:px-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
