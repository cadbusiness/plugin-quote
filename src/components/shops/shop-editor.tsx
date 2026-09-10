"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type ReactNode } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { deleteShop, publishShop, saveShop } from "@/app/(app)/integrations/shop-actions";
import { ShopChat } from "@/components/shops/shop-chat";
import { ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { BLOCK_LABELS, BLOCK_PALETTE, emptyBlock } from "@/lib/shops/blocks";
import type { ShopBlock, ShopLegal, ShopNavDraft, ShopPageSeo, ShopProduct, ShopSeo, ShopTheme } from "@/lib/shops/types";

type EditorPage = {
  id: string;
  slug: string;
  title: string;
  kind: string;
  seo: ShopPageSeo;
  blocks: ShopBlock[];
  isPublished: boolean;
  sortOrder: number;
};

function SortableBlock({
  block,
  selected,
  onSelect,
  children,
}: {
  block: ShopBlock;
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-lg ring-1 ${selected ? "ring-[#E85D04]" : "ring-slate-200"}`}
    >
      <div className="flex items-center gap-2 border-b border-slate-100 px-2 py-1.5">
        <button type="button" className="cursor-grab text-slate-400" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4" />
        </button>
        <button type="button" onClick={onSelect} className="text-left text-xs font-medium text-slate-600">
          {BLOCK_LABELS[block.type]}
        </button>
      </div>
      <button type="button" onClick={onSelect} className="block w-full px-3 py-3 text-left">
        {children}
      </button>
    </div>
  );
}

export function ShopEditor({
  shop,
  pages: initialPages,
  nav: initialNav,
  products,
  publicUrl,
  funnelName,
  orgName,
  openChat,
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
  orgName: string;
  openChat: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(shop.name);
  const [status, setStatus] = useState(shop.status);
  const [theme, setTheme] = useState(shop.theme);
  const [seo, setSeo] = useState(shop.seo);
  const [legal, setLegal] = useState(shop.legal);
  const [pages, setPages] = useState(initialPages);
  const [nav, setNav] = useState(initialNav);
  const [pageId, setPageId] = useState(initialPages[0]?.id ?? "");
  const [blockId, setBlockId] = useState<string | null>(initialPages[0]?.blocks[0]?.id ?? null);
  const [tab, setTab] = useState<"page" | "seo" | "legal" | "nav" | "chat">(openChat ? "chat" : "page");
  const [pending, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const page = pages.find((item) => item.id === pageId) ?? pages[0] ?? null;
  const selected = page?.blocks.find((block) => block.id === blockId) ?? null;

  function patchPage(id: string, patch: Partial<EditorPage>) {
    setPages((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function patchBlock(id: string, patch: Partial<ShopBlock>) {
    if (!page) return;
    patchPage(page.id, {
      blocks: page.blocks.map((block) => (block.id === id ? { ...block, ...patch } : block)),
    });
  }

  function onDragEnd(event: DragEndEvent) {
    if (!page) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = page.blocks.findIndex((block) => block.id === active.id);
    const to = page.blocks.findIndex((block) => block.id === over.id);
    if (from < 0 || to < 0) return;
    patchPage(page.id, { blocks: arrayMove(page.blocks, from, to) });
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

  const previewBlocks = useMemo(() => page?.blocks ?? [], [page]);

  return (
    <ListPanel className="min-h-0">
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

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[14rem_minmax(0,1fr)_20rem]">
        <aside className="border-b border-slate-100 lg:border-r lg:border-b-0">
          <p className="px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">Pages</p>
          {pages.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setPageId(item.id);
                setBlockId(item.blocks[0]?.id ?? null);
                setTab("page");
              }}
              className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm ${
                item.id === page?.id ? "bg-orange-50 text-[#C2410C]" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>{item.title}</span>
              {item.kind === "legal" ? (
                <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">Légal</span>
              ) : null}
            </button>
          ))}
          <p className="mt-4 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">Réglages</p>
          {(["seo", "legal", "nav", "chat"] as const).map((item) => (
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
              {item === "chat" && "Chat IA"}
            </button>
          ))}
          {funnelName ? <p className="px-4 py-3 text-xs text-slate-400">Devis : {funnelName}</p> : null}
        </aside>

        <section className="min-h-0 overflow-y-auto border-b border-slate-100 bg-slate-50/60 p-4 lg:border-b-0">
          {tab === "page" && page ? (
            <div className="mx-auto max-w-3xl space-y-3">
              <div className="rounded-lg bg-white px-4 py-3 ring-1 ring-slate-200">
                <label className="block text-xs font-medium text-slate-500">Titre de page (H1 / SEO)</label>
                <input
                  value={page.title}
                  onChange={(event) =>
                    patchPage(page.id, {
                      title: event.target.value,
                      seo: { ...page.seo, title: event.target.value },
                    })
                  }
                  className="mt-1 w-full text-lg font-semibold text-slate-900 outline-none"
                />
                <input
                  value={page.seo.description}
                  onChange={(event) => patchPage(page.id, { seo: { ...page.seo, description: event.target.value } })}
                  placeholder="Meta description"
                  className="mt-2 w-full text-sm text-slate-500 outline-none"
                />
              </div>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={previewBlocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {previewBlocks.map((block) => (
                      <SortableBlock
                        key={block.id}
                        block={block}
                        selected={block.id === blockId}
                        onSelect={() => {
                          setBlockId(block.id);
                          setTab("page");
                        }}
                      >
                        <p className="font-medium text-slate-900">{block.heading || BLOCK_LABELS[block.type]}</p>
                        {block.sub || block.text ? (
                          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{block.sub || block.text}</p>
                        ) : null}
                        {block.type === "catalog" ? (
                          <p className="mt-1 text-xs text-slate-400">{products.length} produit{products.length > 1 ? "s" : ""} du catalogue lié</p>
                        ) : null}
                      </SortableBlock>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <div className="flex flex-wrap gap-2">
                {BLOCK_PALETTE.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      const block = emptyBlock(type);
                      patchPage(page.id, { blocks: [...page.blocks, block] });
                      setBlockId(block.id);
                    }}
                    className="rounded-md border border-dashed border-slate-300 px-2 py-1 text-xs text-slate-600 hover:border-[#E85D04] hover:text-[#C2410C]"
                  >
                    + {BLOCK_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {tab === "seo" ? (
            <div className="mx-auto max-w-xl space-y-3 rounded-lg bg-white p-4 ring-1 ring-slate-200">
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
              <div className="grid gap-3 sm:grid-cols-2">
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
              </div>
              <Field label="Accent">
                <input value={theme.accent} onChange={(event) => setTheme({ ...theme, accent: event.target.value })} className="input" />
              </Field>
            </div>
          ) : null}

          {tab === "legal" ? (
            <div className="mx-auto max-w-xl space-y-3 rounded-lg bg-white p-4 ring-1 ring-slate-200">
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
                  <input
                    value={legal[key]}
                    onChange={(event) => setLegal({ ...legal, [key]: event.target.value })}
                    className="input"
                  />
                </Field>
              ))}
              <p className="text-xs text-slate-500">
                Les pages mentions, CGV, confidentialité et cookies se régénèrent via le chat IA (« mets à jour le légal ») ou en enregistrant puis en demandant un refresh.
              </p>
            </div>
          ) : null}

          {tab === "nav" ? (
            <div className="mx-auto max-w-xl space-y-4">
              {(["header", "footer"] as const).map((location) => (
                <div key={location} className="rounded-lg bg-white p-4 ring-1 ring-slate-200">
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
          ) : null}

          {tab === "chat" ? (
            <div className="mx-auto flex h-[32rem] max-w-xl flex-col overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
              <ShopChat
                shopId={shop.id}
                seedPrompt={shop.seedPrompt}
                onApplied={() => {
                  setStatus((current) => current);
                  router.refresh();
                }}
              />
            </div>
          ) : null}
        </section>

        <aside className="min-h-0 overflow-y-auto">
          {tab === "page" && selected ? (
            <div className="space-y-3 px-4 py-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{BLOCK_LABELS[selected.type]}</p>
              <Field label="Titre">
                <input value={selected.heading ?? ""} onChange={(event) => patchBlock(selected.id, { heading: event.target.value })} className="input" />
              </Field>
              <Field label="Chapô / texte">
                <textarea
                  value={selected.sub || selected.text || ""}
                  onChange={(event) =>
                    patchBlock(selected.id, selected.type === "hero" ? { sub: event.target.value } : { text: event.target.value })
                  }
                  rows={5}
                  className="input"
                />
              </Field>
              {selected.type === "hero" || selected.type === "image" ? (
                <>
                  <Field label="Image (URL)">
                    <input value={selected.image ?? ""} onChange={(event) => patchBlock(selected.id, { image: event.target.value })} className="input" />
                  </Field>
                  <Field label="Texte alternatif (SEO)">
                    <input value={selected.imageAlt ?? ""} onChange={(event) => patchBlock(selected.id, { imageAlt: event.target.value })} className="input" />
                  </Field>
                </>
              ) : null}
              {selected.type === "quote_cta" || selected.type === "hero" ? (
                <Field label="Libellé du bouton">
                  <input value={selected.ctaLabel ?? ""} onChange={(event) => patchBlock(selected.id, { ctaLabel: event.target.value })} className="input" />
                </Field>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  if (!page) return;
                  patchPage(page.id, { blocks: page.blocks.filter((block) => block.id !== selected.id) });
                  setBlockId(page.blocks.find((block) => block.id !== selected.id)?.id ?? null);
                }}
                className="text-sm text-rose-600"
              >
                Retirer le bloc
              </button>
            </div>
          ) : tab === "chat" ? (
            <p className="px-4 py-4 text-sm text-slate-500">
              L’IA édite les pages, le SEO et les menus. {orgName} reste l’éditeur légal.
            </p>
          ) : (
            <form action={deleteShop} className="px-4 py-4">
              <input type="hidden" name="id" value={shop.id} />
              <button type="submit" className="text-sm text-rose-600">
                Supprimer la boutique
              </button>
            </form>
          )}
        </aside>
      </div>
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
