import Link from "next/link";
import { HeaderActions } from "@/components/app-shell/header-actions";

export function AppHeader({
  orgName,
  plan,
  isAdmin,
  notifications,
}: {
  orgName: string;
  plan: string;
  isAdmin: boolean;
  notifications: { id: string; body: string; quote_id: string | null }[];
}) {
  const initial = (orgName.trim()[0] ?? "Q").toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-end gap-3 border-b border-slate-200 bg-white px-4 lg:px-6">
      <HeaderActions isAdmin={isAdmin} plan={plan} notifications={notifications} />
      <Link
        href="/parametres"
        className="flex min-w-0 items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-orange-50"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-semibold text-white">
          {initial}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block truncate text-sm font-medium text-slate-900">{orgName}</span>
          <span className="block text-[11px] text-slate-500">Paramètres</span>
        </span>
      </Link>
    </header>
  );
}
