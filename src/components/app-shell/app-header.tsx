import Link from "next/link";
import { markNotificationsRead } from "@/app/(app)/crm-actions";
import { BrandLogo } from "@/components/brand/brand-logo";

export function AppHeader({
  notifications,
}: {
  notifications: { id: string; body: string; quote_id: string | null }[];
}) {
  const unread = notifications.length;
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-4 lg:px-6">
      <BrandLogo href="/accueil" priority />
      <div className="flex-1" />
      <details className="relative">
        <summary className="cursor-pointer list-none text-sm text-slate-600 hover:text-slate-900">
          Alertes{unread ? ` (${unread})` : ""}
        </summary>
        <div className="absolute right-0 z-40 mt-2 w-72 border border-slate-200 bg-white p-2 text-sm shadow-sm">
          {unread === 0 ? (
            <p className="px-2 py-3 text-slate-500">Aucune notification</p>
          ) : (
            <>
              <form action={markNotificationsRead}>
                <button className="mb-2 text-xs underline">Tout marquer lu</button>
              </form>
              <ul className="max-h-64 space-y-1 overflow-auto">
                {notifications.map((n) => (
                  <li key={n.id}>
                    {n.quote_id ? (
                      <Link href={`/devis/${n.quote_id}`} className="block px-2 py-1 hover:bg-slate-50">
                        {n.body}
                      </Link>
                    ) : (
                      <span className="block px-2 py-1">{n.body}</span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </details>
    </header>
  );
}
