import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthUser, getOrgContext, isAdminRole } from "@/lib/auth/org";
import { isSuperAdmin } from "@/lib/auth/platform";
import { AppFooter } from "@/components/app-shell/app-footer";
import { AppHeader } from "@/components/app-shell/app-header";
import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { createClient } from "@/lib/supabase/server";
import { EMPTY_SIDEBAR_SNAPSHOT, getSidebarSnapshot } from "@/lib/crm/sidebar";
import { UPDATES_SEEN_COOKIE } from "@/lib/updates/seed";
import { countUnreadProductUpdates } from "@/lib/updates/resolve";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [ctx, user, cookieStore] = await Promise.all([getOrgContext(), getAuthUser(), cookies()]);
  const sidebarCollapsed = cookieStore.get("qb-sidebar")?.value === "1";
  if (!ctx) redirect(isSuperAdmin(user) ? "/admin" : "/onboarding");

  const sidebarProps = {
    isAdmin: isAdminRole(ctx.role),
    isPlatformAdmin: isSuperAdmin(user),
    email: ctx.email,
    collapsed: sidebarCollapsed,
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50">
      <Suspense fallback={<AppSidebar {...sidebarProps} snapshot={EMPTY_SIDEBAR_SNAPSHOT} />}>
        <SidebarWithSnapshot
          orgId={ctx.organization.id}
          userId={ctx.userId}
          seenCookie={cookieStore.get(UPDATES_SEEN_COOKIE)?.value ?? null}
          {...sidebarProps}
        />
      </Suspense>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Suspense
          fallback={
            <AppHeader
              orgName={ctx.organization.name}
              plan={ctx.organization.plan}
              isAdmin={isAdminRole(ctx.role)}
              notifications={[]}
            />
          }
        >
          <HeaderWithNotifications
            orgName={ctx.organization.name}
            plan={ctx.organization.plan}
            isAdmin={isAdminRole(ctx.role)}
            userId={ctx.userId}
          />
        </Suspense>
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 w-full flex-1 flex-col overflow-auto px-4 lg:px-6">{children}</div>
          <AppFooter />
        </main>
      </div>
    </div>
  );
}

async function SidebarWithSnapshot({
  orgId,
  userId,
  seenCookie,
  ...props
}: {
  orgId: string;
  userId: string;
  seenCookie: string | null;
  isAdmin: boolean;
  isPlatformAdmin: boolean;
  email: string | null;
  collapsed: boolean;
}) {
  const supabase = await createClient();
  const [snapshot, unreadUpdates] = await Promise.all([
    getSidebarSnapshot(supabase, orgId),
    countUnreadProductUpdates(supabase, userId, seenCookie),
  ]);
  return <AppSidebar {...props} snapshot={snapshot} unreadUpdates={unreadUpdates} />;
}

async function HeaderWithNotifications({
  orgName,
  plan,
  isAdmin,
  userId,
}: {
  orgName: string;
  plan: string;
  isAdmin: boolean;
  userId: string;
}) {
  const supabase = await createClient();
  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, body, quote_id, type, created_at, read_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  return <AppHeader orgName={orgName} plan={plan} isAdmin={isAdmin} notifications={notifications ?? []} />;
}
