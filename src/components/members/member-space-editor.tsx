"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ChevronLeft, Eye } from "lucide-react";
import { saveMemberSpace } from "@/app/(app)/membres/actions";
import { MemberSpaceBuilder } from "@/components/members/member-space-builder";
import { ListPanel } from "@/components/ui/list-panel";
import type { MemberPageDraft, MemberResourceDraft, MemberTheme } from "@/lib/members/types";

export function MemberSpaceEditor({
  space,
  pages: initialPages,
  resources: initialResources,
  publicUrl,
  orgSlug,
}: {
  space: { id: string; name: string; slug: string; status: string; theme: MemberTheme };
  pages: MemberPageDraft[];
  resources: MemberResourceDraft[];
  publicUrl: string;
  orgSlug: string;
}) {
  const [name, setName] = useState(space.name);
  const [status, setStatus] = useState(space.status);
  const [theme, setTheme] = useState(space.theme);
  const [pages, setPages] = useState(initialPages);
  const [resources, setResources] = useState(initialResources);
  const [pageId, setPageId] = useState(initialPages[0]?.id ?? "");
  const [pending, startTransition] = useTransition();

  function payload(nextStatus = status) {
    const data = new FormData();
    data.set("id", space.id);
    data.set("name", name);
    data.set("status", nextStatus);
    data.set("theme", JSON.stringify(theme));
    data.set("pages", JSON.stringify(pages));
    data.set("resources", JSON.stringify(resources));
    return data;
  }

  return (
    <ListPanel className="min-h-0 flex-1 overflow-hidden">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-stone-800 bg-stone-900 px-2 text-white">
        <Link
          href="/membres"
          aria-label="Retour aux espaces membres"
          className="-ml-1 inline-flex h-8 shrink-0 items-center gap-0.5 rounded-md px-1.5 text-sm text-white/80 hover:bg-white/10 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Retour
        </Link>
        <select
          value={pageId}
          onChange={(event) => setPageId(event.target.value)}
          aria-label="Page à éditer"
          className="h-8 min-w-0 max-w-44 rounded-md border border-white/15 bg-white/10 px-2 text-sm text-white"
        >
          {pages.map((item) => (
            <option key={item.id} value={item.id} className="text-slate-900">
              {item.title}
            </option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-1.5">
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Prévisualiser l’espace"
            title="Prévisualiser"
            className="flex h-8 w-8 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"
          >
            <Eye className="h-4 w-4" aria-hidden />
          </a>
          <button
            type="button"
            onClick={() => startTransition(() => { void saveMemberSpace(payload()); })}
            className="h-8 rounded-md border border-white/15 bg-white/10 px-3 text-sm text-white hover:bg-white/15"
          >
            {pending ? "Mise à jour…" : "Mettre à jour"}
          </button>
          <button
            type="button"
            onClick={() => {
              const next = status === "published" ? "draft" : "published";
              startTransition(async () => {
                await saveMemberSpace(payload(next));
                setStatus(next);
              });
            }}
            className="h-8 rounded-md bg-[#E85D04] px-3 text-sm font-medium text-white hover:bg-[#d35400]"
          >
            {status === "published" ? "Dépublier" : "Publier"}
          </button>
        </div>
      </div>
      <MemberSpaceBuilder
        spaceId={space.id}
        name={name}
        theme={theme}
        pages={pages}
        pageId={pageId}
        resources={resources}
        orgSlug={orgSlug}
        spaceSlug={space.slug}
        onName={setName}
        onTheme={setTheme}
        onPages={setPages}
        onResources={setResources}
        onPageId={setPageId}
      />
    </ListPanel>
  );
}
