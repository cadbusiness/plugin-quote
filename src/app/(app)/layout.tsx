import { redirect } from "next/navigation";
import { getOrgContext } from "@/lib/auth/org";
import { AppHeader } from "@/components/app-shell/app-header";
import { AppSidebar } from "@/components/app-shell/app-sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <AppHeader orgName={ctx.organization.name} email={ctx.email} />
      <div className="flex min-h-0 flex-1">
        <AppSidebar />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto">
          <div className="flex min-h-0 w-full flex-1 flex-col px-4 lg:px-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
