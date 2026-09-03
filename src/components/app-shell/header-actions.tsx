"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { markNotificationsRead } from "@/app/(app)/crm-actions";

type Alert = { id: string; body: string; quote_id: string | null };
type Menu = "action" | "alerts" | "plan" | null;

export function HeaderActions({
  isAdmin,
  plan,
  notifications,
}: {
  isAdmin: boolean;
  plan: string;
  notifications: Alert[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState<Menu>(null);
  const root = useRef<HTMLDivElement>(null);
  const unread = notifications.length;
  const planLabel = plan.trim() || "pro";

  useEffect(() => {
    function onDoc(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setMenu(null);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenu(null);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function toggle(next: Menu) {
    setMenu((current) => (current === next ? null : next));
  }

  function createFunnel() {
    setMenu(null);
    if (pathname === "/funnels") {
      window.dispatchEvent(new Event("qb:create-funnel"));
      return;
    }
    router.push("/funnels#nouveau");
  }

  return (
    <div ref={root} className="flex items-center gap-1.5">
      <div className="relative">
        <button
          type="button"
          onClick={() => toggle("action")}
          className="rounded-md bg-[#E85D04] px-2.5 py-1.5 text-sm font-medium text-white hover:bg-[#d35400]"
        >
          Action
        </button>
        {menu === "action" ? (
          <div className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-sm">
            {isAdmin ? (
              <button
                type="button"
                onClick={createFunnel}
                className="block w-full px-3 py-2 text-left hover:bg-orange-50"
              >
                Nouveau funnel
              </button>
            ) : null}
            {isAdmin ? (
              <Link href="/produits" onClick={() => setMenu(null)} className="block px-3 py-2 hover:bg-orange-50">
                Catalogue
              </Link>
            ) : null}
            <Link href="/devis" onClick={() => setMenu(null)} className="block px-3 py-2 hover:bg-orange-50">
              Demandes
            </Link>
            {isAdmin ? (
              <Link href="/equipe" onClick={() => setMenu(null)} className="block px-3 py-2 hover:bg-orange-50">
                Inviter un membre
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => toggle("alerts")}
          className="relative rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          Alertes
          {unread ? (
            <span className="ml-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-medium text-white">
              {unread}
            </span>
          ) : null}
        </button>
        {menu === "alerts" ? (
          <div className="absolute right-0 z-40 mt-2 w-72 overflow-hidden rounded-lg border border-slate-200 bg-white p-2 text-sm shadow-sm">
            {unread === 0 ? (
              <p className="px-2 py-3 text-slate-500">Aucune notification</p>
            ) : (
              <>
                <form action={markNotificationsRead}>
                  <button type="submit" className="mb-2 px-2 text-xs text-sky-700 underline">
                    Tout marquer lu
                  </button>
                </form>
                <ul className="max-h-64 space-y-1 overflow-auto">
                  {notifications.map((n) => (
                    <li key={n.id}>
                      {n.quote_id ? (
                        <Link
                          href={`/devis/${n.quote_id}`}
                          onClick={() => setMenu(null)}
                          className="block rounded px-2 py-1.5 hover:bg-orange-50"
                        >
                          {n.body}
                        </Link>
                      ) : (
                        <span className="block px-2 py-1.5">{n.body}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ) : null}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => toggle("plan")}
          className="rounded-md bg-emerald-50 px-2.5 py-1.5 text-sm font-medium capitalize text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-100"
        >
          Plan {planLabel}
        </button>
        {menu === "plan" ? (
          <div className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-emerald-700">Abonnement</p>
            <p className="mt-1 font-medium capitalize text-slate-900">Plan {planLabel}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Funnels, catalogue et demandes inclus. La facturation Stripe arrive en phase 2.
            </p>
            <Link
              href="/parametres"
              onClick={() => setMenu(null)}
              className="mt-3 inline-block text-sm text-[#C2410C] hover:underline"
            >
              Voir les paramètres
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
