"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState, useTransition, type ReactNode } from "react";
import { deleteShop, publishShop, saveShop } from "@/app/(app)/integrations/shop-actions";
import { ShopChat, type EditorPage, type ShopChatDraft, type ShopChatResult } from "@/components/shops/shop-chat";
import { ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { parseLayout } from "@/lib/shops/layout";
import type { ShopLegal, ShopNavDraft, ShopProduct, ShopSeo, ShopTheme } from "@/lib/shops/types";

const ShopBuilderCanvas = dynamic(
  () => import("@/components/shops/shop-builder-canvas").then((mod) => mod.ShopBuilderCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-slate-400">Chargement du builder…</div>
    ),
  },
);

export function ShopEditor({
  shop,
  pages: initialPages,
  nav: initialNav,
  products,
  publicUrl,
  funnelName,
  funnelSlug,
  orgName,
  orgSlug,
}: {
  shop: {
    id: string;
    name: string;
    slug: string;
    status: string;
    theme: ShopTheme;
    seo: ShopSeo;
    legal: ShopLegal;
    seedPrompt?: string;
  };
  pages: EditorPage[];
  nav: ShopNavDraft[];
  products: ShopProduct[];
  publicUrl: string;
  funnelName: string | null;
  funnelSlug: string | null;
  orgName: string;
  orgSlug: string;
}) {
  const [name, setName] = useState(shop.name);
  const [status, setStatus] = useState(shop.status);
  const [theme, setTheme] = useState(shop.theme);
  const [seo, setSeo] = useState(shop.seo);
  const [legal, setLegal] = useState(shop.legal);
  const [pages, setPages] = useState(initialPages);
  const [nav, setNav] = useState(initialNav);
  const [pageId, setPageId] = useState(initialPages[0]?.id ?? "");
  const [tab, setTab] = useState<"page" | "seo" | "legal" | "nav">("page");
  const [layoutEpoch, setLayoutEpoch] = useState(0);
  const [pending, startTransition] = useTransition();

  const page = pages.find((item) => item.id === pageId) ?? pages[0] ?? null;

  const model = useMemo(
    () => ({
      orgSlug,
      shopSlug: shop.slug,
      shopName: name,
      funnelSlug,
      theme,
      legal,
      nav,
      products,
    }),
    [orgSlug, shop.slug, name, funnelSlug, theme, legal, nav, products],
  );

  function patchPage(id: string, patch: Partial<EditorPage>) {
    setPages((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function payload() {
    const data = new FormData();
    data.set("id", shop.id);
    data.set("name", name);
    data.set("status", status);
    data.set("theme", JSON.stringify(theme));
    data.set("seo", JSON.stringify(seo));
    data.set("legal", JSON.stringify(legal));
    data.set("pages", JSON.stringify(pages));
    data.set("nav", JSON.stringify(nav));
    return data;
  }

  function draft(): ShopChatDraft {
    return { name, status, theme, seo, legal, pages, nav };
  }

  function applyChat(result: ShopChatResult) {
    setName(result.name);
    setStatus(result.status);
    setTheme(result.theme);
    setSeo(result.seo);
    setLegal(result.legal);
    setPages(result.pages.map((item) => ({ ...item, blocks: parseLayout(item.blocks) })));
    setNav(result.nav);
    setLayoutEpoch((value) => value + 1);
  }

  const inspector =
    tab === "seo" ? (
      <div className="space-y-3 px-4 py-4">
        <Field label="Titre du site">
          <input value={seo.title} onChange={(event) => setSeo({ ...seo, title: event.target.value })} className="input" />
        </Field>
        <Field label="Meta description">
          <textarea
            value={seo.description}
            onChange={(event) => setSeo({ ...seo, description: event.target.value })}
            rows={3}
            className="input"
          />
        </Field>
        <Field label="Ville (GEO)">
          <input
            value={seo.geo.locality}
            onChange={(event) => setSeo({ ...seo, geo: { ...seo.geo, locality: event.target.value } })}
            className="input"
          />
        </Field>
        <Field label="Région">
          <input
            value={seo.geo.region}
            onChange={(event) => setSeo({ ...seo, geo: { ...seo.geo, region: event.target.value } })}
            className="input"
          />
        </Field>
        <Field label="Accent">
          <input value={theme.accent} onChange={(event) => setTheme({ ...theme, accent: event.target.value })} className="input" />
        </Field>
      </div>
    ) : tab === "legal" ? (
      <div className="space-y-3 px-4 py-4">
        {(
          [
            ["company", "Raison sociale"],
            ["siret", "SIRET"],
            ["address", "Adresse"],
            ["postalCode", "Code postal"],
            ["city", "Ville"],
            ["email", "Email"],
            ["phone", "Téléphone"],
            ["director", "Directeur de publication"],
          ] as const
        ).map(([key, label]) => (
          <Field key={key} label={label}>
            <input value={legal[key]} onChange={(event) => setLegal({ ...legal, [key]: event.target.value })} className="input" />
          </Field>
        ))}
        <form action={deleteShop}>
          <input type="hidden" name="id" value={shop.id} />
          <button type="submit" className="text-sm text-rose-600">
            Supprimer la boutique
          </button>
        </form>
      </div>
    ) : tab === "nav" ? (
      <div className="space-y-4 px-4 py-4">
        {(["header", "footer"] as const).map((location) => (
          <div key={location}>
            <p className="text-sm font-medium text-slate-900">{location === "header" ? "Menu haut" : "Menu pied"}</p>
            {nav
              .filter((item) => item.location === location)
              .map((item, index) => (
                <div key={`${location}-${index}`} className="mt-2 grid grid-cols-2 gap-2">
                  <input
                    value={item.label}
                    onChange={(event) =>
                      setNav((current) =>
                        current.map((row) =>
                          row.location === location && row.sortOrder === item.sortOrder
                            ? { ...row, label: event.target.value }
                            : row,
                        ),
                      )
                    }
                    className="input"
                  />
                  <input
                    value={item.href}
                    onChange={(event) =>
                      setNav((current) =>
                        current.map((row) =>
                          row.location === location && row.sortOrder === item.sortOrder
                            ? { ...row, href: event.target.value }
                            : row,
                        ),
                      )
                    }
                    className="input"
                  />
                </div>
              ))}
          </div>
        ))}
      </div>
    ) : null;

  return (
    <ListPanel className="min-h-0 overflow-hidden">
      <ListToolbar>
        <Link href="/integrations" className="mr-auto text-sm text-slate-500 hover:text-slate-900">
          Boutiques
        </Link>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-56 rounded-md border border-slate-200 px-2 py-1 text-sm"
        />
        <a href={publicUrl} target="_blank" rel="noreferrer" className="text-sm text-[#C2410C] underline">
          {status === "published" ? "Voir la boutique" : "Aperçu URL"}
        </a>
        <button
          type="button"
          onClick={() => startTransition(() => { void saveShop(payload()); })}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm"
        >
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        <form action={publishShop}>
          <input type="hidden" name="id" value={shop.id} />
          <input type="hidden" name="status" value={status === "published" ? "draft" : "published"} />
          <button
            type="submit"
            className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400]"
          >
            {status === "published" ? "Dépublier" : "Publier"}
          </button>
        </form>
      </ListToolbar>

      {page ? (
        <ShopBuilderCanvas
          key={`${page.id}-${layoutEpoch}`}
          layout={page.blocks}
          model={model}
          onChange={(blocks) => patchPage(page.id, { blocks })}
          settings={tab === "page" ? null : inspector}
          pagesNav={
            <>
              <p className="px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">Pages</p>
              {pages.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setPageId(item.id);
                    setTab("page");
                  }}
                  className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm ${
                    item.id === page.id && tab === "page" ? "bg-orange-50 text-[#C2410C]" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{item.title}</span>
                  {item.kind === "legal" ? (
                    <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">Légal</span>
                  ) : null}
                </button>
              ))}
              <p className="mt-4 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">Réglages</p>
              {(["seo", "legal", "nav"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  className={`block w-full px-4 py-2 text-left text-sm ${
                    tab === item ? "bg-orange-50 text-[#C2410C]" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {item === "seo" && "SEO / GEO"}
                  {item === "legal" && "Identité légale"}
                  {item === "nav" && "Menus"}
                </button>
              ))}
              {funnelName ? <p className="px-4 py-3 text-xs text-slate-400">Devis : {funnelName}</p> : null}
              <p className="px-4 pb-3 text-xs text-slate-400">{orgName} reste l’éditeur légal.</p>
            </>
          }
          chat={<ShopChat shopId={shop.id} seedPrompt={shop.seedPrompt} getDraft={draft} onApplied={applyChat} />}
        />
      ) : null}
    </ListPanel>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-slate-900">{label}</span>
      <div className="mt-1 [&_.input]:w-full [&_.input]:rounded-md [&_.input]:border [&_.input]:border-slate-200 [&_.input]:px-3 [&_.input]:py-2 [&_.input]:text-sm">
        {children}
      </div>
    </label>
  );
}
