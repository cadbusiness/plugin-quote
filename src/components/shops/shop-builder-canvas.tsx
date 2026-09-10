"use client";

import { Drawer, Puck, createUsePuck } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import type { Data } from "@puckeditor/core";
import {
  AlignLeft,
  Boxes,
  ChevronDown,
  ChevronLeft,
  CircleHelp,
  Columns2,
  FolderTree,
  Heading2,
  Image as ImageIcon,
  LayoutGrid,
  LayoutTemplate,
  Layers,
  ListChecks,
  MessageSquare,
  MessageSquareQuote,
  Monitor,
  PanelTop,
  RectangleHorizontal,
  ScrollText,
  Smartphone,
  SquareDashed,
  Store,
  Tablet,
  Type,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { parseLayout } from "@/lib/shops/layout";
import { shopPuckConfig } from "@/lib/shops/puck-config";
import { footerNav, headerNav, themeStyle } from "@/lib/shops/seo";
import type { ShopLayout, StorefrontModel } from "@/lib/shops/types";

const usePuckUi = createUsePuck();

type ViewportWidth = 1280 | 768 | 390;

const VIEWPORTS: { width: ViewportWidth; height: "auto"; label: string; icon: "Monitor" | "Tablet" | "Smartphone" }[] = [
  { width: 1280, height: "auto", label: "Desktop", icon: "Monitor" },
  { width: 768, height: "auto", label: "Tablette", icon: "Tablet" },
  { width: 390, height: "auto", label: "Mobile", icon: "Smartphone" },
];

const VIEWPORT_ICON: Record<ViewportWidth, typeof Monitor> = {
  1280: Monitor,
  768: Tablet,
  390: Smartphone,
};

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

const DOCK_MIN = 360;
const DOCK_MAX = 560;
const DOCK_DEFAULT = 380;

const BLOCK_ICON: Record<string, LucideIcon> = {
  Section: SquareDashed,
  Columns: Columns2,
  Heading: Heading2,
  Text: Type,
  Image: ImageIcon,
  Button: RectangleHorizontal,
  Hero: PanelTop,
  Catalog: LayoutGrid,
  Categories: FolderTree,
  QuoteCta: MessageSquareQuote,
  Faq: CircleHelp,
  Features: ListChecks,
  Legal: ScrollText,
};

const PALETTE: { id: string; title: string; icon: LucideIcon; items: string[] }[] = [
  { id: "layout", title: "Disposition", icon: LayoutTemplate, items: ["Section", "Columns"] },
  { id: "content", title: "Contenu", icon: AlignLeft, items: ["Heading", "Text", "Image", "Button", "Hero"] },
  { id: "shop", title: "Boutique", icon: Store, items: ["Catalog", "Categories", "QuoteCta", "Faq", "Features", "Legal"] },
];

function ShopDrawerItem({ name, children }: { name: string; children: ReactNode }) {
  const Icon = BLOCK_ICON[name] ?? Boxes;
  return (
    <div className="shop-block-tile">
      <Icon className="h-5 w-5 text-[#E85D04]" aria-hidden />
      {children}
    </div>
  );
}

function ShopBlockPalette() {
  const [open, setOpen] = useState<Record<string, boolean>>({ layout: true, content: true, shop: true });
  return (
    <div className="shop-block-palette">
      {PALETTE.map((category) => {
        const Icon = category.icon;
        const expanded = open[category.id] !== false;
        return (
          <section key={category.id} className="border-b border-slate-100 py-2">
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setOpen((current) => ({ ...current, [category.id]: !expanded }))}
              className="flex w-full items-center gap-2 rounded-md px-1 py-1.5 text-left text-[11px] font-semibold tracking-wide text-slate-500 uppercase hover:bg-slate-50 hover:text-slate-800"
            >
              <Icon className="h-3.5 w-3.5 text-[#E85D04]" aria-hidden />
              {category.title}
              <ChevronDown className={`ml-auto h-3.5 w-3.5 transition-transform ${expanded ? "" : "-rotate-90"}`} aria-hidden />
            </button>
            {expanded ? (
              <Drawer>
                {category.items.map((name) => (
                  <Drawer.Item key={name} name={name} label={NODE_LABEL[name] ?? name}>
                    {ShopDrawerItem}
                  </Drawer.Item>
                ))}
              </Drawer>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

function clampDock(width: number) {
  return Math.min(DOCK_MAX, Math.max(DOCK_MIN, Math.round(width)));
}

function useDockWidth() {
  const [width, setWidth] = useState(DOCK_DEFAULT);
  const drag = useRef<{ startX: number; startW: number } | null>(null);

  useEffect(() => {
    const stored = Number(window.localStorage.getItem("qb-shop-dock"));
    if (Number.isFinite(stored)) setWidth(clampDock(stored));
  }, []);

  useEffect(() => {
    function onMove(event: PointerEvent) {
      if (!drag.current) return;
      setWidth(clampDock(drag.current.startW + event.clientX - drag.current.startX));
    }
    function onUp(event: PointerEvent) {
      if (!drag.current) return;
      const next = clampDock(drag.current.startW + event.clientX - drag.current.startX);
      drag.current = null;
      setWidth(next);
      window.localStorage.setItem("qb-shop-dock", String(next));
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    drag.current = { startX: event.clientX, startW: width };
  }

  function onDoubleClick() {
    setWidth(DOCK_DEFAULT);
    window.localStorage.setItem("qb-shop-dock", String(DOCK_DEFAULT));
  }

  return { width, onPointerDown, onDoubleClick };
}

type DockTab = "blocks" | "structure" | "chat";

const DOCK_TABS: { id: DockTab; label: string; icon: typeof Boxes }[] = [
  { id: "blocks", label: "Blocs", icon: Boxes },
  { id: "structure", label: "Structure", icon: Layers },
  { id: "chat", label: "Chat", icon: MessageSquare },
];

function ViewportButtons() {
  const viewports = usePuckUi((s) => s.appState.ui.viewports);
  const dispatch = usePuckUi((s) => s.dispatch);
  const current = viewports?.current?.width;
  return (
    <div className="flex items-center gap-0.5">
      {VIEWPORTS.map((viewport) => {
        const active = current === viewport.width;
        const Icon = VIEWPORT_ICON[viewport.width];
        return (
          <button
            key={viewport.width}
            type="button"
            title={viewport.label}
            aria-label={viewport.label}
            aria-pressed={active}
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
            className={`flex h-8 w-8 items-center justify-center rounded-md ${
              active ? "bg-white/15 text-white" : "text-white/65 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}

function ShopChrome({
  leading,
  trailing,
  tab,
  onTab,
}: {
  leading: ReactNode;
  trailing: ReactNode;
  tab: DockTab;
  onTab: (tab: DockTab) => void;
}) {
  return (
    <div className="shop-builder-chrome flex h-12 shrink-0 items-center gap-2 border-b border-stone-800 bg-stone-900 px-2 text-white">
      <div className="flex min-w-0 shrink-0 items-center gap-1">
        {leading}
        <ViewportButtons />
      </div>
      <div className="flex min-w-0 flex-1 justify-center">
        <div className="flex rounded-md bg-white/10 p-0.5">
          {DOCK_TABS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTab(item.id)}
                className={`inline-flex h-7 items-center gap-1.5 rounded px-2.5 text-xs font-medium ${
                  active ? "bg-white text-stone-900" : "text-white/70 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-end gap-1.5">{trailing}</div>
    </div>
  );
}

function ShopPuckDock({ tab, chat }: { tab: DockTab; chat: ReactNode }) {
  const selected = usePuckUi((s) => s.selectedItem);
  const dispatch = usePuckUi((s) => s.dispatch);

  if (tab === "chat") {
    return <div className="flex min-h-0 flex-1 flex-col">{chat}</div>;
  }

  if (tab === "structure") {
    return (
      <div className="shop-puck-drawer min-h-0 flex-1 overflow-y-auto px-2 py-2">
        <p className="flex items-center gap-1.5 px-1 pb-2 text-[11px] leading-4 text-slate-400">
          <Layers className="h-3.5 w-3.5" aria-hidden />
          Calques de la page
        </p>
        <Puck.Outline />
      </div>
    );
  }

  if (selected) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex h-10 shrink-0 items-center gap-1 border-b border-slate-100 px-2">
          <button
            type="button"
            onClick={() => dispatch({ type: "setUi", ui: { itemSelector: null } })}
            className="-ml-1 inline-flex items-center gap-0.5 rounded-md px-1.5 py-1 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Blocs
          </button>
          <p className="truncate text-sm font-medium text-slate-900">{NODE_LABEL[selected.type] ?? selected.type}</p>
        </div>
        <div className="shop-inspector min-h-0 flex-1 overflow-y-auto px-3 py-3">
          <Puck.Fields />
        </div>
      </div>
    );
  }

  return (
    <div className="shop-puck-drawer min-h-0 flex-1 overflow-y-auto px-2 py-2">
      <ShopBlockPalette />
    </div>
  );
}

function ShopPuckLayout({
  leading,
  trailing,
  chat,
  settings,
  settingsOpen,
  model,
}: {
  leading: ReactNode;
  trailing: ReactNode;
  chat: ReactNode;
  settings?: ReactNode;
  settingsOpen?: boolean;
  model: StorefrontModel;
}) {
  const [tab, setTab] = useState<DockTab>("blocks");
  const dock = useDockWidth();
  const viewportWidth = usePuckUi((s) => s.appState.ui.viewports?.current?.width);
  const framed = viewportWidth === 768 || viewportWidth === 390;
  const header = headerNav(model.nav);
  const footer = footerNav(model.nav);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <ShopChrome leading={leading} trailing={trailing} tab={tab} onTab={setTab} />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside
          className="flex min-h-0 w-full flex-col overflow-hidden border-b border-slate-200 bg-white max-lg:!w-full lg:h-full lg:shrink-0 lg:border-r lg:border-b-0"
          style={{ width: dock.width }}
        >
          <ShopPuckDock tab={tab} chat={chat} />
        </aside>
        <button
          type="button"
          aria-label="Redimensionner le panneau"
          title="Glisser pour élargir ou rétrécir"
          onPointerDown={dock.onPointerDown}
          onDoubleClick={dock.onDoubleClick}
          className="relative z-10 hidden w-px shrink-0 cursor-col-resize bg-transparent hover:bg-[#E85D04] lg:block before:absolute before:inset-y-0 before:-left-1.5 before:-right-1.5 before:content-['']"
        />
        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-stone-100">
          {settingsOpen ? (
            <div className="min-h-0 flex-1 overflow-y-auto bg-white">{settings}</div>
          ) : (
            <div className={framed ? "min-h-0 flex-1 overflow-auto p-4" : "min-h-0 flex-1 overflow-auto bg-white"}>
              <div
                className={
                  framed
                    ? "mx-auto min-h-full overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200"
                    : "min-h-full bg-white"
                }
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
          )}
        </section>
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
  leading,
  trailing,
}: {
  layout: ShopLayout;
  model: StorefrontModel;
  settings?: ReactNode;
  settingsOpen?: boolean;
  chat: ReactNode;
  leading: ReactNode;
  trailing: ReactNode;
  onChange: (layout: ShopLayout) => void;
}) {
  return (
    <div className="shop-puck flex min-h-0 min-w-0 flex-1 flex-col">
      <Puck
        config={shopPuckConfig}
        data={layout}
        metadata={{ model }}
        iframe={{ enabled: false }}
        plugins={[]}
        overrides={{ drawerItem: ShopDrawerItem }}
        height="100%"
        viewports={VIEWPORTS}
        onChange={(data: Data) => onChange(parseLayout(data))}
      >
        <ShopPuckLayout
          leading={leading}
          trailing={trailing}
          chat={chat}
          settings={settings}
          settingsOpen={settingsOpen}
          model={model}
        />
      </Puck>
    </div>
  );
}
