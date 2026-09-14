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
  Users,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { ShopChromeInspector } from "@/components/shops/shop-chrome-inspector";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { resolveShopHref } from "@/lib/shops/href";
import { SHOP_NODE_LABEL, shopNodeLabel } from "@/lib/shops/labels";
import { layoutsEqual, parseLayout } from "@/lib/shops/layout";
import { shopPuckConfig } from "@/lib/shops/puck-config";
import { footerNav, headerNav, themeStyle } from "@/lib/shops/seo";
import type { ShopLayout, ShopNavDraft, StorefrontModel } from "@/lib/shops/types";
import { shopBasePath } from "@/lib/shops/urls";
import { cx, SHOP_CONTAINER } from "@/lib/shops/storefront-style";

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
  Team: Users,
  Legal: ScrollText,
};

const PALETTE: { id: string; title: string; icon: LucideIcon; items: string[] }[] = [
  { id: "layout", title: "Disposition", icon: LayoutTemplate, items: ["Section", "Columns"] },
  { id: "content", title: "Contenu", icon: AlignLeft, items: ["Heading", "Text", "Image", "Button", "Hero"] },
  { id: "shop", title: "Boutique", icon: Store, items: ["Catalog", "Categories", "QuoteCta", "Faq", "Features", "Team", "Legal"] },
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
                  <Drawer.Item key={name} name={name} label={SHOP_NODE_LABEL[name] ?? name}>
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
export type ShopBuilderTab = DockTab;
export type ShopBuilderChrome = "header" | "footer" | null;

const DOCK_TABS: { id: DockTab; label: string }[] = [
  { id: "blocks", label: "Blocs" },
  { id: "structure", label: "Structure" },
  { id: "chat", label: "Chat" },
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
        <nav aria-label="Panneau" className="flex items-center gap-4">
          {DOCK_TABS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTab(item.id)}
                className={`relative pb-0.5 text-[11px] font-medium tracking-wide ${
                  active ? "text-white" : "text-white/45 hover:text-white/80"
                }`}
              >
                {item.label}
                {active ? <span className="absolute inset-x-0 -bottom-1.5 h-px bg-white" /> : null}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="flex shrink-0 items-center justify-end gap-1.5">{trailing}</div>
    </div>
  );
}

function PuckFocusNode({ nodeId, pulse }: { nodeId: string | null; pulse: number }) {
  const getSelectorForId = usePuckUi((s) => s.getSelectorForId);
  const dispatch = usePuckUi((s) => s.dispatch);
  const getSelectorRef = useRef(getSelectorForId);
  const dispatchRef = useRef(dispatch);
  getSelectorRef.current = getSelectorForId;
  dispatchRef.current = dispatch;

  useEffect(() => {
    if (!nodeId || !pulse) return;
    const selector = getSelectorRef.current(nodeId);
    if (!selector) return;
    dispatchRef.current({ type: "setUi", ui: { itemSelector: selector } });
  }, [nodeId, pulse]);
  return null;
}

function PuckLayoutSync({ layout, epoch }: { layout: ShopLayout; epoch: number }) {
  const dispatch = usePuckUi((s) => s.dispatch);
  const last = useRef(0);
  const layoutRef = useRef(layout);
  const dispatchRef = useRef(dispatch);
  layoutRef.current = layout;
  dispatchRef.current = dispatch;
  useEffect(() => {
    if (!epoch || epoch === last.current) return;
    last.current = epoch;
    dispatchRef.current({ type: "setData", data: layoutRef.current });
  }, [epoch]);
  return null;
}

function PuckSelectionBridge({
  chrome,
  onPuckSelect,
}: {
  chrome: ShopBuilderChrome;
  onPuckSelect: (item: { id: string; type: string } | null) => void;
}) {
  const selected = usePuckUi((s) => s.selectedItem);
  const prevId = useRef<string | null>(null);
  const cb = useRef(onPuckSelect);
  cb.current = onPuckSelect;

  useEffect(() => {
    const id = typeof selected?.props?.id === "string" ? selected.props.id : "";
    const next = selected && id ? { id, type: selected.type } : null;
    const nextId = next?.id ?? null;
    if (next && nextId !== prevId.current) cb.current(next);
    else if (!next && !chrome) cb.current(null);
    prevId.current = nextId;
  }, [selected, chrome]);
  return null;
}

