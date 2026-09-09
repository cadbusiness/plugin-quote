"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Inbox,
  Package,
  PanelsTopLeft,
  Plus,
  Sparkles,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import {
  NotificationsDrawer,
  type HeaderNotification,
} from "@/components/app-shell/notifications-drawer";

type Menu = "action" | "alerts" | "plan" | null;

function ActionLink({
  href,
  icon: Icon,
  children,
  onClick,
}: {
  href: string;
  icon: LucideIcon;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 text-left hover:bg-orange-50"
    >
      <Icon className="h-4 w-4 text-[#E85D04]" strokeWidth={2} />
      {children}
    </Link>
  );
}

export function HeaderActions({
  isAdmin,
  plan,
  notifications,
}: {
  isAdmin: boolean;
  plan: string;
  notifications: HeaderNotification[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState<Menu>(null);
  const root = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((item) => !item.read_at).length;
  const planLabel = plan.trim() || "pro";

  useEffect(() => {
    function onDoc(event: MouseEvent) {
      if (menu === "alerts") return;
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
  }, [menu]);

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
          aria-expanded={menu === "action"}
          aria-haspopup="menu"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#E85D04] px-2.5 py-1.5 text-sm font-medium text-white shadow-sm shadow-orange-900/20 hover:bg-[#d35400]"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
          Action
        </button>
        {menu === "action" ? (
          <div
            role="menu"
            className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-md"
          >
            {isAdmin ? (
              <button
                type="button"
                onClick={createFunnel}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-orange-50"
              >
                <PanelsTopLeft className="h-4 w-4 text-[#E85D04]" strokeWidth={2} />
                Nouveau funnel
              </button>
            ) : null}
            {isAdmin ? (
              <ActionLink href="/produits" icon={Package} onClick={() => setMenu(null)}>
                Catalogue
              </ActionLink>
            ) : null}
            <ActionLink href="/devis" icon={Inbox} onClick={() => setMenu(null)}>
              Demandes
            </ActionLink>
            {isAdmin ? (
              <ActionLink href="/equipe" icon={UserPlus} onClick={() => setMenu(null)}>
                Inviter un membre
              </ActionLink>
            ) : null}
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => toggle("alerts")}
        aria-expanded={menu === "alerts"}
        aria-haspopup="dialog"
        className="relative inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1.5 text-sm font-medium text-rose-700 shadow-sm shadow-rose-900/10 ring-1 ring-rose-200 hover:bg-rose-100"
      >
        <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-rose-700">
          <Bell className="h-3.5 w-3.5" strokeWidth={2.25} />
          {unread ? (
            <span className="absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-600 px-0.5 text-[9px] font-semibold leading-none text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </span>
        Alertes
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => toggle("plan")}
          aria-expanded={menu === "plan"}
          aria-haspopup="dialog"
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-sm font-medium capitalize text-emerald-800 shadow-sm shadow-emerald-900/10 ring-1 ring-emerald-200 hover:bg-emerald-100"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-200/80 text-emerald-800">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.25} />
          </span>
          Plan {planLabel}
        </button>
        {menu === "plan" ? (
          <div className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-md">
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

      {menu === "alerts" ? (
        <NotificationsDrawer
          notifications={notifications}
          unread={unread}
          onClose={() => setMenu(null)}
        />
      ) : null}
    </div>
  );
}
