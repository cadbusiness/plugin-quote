import { logout } from "@/app/(app)/actions";

export function AppHeader({ email }: { email: string | null }) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-end border-b border-slate-200 bg-white px-4 lg:px-6">
      <form action={logout} className="flex items-center gap-3">
        <span className="max-w-[16rem] truncate text-xs text-slate-500">{email}</span>
        <button type="submit" className="text-sm text-slate-700 underline">
          Déconnexion
        </button>
      </form>
    </header>
  );
}
