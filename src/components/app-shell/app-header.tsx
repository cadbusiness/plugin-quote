import { logout } from "@/app/(app)/actions";
import { BrandLogo } from "@/components/brand/brand-logo";

export function AppHeader({
  orgName,
  email,
}: {
  orgName: string;
  email: string | null;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-4 lg:px-6">
      <BrandLogo href="/devis" priority />
      <span className="hidden h-6 w-px bg-slate-200 sm:block" aria-hidden />
      <span className="min-w-0 truncate text-sm text-slate-600">{orgName}</span>
      <div className="flex-1" />
      <form action={logout} className="flex items-center gap-3">
        <span className="max-w-[16rem] truncate text-sm text-slate-500">{email}</span>
        <button type="submit" className="text-sm text-slate-600 hover:text-slate-900">
          Déconnexion
        </button>
      </form>
    </header>
  );
}
