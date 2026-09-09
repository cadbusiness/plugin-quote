"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Bell, Inbox, UserPlus, X, type LucideIcon } from "lucide-react";
import { markNotificationsRead } from "@/app/(app)/crm-actions";
import { formatRelative } from "@/lib/format";

export type HeaderNotification = {
  id: string;
  body: string;
  quote_id: string | null;
  type: string;
  created_at: string;
  read_at: string | null;
};

function meta(type: string): { icon: LucideIcon; wrap: string } {
  if (type === "assigned") return { icon: UserPlus, wrap: "bg-violet-50 text-violet-700" };
  if (type === "submitted") return { icon: Inbox, wrap: "bg-orange-50 text-[#C2410C]" };
  return { icon: Bell, wrap: "bg-amber-50 text-amber-800" };
}

export function NotificationsDrawer({
  notifications,
  unread,
  onClose,
}: {
  notifications: HeaderNotification[];
  unread: number;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fermer les notifications"
        className="qb-overlay-in absolute inset-0 bg-slate-950/40"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="notifications-title"
        className="qb-drawer-in absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3 lg:px-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-rose-600">Alertes</p>
            <h2 id="notifications-title" className="mt-0.5 text-base font-semibold text-slate-900">
              Notifications
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {unread === 0
                ? "Tout est à jour"
                : unread === 1
                  ? "1 non lue"
                  : `${unread} non lues`}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-orange-50 hover:text-[#E85D04]"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {unread > 0 ? (
          <form action={markNotificationsRead} className="border-b border-slate-100 px-4 py-2 lg:px-5">
            <button type="submit" className="text-sm font-medium text-[#C2410C] hover:underline">
              Tout marquer lu
            </button>
          </form>
        ) : null}

        {notifications.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <Bell className="h-5 w-5" strokeWidth={2} />
            </span>
            <p className="mt-3 text-sm font-medium text-slate-900">Aucune notification</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Les assignations et nouvelles demandes apparaîtront ici.
            </p>
          </div>
        ) : (
          <ul className="min-h-0 flex-1 overflow-y-auto">
            {notifications.map((item) => {
              const { icon: Icon, wrap } = meta(item.type);
              const unreadItem = !item.read_at;
              const inner = (
                <>
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${wrap}`}>
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm leading-5 ${unreadItem ? "font-medium text-slate-900" : "text-slate-700"}`}>
                      {item.body}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-slate-500">{formatRelative(item.created_at)}</span>
                  </span>
                  {unreadItem ? <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-rose-500" /> : null}
                </>
              );
              const rowClass = `flex w-full items-start gap-3 px-4 py-3 text-left lg:px-5 ${
                unreadItem ? "bg-rose-50/40" : ""
              } hover:bg-orange-50`;
              return (
                <li key={item.id} className="border-b border-slate-100">
                  {item.quote_id ? (
                    <Link href={`/devis/${item.quote_id}`} onClick={onClose} className={rowClass}>
                      {inner}
                    </Link>
                  ) : (
                    <div className={rowClass}>{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </aside>
    </div>,
    document.body,
  );
}
