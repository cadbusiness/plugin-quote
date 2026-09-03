import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/(app)/actions";
import { AppFooter } from "@/components/app-shell/app-footer";
import { BrandLogo } from "@/components/brand/brand-logo";
import { getAuthUser, getOrgContext } from "@/lib/auth/org";
import { isSuperAdmin } from "@/lib/auth/platform";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  if (!isSuperAdmin(user)) redirect("/login?next=/admin");
  const ctx = await getOrgContext();

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-slate-50">
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-4 lg:px-6">
        <BrandLogo href="/admin" priority />
        <span className="hidden h-6 w-px bg-slate-200 sm:block" aria-hidden />
        <span className="text-sm text-slate-600">Super admin</span>
        <div className="flex-1" />
        {ctx ? (
          <Link href="/accueil" className="text-sm text-slate-600 hover:text-slate-900">
            Espace {ctx.organization.name}
          </Link>
        ) : null}
        <form action={logout} className="flex items-center gap-3">
          <span className="max-w-[16rem] truncate text-sm text-slate-500">{user?.email}</span>
          <button type="submit" className="text-sm text-slate-600 hover:text-slate-900">
            Déconnexion
          </button>
        </form>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-52 shrink-0 flex-col border-r border-slate-200 bg-white lg:w-56">
          <nav className="flex flex-col gap-0.5 px-2 py-3">
            <Link
              href="/admin"
              className="rounded-lg bg-slate-100 px-2.5 py-2 text-sm font-medium text-slate-900"
            >
              Espaces
            </Link>
          </nav>
        </aside>
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 w-full flex-1 flex-col overflow-auto px-4 lg:px-6">{children}</div>
          <AppFooter />
        </main>
      </div>
    </div>
  );
}
