"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ListPanel } from "@/components/ui/list-panel";
import { Chip } from "@/components/ui/chip";
import { LocalTabNav, replaceClientUrl } from "@/components/ui/local-tabs";
import { agentShortcode, agentWidgetSnippet, captureShortcode, captureWidgetSnippet } from "@/lib/configurator/capture-embed";
import { CopyBlock } from "@/components/funnels/copy-block";
import { FunnelAutomations } from "@/components/funnels/funnel-automations";
import { FunnelStatsPanel } from "@/components/funnels/funnel-stats-panel";
import { ParcoursBuilder } from "@/components/funnels/parcours-builder";
import type { PreviewProduct } from "@/components/funnels/parcours-preview";
import { renameFunnel, saveFunnelTracking, setFunnelActive } from "@/app/(app)/funnels/actions";
import { FunnelRowActions } from "@/components/funnels/funnel-row-actions";
import type { FunnelKind } from "@/lib/funnels/builder";
import { funnelKindHint, funnelKindLabel, funnelKindTone } from "@/lib/funnels/kind";
import type { FunnelAutomationBoard } from "@/lib/funnels/automations";
import type { Tables } from "@/lib/db/database.types";
import { FUNNEL_TABS, type FunnelTab } from "@/lib/funnels/tabs";
import type { FunnelTracking } from "@/lib/funnels/tracking";
import type { StatsDashboard } from "@/lib/stats/dashboard";

function tabHref(funnelId: string, tab: FunnelTab) {
  return tab === "parcours" ? `/funnels/${funnelId}` : `/funnels/${funnelId}?tab=${tab}`;
}

export function FunnelEditor({
  funnel,
  steps,
  questions,
  products,
  automations,
  funnels,
  statuses,
  tracking,
  orgGa,
  publicUrl,
  orgSlug,
  tab: initialTab,
  stats,
}: {
  funnel: {
    id: string;
    name: string;
    slug: string;
    kind: FunnelKind;
    isActive: boolean;
  };
  steps: Tables<"wizard_steps">[];
  questions: Tables<"wizard_questions">[];
  products: PreviewProduct[];
  automations: FunnelAutomationBoard;
  funnels: { id: string; name: string }[];
  statuses: { slug: string; label: string }[];
  tracking: FunnelTracking;
  orgGa: string;
  publicUrl: string;
  orgSlug: string;
  tab: FunnelTab;
  stats: StatsDashboard | null;
}) {
  const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState(initialTab);
  const embedUrl = publicUrl.replace("/c/", "/embed/");
  const widgetOrigin = new URL("/widget.js", publicUrl).origin;
  const widget = `<div data-quotebuilder data-org="${orgSlug}" data-id="${funnel.slug}"></div>\n<script src="${widgetOrigin}/widget.js" async></script>`;
  const capture = captureWidgetSnippet(widgetOrigin, orgSlug, funnel.slug);
  const agent = agentWidgetSnippet(widgetOrigin, orgSlug, funnel.slug);
  const iframe = `<iframe src="${embedUrl}" title="${funnel.name}" style="width:100%;min-height:720px;border:0"></iframe>`;
  const shortcode = `[quotebuilder org="${orgSlug}" id="${funnel.slug}"]`;
  const captureCode = captureShortcode(orgSlug, funnel.slug);
  const agentCode = agentShortcode(orgSlug, funnel.slug);

  function commitName(value: string) {
    const next = value.trim();
    if (!next || next === funnel.name) return;
    startTransition(() => {
      void renameFunnel(funnel.id, next);
    });
  }

  return (
    <ListPanel className="min-h-0">
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="flex items-stretch gap-3 px-4 lg:px-6">
          <div className="flex shrink-0 items-center gap-2 py-2">
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
              className="w-40 min-w-0 bg-transparent text-sm font-semibold text-slate-900 outline-none sm:w-48"
            />
            <span title={funnelKindHint(funnel.kind)}>
              <Chip tone={funnelKindTone(funnel.kind)}>{funnelKindLabel(funnel.kind)}</Chip>
            </span>
          </div>
          <LocalTabNav
            items={FUNNEL_TABS}
            active={tab}
            onSelect={(next) => {
              setTab(next);
              replaceClientUrl(tabHref(funnel.id, next));
            }}
            className="flex min-w-0 flex-1 items-stretch gap-5 overflow-x-auto"
          />
          <div className="flex shrink-0 items-center gap-2 py-2">
            <Link
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              Tester
            </Link>
            <button
              type="button"
              disabled={pending}
              onClick={() => startTransition(() => void setFunnelActive(funnel.id, !funnel.isActive))}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${
                funnel.isActive
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "bg-[#E85D04] text-white hover:bg-[#d35400]"
              }`}
            >
              {funnel.isActive ? "Publié" : "Publier"}
            </button>
            <FunnelRowActions
              funnelId={funnel.id}
              name={funnel.name}
              publicUrl={publicUrl}
              isActive={funnel.isActive}
              showArchive={false}
              showPreview={false}
            />
          </div>
        </div>
      </div>

      {tab === "parcours" ? (
        <div className="flex min-h-[36rem] flex-1 flex-col lg:min-h-[calc(100dvh-12rem)]">
          <ParcoursBuilder
            funnelId={funnel.id}
            kind={funnel.kind}
            steps={steps}
            questions={questions}
            products={products}
          />
        </div>
      ) : null}

      {tab === "stats" && stats ? <FunnelStatsPanel funnelId={funnel.id} stats={stats} /> : null}

      {tab === "automations" ? (
        <FunnelAutomations
          funnelId={funnel.id}
          funnelName={funnel.name}
          board={automations}
          funnels={funnels}
          statuses={statuses}
        />
      ) : null}

      {tab === "lien" ? (
        <>
          <div className="border-b border-slate-100 px-4 py-3 lg:px-6">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Diffusion</p>
            <p className="mt-0.5 text-sm text-slate-500">
              Page publique, funnel complet, carte « une question », et bloc chat agent.
            </p>
          </div>
          <CopyBlock label="Lien public" value={publicUrl} />
          <CopyBlock label="Widget JS" value={widget} />
          <CopyBlock label="Module question" value={capture} />
          <CopyBlock label="Module agent" value={agent} />
          <CopyBlock label="Iframe" value={iframe} />
          <CopyBlock label="Shortcode WordPress" value={shortcode} />
          <CopyBlock label="Shortcode question" value={captureCode} />
          <CopyBlock label="Shortcode agent" value={agentCode} />
        </>
      ) : null}

      {tab === "suivi" ? (
        <form action={saveFunnelTracking} className="grid gap-4 px-4 py-6 lg:px-6">
          <input type="hidden" name="id" value={funnel.id} />
          <p className="text-sm text-slate-500">
            Mesurez ce funnel. Les IDs ici remplacent le suivi d’espace
            {orgGa ? ` (GA espace : ${orgGa})` : ""}. GTM charge le conteneur ; sans GTM, GA4 part en direct.
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
