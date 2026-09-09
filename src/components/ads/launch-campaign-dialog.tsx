"use client";

import { useEffect, useState } from "react";
import { CopyBlock } from "@/components/funnels/copy-block";
import { keywordsAsPaste, type KeywordPack } from "@/lib/ads/keywords";
import { formatEurExact, formatPercent } from "@/lib/format";
import type { CampaignStatsRow } from "@/lib/stats/dashboard";

export type LandingUrl = {
  funnelId: string;
  name: string;
  sector: string;
  url: string;
  campaign: string;
};

export function LaunchCampaignDialog({
  open,
  onClose,
  packs,
  landingUrls,
  initialFunnelId,
  campaign,
}: {
  open: boolean;
  onClose: () => void;
  packs: KeywordPack[];
  landingUrls: LandingUrl[];
  initialFunnelId?: string | null;
  campaign?: CampaignStatsRow | null;
}) {
  if (!open) return null;
  return (
    <LaunchBody
      key={`${campaign?.campaign ?? "new"}-${initialFunnelId ?? ""}`}
      onClose={onClose}
      packs={packs}
      landingUrls={landingUrls}
      initialFunnelId={initialFunnelId}
      campaign={campaign}
    />
  );
}

function LaunchBody({
  onClose,
  packs,
  landingUrls,
  initialFunnelId,
  campaign,
}: {
  onClose: () => void;
  packs: KeywordPack[];
  landingUrls: LandingUrl[];
  initialFunnelId?: string | null;
  campaign?: CampaignStatsRow | null;
}) {
  const startId = initialFunnelId || landingUrls[0]?.funnelId || "";
  const [funnelId, setFunnelId] = useState(startId);
  const current = landingUrls.find((item) => item.funnelId === funnelId) ?? landingUrls[0];
  const [sector, setSector] = useState(current ? packSector(packs, current.sector) : packs[0]?.sector ?? "general");
  const pack = packs.find((item) => item.sector === sector) ?? packs[0];

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const title = campaign ? campaign.campaign : "Préparer une campagne";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Fermer" className="absolute inset-0 bg-slate-950/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ads-campaign-title"
        className="relative z-10 flex max-h-[min(40rem,calc(100dvh-2rem))] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
      >
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#E85D04]">Google Ads</p>
          <h2 id="ads-campaign-title" className="mt-1 text-lg font-semibold text-slate-900">
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {campaign
              ? "URL, nom et mots-clés de cette pub. La campagne se crée dans Google Ads."
              : "Search · Leads · 10–30 € / jour. QuoteBuilder fournit le lien et les mots-clés."}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {campaign ? (
            <div className="mb-4 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 px-3 py-3 text-center">
              <Stat label="Devis" value={String(campaign.quotes)} />
              <Stat label="Gagnés" value={String(campaign.won)} />
              <Stat
                label="Un devis"
                value={campaign.costPerQuote != null ? formatEurExact(campaign.costPerQuote) : "— €"}
              />
            </div>
          ) : null}

          {landingUrls.length === 0 ? (
            <p className="text-sm text-slate-500">Créez d’abord un funnel : c’est la page d’arrivée de la pub.</p>
          ) : (
            <div className="space-y-4">
              <label className="block text-sm">
                <span className="font-medium text-slate-900">Funnel de destination</span>
                <span className="mt-0.5 block text-xs text-slate-500">Le visiteur arrive ici, pas sur votre site.</span>
                {landingUrls.length > 1 ? (
                  <select
                    value={current?.funnelId ?? ""}
                    onChange={(event) => {
                      const next = event.target.value;
                      setFunnelId(next);
                      const landing = landingUrls.find((item) => item.funnelId === next);
                      if (landing) setSector(packSector(packs, landing.sector));
                    }}
                    className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    {landingUrls.map((item) => (
                      <option key={item.funnelId} value={item.funnelId}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="mt-2 font-medium text-slate-900">{current?.name}</p>
                )}
              </label>

              {current ? (
                <div>
                  <p className="text-sm font-medium text-slate-900">URL à coller dans l’annonce</p>
                  <p className="mt-0.5 text-xs text-slate-500">Ne modifiez pas le lien : le suivi est déjà dedans.</p>
                  <UrlCopy value={current.url} />
                  {pack ? (
                    <p className="mt-2 text-sm text-slate-600">
                      Nommez la campagne{" "}
                      <span className="rounded bg-orange-50 px-1.5 py-0.5 font-mono text-[13px] font-medium text-[#C2410C]">
                        {pack.campaignName}
                      </span>
                    </p>
                  ) : null}
                </div>
              ) : null}

              {pack ? (
                <details className="rounded-lg bg-slate-50 px-3 py-3">
                  <summary className="cursor-pointer text-sm font-medium text-slate-900">
                    Mots-clés du métier
                  </summary>
                  <p className="mt-1 text-xs text-slate-500">À coller dans le groupe d’annonces Google Ads.</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {packs.map((item) => (
                      <button
                        key={item.sector}
                        type="button"
                        onClick={() => setSector(item.sector)}
                        className={`rounded-full px-2.5 py-1 text-sm ${
                          item.sector === sector
                            ? "bg-orange-50 font-medium text-[#C2410C]"
                            : "text-slate-600 hover:bg-white"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3">
                    <CopyBlock
                      compact
                      label="Liste à coller"
                      hint="« … » expression, [ … ] exact, − … à exclure."
                      value={keywordsAsPaste(pack)}
                    />
                  </div>
                </details>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-5 py-3">
          <p className="text-xs text-slate-500">
            {campaign && campaign.conversion != null ? `Conversion ${formatPercent(campaign.conversion)}` : "La pub se crée dans Google Ads."}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#D45203]"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}

function UrlCopy({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <p className="min-w-0 flex-1 truncate rounded-md bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700 ring-1 ring-slate-200">
        {value}
      </p>
      <button
        type="button"
        onClick={() => void copy()}
        className="shrink-0 rounded-md px-2.5 py-1.5 text-sm font-medium text-[#C2410C] ring-1 ring-orange-200 hover:bg-orange-50"
      >
        {copied ? "Copié" : "Copier"}
      </button>
    </div>
  );
}

function packSector(packs: KeywordPack[], sector: string) {
  return packs.some((item) => item.sector === sector) ? sector : packs[0]?.sector ?? "general";
}

export function campaignLanding(row: CampaignStatsRow, urls: LandingUrl[]) {
  if (row.funnelId) return urls.find((item) => item.funnelId === row.funnelId) ?? null;
  return urls.find((item) => item.campaign === row.campaign) ?? null;
}
