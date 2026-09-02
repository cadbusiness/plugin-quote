import { redirect } from "next/navigation";
import { getOrgContext } from "@/lib/auth/org";
import { AppHeader } from "@/components/app-shell/app-header";
import { AppSidebar } from "@/components/app-shell/app-sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/login");

  return (
    <div className="flex min-h-dvh bg-slate-50">
      <AppSidebar orgName={ctx.organization.name} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader email={ctx.email} />
        <main className="flex min-h-0 flex-1 flex-col px-4 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
