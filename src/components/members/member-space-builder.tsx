"use client";

import { useState } from "react";
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
import {
  Boxes,
  FileText,
  GripVertical,
  Heading2,
  Link2,
  MessageSquareQuote,
  Puzzle,
  Settings,
  Trash2,
  Type,
  type LucideIcon,
} from "lucide-react";
import { MemberSpaceView } from "@/components/members/member-space-view";
import { emptyMemberBlock, MEMBER_BLOCK_LABEL } from "@/lib/members/blocks";
import { uniqueMemberPageSlug } from "@/lib/members/urls";
import { newMemberId, type MemberBlockType, type MemberPageDraft, type MemberQuoteCard, type MemberResourceDraft, type MemberResourceKind, type MemberTheme } from "@/lib/members/types";
import { uploadMemberResource } from "@/app/(app)/membres/actions";

type DockTab = "blocks" | "resources" | "settings";

const PALETTE: { type: MemberBlockType; icon: LucideIcon }[] = [
  { type: "hero", icon: Heading2 },
  { type: "text", icon: Type },
  { type: "quotes", icon: MessageSquareQuote },
  { type: "documents", icon: FileText },
  { type: "plugins", icon: Puzzle },
  { type: "links", icon: Link2 },
];

const SAMPLE_QUOTES: MemberQuoteCard[] = [
  {
    id: "preview-1",
    createdAt: new Date().toISOString(),
    contactName: "Claire Martin",
    contactCompany: "Dock Ouest",
    scoreLabel: "hot",
    statusLabel: "Nouveau",
    statusSlug: "new",
    suiviUrl: null,
  },
];

