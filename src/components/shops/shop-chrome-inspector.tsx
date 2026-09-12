"use client";

import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { footerNav, headerNav, replaceNavLocation } from "@/lib/shops/seo";
import type { ShopNavDraft } from "@/lib/shops/types";

export function ShopChromeInspector({
  chrome,
  name,
  nav,
  onName,
  onNav,
  onChat,
}: {
  chrome: "header" | "footer";
  name: string;
  nav: ShopNavDraft[];
  onName: (name: string) => void;
  onNav: (nav: ShopNavDraft[]) => void;
  onChat: () => void;
}) {
  const location = chrome;
  const items = location === "header" ? headerNav(nav) : footerNav(nav);

  function patchItem(index: number, patch: { label?: string; href?: string }) {
    onNav(
      replaceNavLocation(
        nav,
        location,
        items.map((item, i) =>
          i === index
            ? { label: patch.label ?? item.label, href: patch.href ?? item.href }
            : { label: item.label, href: item.href },
        ),
      ),
    );
  }

  function removeItem(index: number) {
    onNav(
      replaceNavLocation(
        nav,
        location,
        items.filter((_, i) => i !== index).map((item) => ({ label: item.label, href: item.href })),
      ),
    );
  }

  function addItem() {
    onNav(replaceNavLocation(nav, location, [...items.map((item) => ({ label: item.label, href: item.href })), { label: "Nouveau", href: "/" }]));
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-slate-100 px-3">
        <p className="truncate text-sm font-medium text-slate-900">{location === "header" ? "En-tête" : "Pied de page"}</p>
        <button
          type="button"
          onClick={onChat}
          className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[#C2410C] hover:bg-orange-50"
        >
          <MessageSquare className="h-3.5 w-3.5" aria-hidden />
          Chat
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-3">
        {location === "header" ? (
          <label className="block text-sm">
            <span className="font-medium text-slate-900">Nom de la boutique</span>
            <input
              value={name}
              onChange={(event) => onName(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        ) : null}
        <div>
          <p className="text-sm font-medium text-slate-900">{location === "header" ? "Liens du menu" : "Liens du pied"}</p>
          <div className="mt-2 space-y-2">
            {items.map((item, index) => (
              <div key={`${location}-${index}`} className="flex items-start gap-2">
                <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
                  <input
                    value={item.label}
                    aria-label="Libellé"
                    onChange={(event) => patchItem(index, { label: event.target.value })}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  />
                  <input
                    value={item.href}
                    aria-label="Lien"
                    onChange={(event) => patchItem(index, { href: event.target.value })}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="button"
                  aria-label="Retirer le lien"
                  onClick={() => removeItem(index)}
                  className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-50 hover:text-slate-800"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addItem}
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[#C2410C] hover:underline"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Ajouter un lien
          </button>
        </div>
      </div>
    </div>
  );
}