function ShopPuckDock({
  tab,
  chat,
  chrome,
  name,
  nav,
  onName,
  onNav,
  onTab,
}: {
  tab: DockTab;
  chat: ReactNode;
  chrome: ShopBuilderChrome;
  name: string;
  nav: ShopNavDraft[];
  onName: (name: string) => void;
  onNav: (nav: ShopNavDraft[]) => void;
  onTab: (tab: DockTab) => void;
}) {
  const selected = usePuckUi((s) => s.selectedItem);
  const dispatch = usePuckUi((s) => s.dispatch);

  return (
    <>
      <div className={tab === "chat" ? "flex min-h-0 flex-1 flex-col" : "hidden"}>{chat}</div>
      {tab === "chat" ? null : tab === "structure" ? (
        <div className="shop-puck-drawer min-h-0 flex-1 overflow-y-auto px-2 py-2">
          <p className="flex items-center gap-1.5 px-1 pb-2 text-[11px] leading-4 text-slate-400">
            <Layers className="h-3.5 w-3.5" aria-hidden />
            Calques de la page
          </p>
          <Puck.Outline />
        </div>
      ) : chrome ? (
        <ShopChromeInspector
          chrome={chrome}
          name={name}
          nav={nav}
          onName={onName}
          onNav={onNav}
          onChat={() => onTab("chat")}
        />
      ) : selected ? (
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
            <p className="truncate text-sm font-medium text-slate-900">{shopNodeLabel(selected.type)}</p>
            <button
              type="button"
              onClick={() => onTab("chat")}
              className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[#C2410C] hover:bg-orange-50"
            >
              <MessageSquare className="h-3.5 w-3.5" aria-hidden />
              Chat
            </button>
          </div>
          <div className="shop-inspector min-h-0 flex-1 overflow-y-auto px-3 py-3">
            <Puck.Fields />
          </div>
        </div>
      ) : (
        <div className="shop-puck-drawer min-h-0 flex-1 overflow-y-auto px-2 py-2">
          <ShopBlockPalette />
        </div>
      )}
    </>
  );
}

function ShopPuckLayout({
  leading,
  trailing,
  chat,
  settings,
  settingsOpen,
  model,
  tab,
  onTab,
  chrome,
  onChrome,
  onName,
  onNav,
  layout,
  layoutEpoch,
  onPuckSelect,
  focusNodeId,
  pulse,
}: {
  leading: ReactNode;
  trailing: ReactNode;
  chat: ReactNode;
  settings?: ReactNode;
  settingsOpen?: boolean;
  model: StorefrontModel;
  tab: DockTab;
  onTab: (tab: DockTab) => void;
  chrome: ShopBuilderChrome;
  onChrome: (chrome: ShopBuilderChrome) => void;
  onName: (name: string) => void;
  onNav: (nav: ShopNavDraft[]) => void;
  layout: ShopLayout;
  layoutEpoch: number;
  onPuckSelect: (item: { id: string; type: string } | null) => void;
  focusNodeId: string | null;
  pulse: number;
}) {
  const dock = useDockWidth();
  const dispatch = usePuckUi((s) => s.dispatch);
  const viewportWidth = usePuckUi((s) => s.appState.ui.viewports?.current?.width);
  const framed = viewportWidth === 768 || viewportWidth === 390;
  const header = headerNav(model.nav);
  const footer = footerNav(model.nav);
  const home = shopBasePath(model.orgSlug, model.shopSlug);

  function selectChrome(next: "header" | "footer") {
    dispatch({ type: "setUi", ui: { itemSelector: null } });
    onChrome(next);
    onTab("chat");
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <PuckLayoutSync layout={layout} epoch={layoutEpoch} />
      <PuckFocusNode nodeId={focusNodeId} pulse={pulse} />
      <PuckSelectionBridge chrome={chrome} onPuckSelect={onPuckSelect} />
      <ShopChrome leading={leading} trailing={trailing} tab={tab} onTab={onTab} />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside
          className="flex min-h-0 w-full flex-col overflow-hidden border-b border-slate-200 bg-white max-lg:!w-full lg:h-full lg:shrink-0 lg:border-r lg:border-b-0"
          style={{ width: dock.width }}
        >
          <ShopPuckDock
            tab={tab}
            chat={chat}
            chrome={chrome}
            name={model.shopName}
            nav={model.nav}
            onName={onName}
            onNav={onNav}
            onTab={onTab}
          />
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
            <div className={framed ? "min-h-0 flex-1 overflow-auto bg-stone-100 p-6" : "min-h-0 flex-1 overflow-auto bg-white"}>
              <div
                className={
                  framed
                    ? "mx-auto min-h-full overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-slate-200"
                    : "min-h-full bg-white"
                }
                style={{
                  ...themeStyle(model.theme),
                  ...(framed && typeof viewportWidth === "number" ? { width: viewportWidth, maxWidth: "100%" } : {}),
                }}
              >
                <StorefrontHeader
                  editing
                  selected={chrome === "header"}
                  onSelect={() => selectChrome("header")}
                  shopName={model.shopName}
                  home={home}
                  accent={model.theme.accent}
                  background={model.theme.background}
                  text={model.theme.text}
                  items={header.map((item) => ({
                    label: item.label,
                    href: resolveShopHref(item.href, {
                      orgSlug: model.orgSlug,
                      shopSlug: model.shopSlug,
                      funnelSlug: model.funnelSlug,
                    }),
                  }))}
                />
                <Puck.Preview />
                <footer
                  role="button"
                  tabIndex={0}
                  aria-label="Pied de page"
                  aria-pressed={chrome === "footer"}
                  onClick={() => selectChrome("footer")}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      selectChrome("footer");
                    }
                  }}
                  className={cx(
                    "relative cursor-pointer border-t border-black/10",
                    chrome === "footer" && "ring-2 ring-inset ring-[#E85D04]",
                  )}
                >
                  {chrome === "footer" ? (
                    <span className="absolute top-2 left-3 rounded-full bg-[#E85D04] px-2 py-0.5 text-[10px] font-medium tracking-wide text-white uppercase">
                      Pied
                    </span>
                  ) : null}
                  <div className={cx(SHOP_CONTAINER, "flex flex-col gap-6 py-12 text-sm md:flex-row md:items-center")}>
                    <p className="mr-auto text-sm text-[color-mix(in_srgb,var(--shop-text)_70%,var(--shop-bg))]">
                      {model.legal.company || model.shopName}
                      {model.legal.city ? ` · ${model.legal.city}` : ""}
                    </p>
                    <nav aria-label="Mentions" className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                      {footer.map((item) => (
                        <span key={`${item.href}-${item.label}`}>{item.label}</span>
                      ))}
                    </nav>
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
  tab,
  onTab,
  chrome,
  onChrome,
  onName,
  onNav,
  layoutEpoch,
  onPuckSelect,
  working,
  pulse,
  focusNodeId,
}: {
  layout: ShopLayout;
  model: StorefrontModel;
  settings?: ReactNode;
  settingsOpen?: boolean;
  chat: ReactNode;
  leading: ReactNode;
  trailing: ReactNode;
  tab: ShopBuilderTab;
  onTab: (tab: ShopBuilderTab) => void;
  chrome: ShopBuilderChrome;
  onChrome: (chrome: ShopBuilderChrome) => void;
  onName: (name: string) => void;
  onNav: (nav: ShopNavDraft[]) => void;
  layoutEpoch: number;
  onPuckSelect: (item: { id: string; type: string } | null) => void;
  onChange: (layout: ShopLayout) => void;
  working?: boolean;
  pulse?: number;
  focusNodeId?: string | null;
}) {
  const metadata = useMemo(() => ({ model }), [model]);
  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  return (
    <div className={`shop-puck flex min-h-0 min-w-0 flex-1 flex-col${working ? " shop-puck-working" : ""}${pulse ? " shop-puck-pulse" : ""}`}>
      <Puck
        config={shopPuckConfig}
        data={layout}
        metadata={metadata}
        iframe={{ enabled: false }}
        plugins={[]}
        overrides={{ drawerItem: ShopDrawerItem }}
        height="100%"
        viewports={VIEWPORTS}
        onChange={(data: Data) => {
          const next = parseLayout(data);
          if (layoutsEqual(layoutRef.current, next)) return;
          onChange(next);
        }}
      >
        <ShopPuckLayout
          leading={leading}
          trailing={trailing}
          chat={chat}
          settings={settings}
          settingsOpen={settingsOpen}
          model={model}
          tab={tab}
          onTab={onTab}
          chrome={chrome}
          onChrome={onChrome}
          onName={onName}
          onNav={onNav}
          layout={layout}
          layoutEpoch={layoutEpoch}
          onPuckSelect={onPuckSelect}
          focusNodeId={focusNodeId ?? null}
          pulse={pulse ?? 0}
        />
      </Puck>
    </div>
  );
}