export function MemberSpaceBuilder({
  spaceId,
  name,
  theme,
  pages,
  pageId,
  resources,
  orgSlug,
  spaceSlug,
  onName,
  onTheme,
  onPages,
  onResources,
  onPageId,
}: {
  spaceId: string;
  name: string;
  theme: MemberTheme;
  pages: MemberPageDraft[];
  pageId: string;
  resources: MemberResourceDraft[];
  orgSlug: string;
  spaceSlug: string;
  onName: (name: string) => void;
  onTheme: (theme: MemberTheme) => void;
  onPages: (pages: MemberPageDraft[]) => void;
  onResources: (resources: MemberResourceDraft[]) => void;
  onPageId: (id: string) => void;
}) {
  const [tab, setTab] = useState<DockTab>("blocks");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const page = pages.find((item) => item.id === pageId) ?? pages[0] ?? null;
  const selected = page?.blocks.find((block) => block.id === selectedId) ?? null;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function patchPage(next: MemberPageDraft) {
    onPages(pages.map((item) => (item.id === next.id ? next : item)));
  }

  function addBlock(type: MemberBlockType) {
    if (!page) return;
    const block = emptyMemberBlock(type);
    patchPage({ ...page, blocks: [...page.blocks, block] });
    setSelectedId(block.id);
    setTab("blocks");
  }

  function updateBlock(id: string, patch: Partial<MemberPageDraft["blocks"][number]>) {
    if (!page) return;
    patchPage({
      ...page,
      blocks: page.blocks.map((block) => (block.id === id ? { ...block, ...patch } : block)),
    });
  }

  function removeBlock(id: string) {
    if (!page) return;
    patchPage({ ...page, blocks: page.blocks.filter((block) => block.id !== id) });
    if (selectedId === id) setSelectedId(null);
  }

  function onDragEnd(event: DragEndEvent) {
    if (!page || !event.over || event.active.id === event.over.id) return;
    const ids = page.blocks.map((block) => block.id);
    const from = ids.indexOf(String(event.active.id));
    const to = ids.indexOf(String(event.over.id));
    if (from < 0 || to < 0) return;
    patchPage({ ...page, blocks: arrayMove(page.blocks, from, to) });
  }

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex h-10 shrink-0 items-center gap-0.5 border-b border-slate-100 px-1.5">
          {(
            [
              { id: "blocks", label: "Blocs", icon: Boxes },
              { id: "resources", label: "Ressources", icon: FileText },
              { id: "settings", label: "Réglages", icon: Settings },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`inline-flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 text-[11px] font-medium ${
                  active ? "bg-orange-50 text-[#C2410C]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {item.label}
              </button>
            );
          })}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {tab === "blocks" && selected ? (
            <BlockInspector
              block={selected}
              onBack={() => setSelectedId(null)}
              onChange={(patch) => updateBlock(selected.id, patch)}
              onRemove={() => removeBlock(selected.id)}
            />
          ) : null}
          {tab === "blocks" && !selected ? (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Ajouter</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {PALETTE.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => addBlock(item.type)}
                        className="flex items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-slate-700 ring-1 ring-slate-200 hover:bg-orange-50/60"
                      >
                        <Icon className="h-4 w-4 text-[#E85D04]" aria-hidden />
                        {MEMBER_BLOCK_LABEL[item.type]}
                      </button>
                    );
                  })}
                </div>
              </div>
              {page ? (
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Sur la page</p>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <SortableContext items={page.blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
                      <ul className="space-y-1">
                        {page.blocks.map((block) => (
                          <SortableBlockRow
                            key={block.id}
                            id={block.id}
                            label={block.heading || MEMBER_BLOCK_LABEL[block.type]}
                            onSelect={() => setSelectedId(block.id)}
                            onRemove={() => removeBlock(block.id)}
                          />
                        ))}
                      </ul>
                    </SortableContext>
                  </DndContext>
                </div>
              ) : null}
            </div>
          ) : null}
          {tab === "resources" ? (
            <ResourcesEditor spaceId={spaceId} resources={resources} onChange={onResources} />
          ) : null}
          {tab === "settings" ? (
            <SettingsEditor
              name={name}
              theme={theme}
              pages={pages}
              pageId={pageId}
              onName={onName}
              onTheme={onTheme}
              onPages={onPages}
              onPageId={onPageId}
            />
          ) : null}
        </div>
      </aside>
      <div className="min-w-0 flex-1 overflow-auto bg-slate-100">
        {page ? (
          <MemberSpaceView
            orgSlug={orgSlug}
            spaceSlug={spaceSlug}
            name={name}
            theme={theme}
            page={page}
            pages={pages}
            resources={resources}
            quotes={SAMPLE_QUOTES}
            preview
            selectedBlockId={selectedId}
            onSelectPage={(id) => {
              onPageId(id);
              setSelectedId(null);
            }}
            onSelectBlock={(id) => {
              setSelectedId(id);
              setTab("blocks");
            }}
            onOpenQuotes={() => {
              const quotesPage = pages.find((item) => item.kind === "quotes") ?? pages.find((item) => item.slug === "devis");
              if (quotesPage) {
                onPageId(quotesPage.id);
                setSelectedId(null);
              }
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

function SortableBlockRow({
  id,
  label,
  onSelect,
  onRemove,
}: {
  id: string;
  label: string;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-1 rounded-md ring-1 ring-slate-200"
    >
      <button type="button" className="px-1.5 text-slate-400" aria-label="Réordonner" {...attributes} {...listeners}>
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={onSelect} className="min-w-0 flex-1 truncate py-1.5 text-left text-sm text-slate-800">
        {label}
      </button>
      <button type="button" onClick={onRemove} className="px-1.5 text-slate-400 hover:text-rose-700" aria-label="Retirer">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}

function BlockInspector({
  block,
  onBack,
  onChange,
  onRemove,
}: {
  block: MemberPageDraft["blocks"][number];
  onBack: () => void;
  onChange: (patch: Partial<MemberPageDraft["blocks"][number]>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-3">
      <button type="button" onClick={onBack} className="text-xs text-slate-500 hover:text-slate-900">
        Blocs
      </button>
      <p className="text-sm font-medium text-slate-900">{MEMBER_BLOCK_LABEL[block.type]}</p>
      <label className="block text-sm">
        <span className="text-slate-600">Titre</span>
        <input
          value={block.heading ?? ""}
          onChange={(event) => onChange({ heading: event.target.value })}
          className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm"
        />
      </label>
      {block.type === "hero" || block.type === "text" ? (
        <label className="block text-sm">
          <span className="text-slate-600">{block.type === "hero" ? "Sous-titre" : "Texte"}</span>
          <textarea
            value={block.type === "hero" ? (block.sub ?? "") : (block.text ?? "")}
            onChange={(event) =>
              onChange(block.type === "hero" ? { sub: event.target.value } : { text: event.target.value })
            }
            rows={4}
            className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm"
          />
        </label>
      ) : null}
      {block.type === "hero" ? (
        <label className="block text-sm">
          <span className="text-slate-600">Bouton</span>
          <input
            value={block.ctaLabel ?? ""}
            onChange={(event) => onChange({ ctaLabel: event.target.value })}
            className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm"
          />
        </label>
      ) : null}
      {block.type === "links" ? (
        <div className="space-y-2">
          {(block.links ?? []).map((item, index) => (
            <div key={`${item.href}-${index}`} className="grid grid-cols-2 gap-1">
              <input
                value={item.label}
                onChange={(event) => {
                  const next = [...(block.links ?? [])];
                  next[index] = { ...item, label: event.target.value };
                  onChange({ links: next });
                }}
                placeholder="Libellé"
                className="rounded-md border border-slate-200 px-2 py-1.5 text-sm"
              />
              <input
                value={item.href}
                onChange={(event) => {
                  const next = [...(block.links ?? [])];
                  next[index] = { ...item, href: event.target.value };
                  onChange({ links: next });
                }}
                placeholder="https://"
                className="rounded-md border border-slate-200 px-2 py-1.5 text-sm"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange({ links: [...(block.links ?? []), { label: "Lien", href: "https://" }] })}
            className="text-sm text-[#C2410C]"
          >
            Ajouter un lien
          </button>
        </div>
      ) : null}
      <button type="button" onClick={onRemove} className="text-sm text-rose-700 hover:underline">
        Retirer le bloc
      </button>
    </div>
  );
}

function ResourcesEditor({
  spaceId,
  resources,
  onChange,
}: {
  spaceId: string;
  resources: MemberResourceDraft[];
  onChange: (resources: MemberResourceDraft[]) => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function add(kind: MemberResourceKind) {
    onChange([
      ...resources,
      {
        id: newMemberId(),
        kind,
        title: kind === "document" ? "Nouveau document" : kind === "plugin" ? "Plugin" : "Lien",
        description: "",
        href: "",
        isPublished: true,
        sortOrder: resources.length,
      },
    ]);
  }

  async function upload(id: string, file: File) {
    setError(null);
    setBusyId(id);
    const data = new FormData();
    data.set("spaceId", spaceId);
    data.set("file", file);
    const result = await uploadMemberResource(data);
    setBusyId(null);
    if (result.error || !result.url) {
      setError(result.error ?? "Upload impossible.");
      return;
    }
    onChange(
      resources.map((row) =>
        row.id === id ? { ...row, href: result.url ?? row.href, title: row.title || file.name.replace(/\.[^.]+$/, "") } : row,
      ),
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs leading-5 text-slate-500">
        Documents, plugins et liens visibles une fois le client connecté. Collez une URL ou déposez un PDF.
      </p>
      <div className="flex flex-wrap gap-1.5">
        <button type="button" onClick={() => add("document")} className="rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-900">
          Document
        </button>
        <button type="button" onClick={() => add("plugin")} className="rounded-md bg-violet-50 px-2 py-1 text-xs text-violet-900">
          Plugin
        </button>
        <button type="button" onClick={() => add("link")} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
          Lien
        </button>
      </div>
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
      <ul className="space-y-3">
        {resources.map((item) => (
          <li key={item.id} className="space-y-1.5 rounded-md border border-slate-200 p-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              {item.kind === "document" ? "Document" : item.kind === "plugin" ? "Plugin" : "Lien"}
            </p>
            <input
              value={item.title}
              onChange={(event) =>
                onChange(resources.map((row) => (row.id === item.id ? { ...row, title: event.target.value } : row)))
              }
              className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
            />
            <textarea
              value={item.description}
              onChange={(event) =>
                onChange(resources.map((row) => (row.id === item.id ? { ...row, description: event.target.value } : row)))
              }
              rows={2}
              placeholder="Description"
              className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
            />
            <input
              value={item.href}
              onChange={(event) =>
                onChange(resources.map((row) => (row.id === item.id ? { ...row, href: event.target.value } : row)))
              }
              placeholder="https://"
              className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
            />
            <label className="block cursor-pointer text-xs font-medium text-[#C2410C]">
              {busyId === item.id ? "Envoi…" : "Déposer un fichier"}
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.txt,application/pdf,image/*"
                className="sr-only"
                disabled={busyId === item.id}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void upload(item.id, file);
                }}
              />
            </label>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={item.isPublished}
                  onChange={(event) =>
                    onChange(
                      resources.map((row) => (row.id === item.id ? { ...row, isPublished: event.target.checked } : row)),
                    )
                  }
                />
                Publié
              </label>
              <button
                type="button"
                onClick={() => onChange(resources.filter((row) => row.id !== item.id))}
                className="text-xs text-rose-700"
              >
                Retirer
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SettingsEditor({
  name,
  theme,
  pages,
  pageId,
  onName,
  onTheme,
  onPages,
  onPageId,
}: {
  name: string;
  theme: MemberTheme;
  pages: MemberPageDraft[];
  pageId: string;
  onName: (name: string) => void;
  onTheme: (theme: MemberTheme) => void;
  onPages: (pages: MemberPageDraft[]) => void;
  onPageId: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm">
        <span className="text-slate-600">Nom</span>
        <input
          value={name}
          onChange={(event) => onName(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm"
        />
      </label>
      <label className="block text-sm">
        <span className="text-slate-600">Couleur d’accent</span>
        <input
          type="color"
          value={theme.accent}
          onChange={(event) => onTheme({ ...theme, accent: event.target.value })}
          className="mt-1 h-9 w-full rounded-md border border-slate-200"
        />
      </label>
      <label className="block text-sm">
        <span className="text-slate-600">Titre d’accueil</span>
        <input
          value={theme.welcomeHeading}
          onChange={(event) => onTheme({ ...theme, welcomeHeading: event.target.value })}
          className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm"
        />
      </label>
      <label className="block text-sm">
        <span className="text-slate-600">Sous-titre</span>
        <textarea
          value={theme.welcomeSub}
          onChange={(event) => onTheme({ ...theme, welcomeSub: event.target.value })}
          rows={3}
          className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm"
        />
      </label>
      <div>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Pages</p>
        <ul className="space-y-2">
          {pages.map((page) => {
            const locked = page.kind === "home" || page.kind === "quotes";
            const active = page.id === pageId;
            return (
              <li key={page.id} className={`space-y-1.5 rounded-md p-2 ${active ? "bg-orange-50" : "ring-1 ring-slate-200"}`}>
                <button
                  type="button"
                  onClick={() => onPageId(page.id)}
                  className={`w-full text-left text-sm ${active ? "font-medium text-[#C2410C]" : "text-slate-700"}`}
                >
                  {page.title}
                </button>
                <input
                  value={page.title}
                  onChange={(event) =>
                    onPages(pages.map((row) => (row.id === page.id ? { ...row, title: event.target.value } : row)))
                  }
                  className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
                />
                {locked ? (
                  <p className="text-[11px] text-slate-400">/{page.slug}</p>
                ) : (
                  <input
                    value={page.slug}
                    onChange={(event) =>
                      onPages(
                        pages.map((row) =>
                          row.id === page.id
                            ? { ...row, slug: uniqueMemberPageSlug(pages, event.target.value || row.title, page.id) }
                            : row,
                        ),
                      )
                    }
                    className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
                  />
                )}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={page.isPublished}
                      onChange={(event) =>
                        onPages(
                          pages.map((row) => (row.id === page.id ? { ...row, isPublished: event.target.checked } : row)),
                        )
                      }
                    />
                    Publiée
                  </label>
                  {!locked && pages.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        const next = pages.filter((row) => row.id !== page.id);
                        onPages(next);
                        if (pageId === page.id) onPageId(next[0]?.id ?? "");
                      }}
                      className="text-xs text-rose-700"
                    >
                      Retirer
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={() => {
            const id = newMemberId();
            const title = "Nouvelle page";
            onPages([
              ...pages,
              {
                id,
                kind: "custom",
                slug: uniqueMemberPageSlug(pages, title),
                title,
                blocks: [emptyMemberBlock("text")],
                isPublished: true,
                sortOrder: pages.length,
              },
            ]);
            onPageId(id);
          }}
          className="mt-2 text-sm text-[#C2410C]"
        >
          Ajouter une page
        </button>
      </div>
    </div>
  );
}
