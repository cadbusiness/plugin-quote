"use client";

import { useTransition } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ListPanel } from "@/components/ui/list-panel";
import { CopyBlock } from "@/components/funnels/copy-block";
import { FunnelAutomations, type FunnelWorkflowRow } from "@/components/funnels/funnel-automations";
import { ParcoursBuilder } from "@/components/funnels/parcours-builder";
import type { PreviewProduct } from "@/components/funnels/parcours-preview";
import { renameFunnel, saveFunnelTracking, setFunnelActive } from "@/app/(app)/funnels/actions";
import type { Tables } from "@/lib/db/database.types";
import { FUNNEL_TABS, type FunnelTab } from "@/lib/funnels/tabs";
import type { FunnelTracking } from "@/lib/funnels/tracking";

function tabHref(funnelId: string, tab: FunnelTab) {
  return tab === "parcours" ? `/funnels/${funnelId}` : `/funnels/${funnelId}?tab=${tab}`;
}

export function FunnelEditor({
  funnel,
  orgName,
  steps,
  questions,
  products,
  workflows,
  funnels,
  statuses,
  tracking,
  orgGa,
  publicUrl,
  orgSlug,
  tab,
}: {
  funnel: {
    id: string;
    name: string;
    slug: string;
    wizardEnabled: boolean;
    chatEnabled: boolean;
    isActive: boolean;
  };
  orgName: string;
  steps: Tables<"wizard_steps">[];
  questions: Tables<"wizard_questions">[];
  products: PreviewProduct[];
  workflows: FunnelWorkflowRow[];
  funnels: { id: string; name: string }[];
  statuses: { slug: string; label: string }[];
  tracking: FunnelTracking;
  orgGa: string;
  publicUrl: string;
  orgSlug: string;
  tab: FunnelTab;
}) {
  const [pending, startTransition] = useTransition();
  const embedUrl = publicUrl.replace("/c/", "/embed/");
  const widget = `<div data-quotebuilder data-org="${orgSlug}" data-id="${funnel.slug}"></div>\n<script src="${new URL("/widget.js", publicUrl).origin}/widget.js" async></script>`;
  const iframe = `<iframe src="${embedUrl}" title="${funnel.name}" style="width:100%;min-height:720px;border:0"></iframe>`;
  const shortcode = `[quotebuilder org="${orgSlug}" id="${funnel.slug}"]`;

  function commitName(value: string) {
    const next = value.trim();
    if (!next || next === funnel.name) return;
    startTransition(() => {
      void renameFunnel(funnel.id, next);
    });
  }

  return (
    <ListPanel className="min-h-0">
      <div className="sticky top-0 z-20 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-2 lg:px-6">
          <Link
            href="/funnels"
            aria-label="Retour aux funnels"
            className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md px-1.5 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Retour
          </Link>
          <input
            defaultValue={funnel.name}
            aria-label="Nom du funnel"
            onBlur={(event) => commitName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") (event.target as HTMLInputElement).blur();
            }}
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none"
          />
          <Link
            href={publicUrl}
            target="_blank"
            className="rounded-md px-2 py-1.5 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          >
            Aperçu
          </Link>
          <button
            type="button"
            role="switch"
            aria-checked={funnel.isActive}
            disabled={pending}
            onClick={() => startTransition(() => void setFunnelActive(funnel.id, !funnel.isActive))}
            className={`inline-flex items-center gap-2.5 rounded-lg border px-2.5 py-1.5 disabled:opacity-50 ${
              funnel.isActive ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"
            }`}
          >
            <span className="text-left">
              <span className={`block text-sm font-medium leading-none ${funnel.isActive ? "text-emerald-800" : "text-slate-700"}`}>
                {funnel.isActive ? "Actif" : "Brouillon"}
              </span>
              <span className="mt-0.5 block text-[11px] leading-none text-slate-500">
                {funnel.isActive ? "Visible aux prospects" : "Invisible"}
              </span>
            </span>
            <span
              aria-hidden
              className={`relative h-5 w-9 shrink-0 rounded-full ${funnel.isActive ? "bg-emerald-500" : "bg-slate-300"}`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm ${
                  funnel.isActive ? "left-4" : "left-0.5"
                }`}
              />
            </span>
          </button>
        </div>
        <nav className="flex items-end gap-6 overflow-x-auto border-b border-slate-200 px-4 lg:px-6">
          {FUNNEL_TABS.map((item) => {
            const on = item.id === tab;
            return (
              <Link
                key={item.id}
                href={tabHref(funnel.id, item.id)}
                aria-current={on ? "page" : undefined}
                className={`relative shrink-0 py-2.5 text-sm ${
                  on ? "font-medium text-slate-900" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {item.label}
                <span aria-hidden className={`absolute inset-x-0 -bottom-px h-0.5 ${on ? "bg-[#E85D04]" : "bg-transparent"}`} />
              </Link>
            );
          })}
        </nav>
      </div>

      {tab === "parcours" ? (
        <div className="flex min-h-[36rem] flex-1 flex-col lg:min-h-[calc(100dvh-12rem)]">
          <ParcoursBuilder
            funnelId={funnel.id}
            funnelName={funnel.name}
            orgName={orgName}
            wizardEnabled={funnel.wizardEnabled}
            chatEnabled={funnel.chatEnabled}
            steps={steps}
            questions={questions}
            products={products}
          />
        </div>
      ) : null}

      {tab === "automations" ? (
        <FunnelAutomations
          funnelId={funnel.id}
          funnelName={funnel.name}
          workflows={workflows}
          funnels={funnels}
          statuses={statuses}
        />
      ) : null}

      {tab === "lien" ? (
        <>
          <div className="border-b border-slate-100 px-4 py-3 lg:px-6">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Diffusion</p>
            <p className="mt-0.5 text-sm text-slate-500">
              Page publique, widget sur votre site, ou shortcode WordPress — le même funnel.
            </p>
          </div>
          <CopyBlock label="Lien public" value={publicUrl} />
          <CopyBlock label="Widget JS" value={widget} />
          <CopyBlock label="Iframe" value={iframe} />
          <CopyBlock label="Shortcode WordPress" value={shortcode} />
        </>
      ) : null}

      {tab === "suivi" ? (
        <form action={saveFunnelTracking} className="grid gap-4 px-4 py-6 lg:px-6">
          <input type="hidden" name="id" value={funnel.id} />
          <p className="text-sm text-slate-500">
            Mesurez ce funnel. Les IDs ici priment sur le suivi d’espace
            {orgGa ? ` (GA espace : ${orgGa})` : ""}.
          </p>
          <label className="text-sm">
            <span className="font-medium text-slate-900">Google Analytics 4</span>
            <input
              name="ga"
              defaultValue={tracking.ga}
              placeholder="G-XXXXXXXX"
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-slate-900">Google Tag Manager</span>
            <input
              name="gtm"
              defaultValue={tracking.gtm}
              placeholder="GTM-XXXXXXX"
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-slate-900">Pixel Meta</span>
            <input
              name="meta_pixel"
              defaultValue={tracking.metaPixel}
              placeholder="1234567890"
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <div>
            <button className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400]">
              Enregistrer le suivi
            </button>
          </div>
        </form>
      ) : null}
    </ListPanel>
  );
}
