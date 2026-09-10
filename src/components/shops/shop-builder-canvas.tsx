"use client";

import { Puck, createUsePuck } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import type { Data } from "@puckeditor/core";
import { ChevronLeft } from "lucide-react";
import { useState, type ReactNode } from "react";
import { parseLayout } from "@/lib/shops/layout";
import { shopPuckConfig } from "@/lib/shops/puck-config";
import { footerNav, headerNav, themeStyle } from "@/lib/shops/seo";
import type { ShopLayout, StorefrontModel } from "@/lib/shops/types";

const usePuckUi = createUsePuck();

const VIEWPORTS = [
  { width: 1280, height: "auto" as const, label: "Desktop", icon: "Monitor" as const },
  { width: 768, height: "auto" as const, label: "Tablette", icon: "Tablet" as const },
  { width: 390, height: "auto" as const, label: "Mobile", icon: "Smartphone" as const },
];

const NODE_LABEL: Record<string, string> = {
  Section: "Section",
  Columns: "Colonnes",
  Heading: "Titre",
  Text: "Texte",
  Image: "Image",
  Button: "Bouton",
  Hero: "Bandeau",
  Catalog: "Grille produits",
  Categories: "Menu catégories",
  QuoteCta: "Demande de devis",
  Faq: "Questions fréquentes",
  Features: "Points forts",
  Legal: "Texte légal",
};

function ViewportBar() {
  const viewports = usePuckUi((s) => s.appState.ui.viewports);
  const dispatch = usePuckUi((s) => s.dispatch);
  const current = viewports?.current?.width;
  return (
    <div className="flex shrink-0 items-center gap-1 border-b border-slate-200 bg-white px-3 py-1.5">
      {VIEWPORTS.map((viewport) => {
        const active = current === viewport.width;
        return (
          <button
            key={viewport.width}
            type="button"
            onClick={() =>
              dispatch({
                type: "setUi",
                ui: {
                  viewports: {
                    ...viewports,
                    current: { width: viewport.width, height: "auto" },
                  },
                },
              })
            }
            className={`rounded-md px-2.5 py-1 text-xs font-medium ${
              active ? "bg-orange-50 text-[#C2410C]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            {viewport.label}
          </button>
        );
      })}
    </div>
  );
}

function ShopPuckDock() {
  const selected = usePuckUi((s) => s.selectedItem);
  const dispatch = usePuckUi((s) => s.dispatch);
  const [library, setLibrary] = useState<"blocks" | "structure">("blocks");

  if (selected) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center gap-1 border-b border-slate-100 px-2 py-1.5">
          <button
            type="button"
            onClick={() => dispatch({ type: "setUi", ui: { itemSelector: null } })}
            className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-1 text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
            Blocs
          </button>
          <p className="truncate text-sm font-medium text-slate-900">{NODE_LABEL[selected.type] ?? selected.type}</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          <Puck.Fields />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 border-b border-slate-100 p-1">
        {(
          [
            ["blocks", "Blocs"],
            ["structure", "Structure"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setLibrary(id)}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium ${
              library === id ? "bg-orange-50 text-[#C2410C]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="shop-puck-drawer min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {library === "blocks" ? <Puck.Components /> : <Puck.Outline />}
      </div>
    </div>
  );
}

export function ShopBuilderCanvas({
  layout,
  model,
  chat,
  onChange,
  settings,
  settingsOpen,
}: {
  layout: ShopLayout;
  model: StorefrontModel;
  settings?: ReactNode;
  settingsOpen?: boolean;
  chat: ReactNode;
  onChange: (layout: ShopLayout) => void;
}) {
  const header = headerNav(model.nav);
  const footer = footerNav(model.nav);

  return (
    <div className="shop-puck flex min-h-0 min-w-0 flex-1 flex-col">
      <Puck
        config={shopPuckConfig}
        data={layout}
        metadata={{ model }}
        iframe={{ enabled: false }}
        plugins={[]}
        height="100%"
        viewports={VIEWPORTS}
        onChange={(data: Data) => onChange(parseLayout(data))}
      >
        <div className="grid h-full min-h-0 flex-1 grid-cols-1 lg:grid-cols-[16rem_minmax(0,1fr)_20rem]">
          <aside className="flex min-h-0 flex-col overflow-hidden border-b border-slate-100 lg:border-r lg:border-b-0">
            <ShopPuckDock />
          </aside>
          <section className="flex min-h-0 flex-col overflow-hidden bg-slate-100">
            {settingsOpen ? (
              <div className="min-h-0 flex-1 overflow-y-auto bg-white">{settings}</div>
            ) : (
              <>
                <ViewportBar />
                <div className="min-h-0 flex-1 overflow-auto p-4">
                  <div
                    className="mx-auto min-h-full overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200"
                    style={themeStyle(model.theme)}
                  >
                    <header className="border-b border-black/10">
                      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-4">
                        <p className="mr-auto text-base font-semibold tracking-tight">{model.shopName}</p>
                        <nav className="flex flex-wrap gap-1 text-sm opacity-80">
                          {header.map((item) => (
                            <span key={`${item.location}-${item.sortOrder}-${item.label}`} className="rounded-md px-3 py-1.5">
                              {item.label}
                            </span>
                          ))}
                        </nav>
                      </div>
                    </header>
                    <Puck.Preview />
                    <footer className="border-t border-black/10">
                      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-6 text-xs opacity-70">
                        <p className="mr-auto">{model.legal.company || model.shopName}</p>
                        {footer.map((item) => (
                          <span key={`${item.href}-${item.label}`}>{item.label}</span>
                        ))}
                      </div>
                    </footer>
                  </div>
                </div>
              </>
            )}
          </section>
          <aside className="flex min-h-0 flex-col border-t border-slate-100 lg:border-t-0 lg:border-l">
            <p className="shrink-0 border-b border-slate-100 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Chat IA
            </p>
            <div className="min-h-0 flex-1">{chat}</div>
          </aside>
        </div>
      </Puck>
    </div>
  );
}
