"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CopyBlock } from "@/components/funnels/copy-block";
import { keywordsAsPaste, type KeywordPack } from "@/lib/ads/keywords";
import { LANDING_KIND_LABEL, type AdsLanding, type AdsLandingKind } from "@/lib/ads/landings";
import { CAMPAIGN_STEPS } from "@/lib/ads/utm";
import { formatEurExact, formatPercent } from "@/lib/format";
import type { CampaignStatsRow } from "@/lib/stats/dashboard";

export type LandingUrl = AdsLanding;

const GOOGLE_ADS_URL = "https://ads.google.com";

const KIND_ORDER: AdsLandingKind[] = ["funnel", "shop", "wordpress"];

export function LaunchCampaignDialog({
  open,
  onClose,
  packs,
  landingUrls,
  initialLandingId,
  campaign,
  adsConnected,
}: {
  open: boolean;
  onClose: () => void;
  packs: KeywordPack[];
  landingUrls: AdsLanding[];
  initialLandingId?: string | null;
  campaign?: CampaignStatsRow | null;
  adsConnected?: boolean;
}) {
  if (!open) return null;
  return (
    <LaunchBody
      key={`${campaign?.campaign ?? "new"}-${initialLandingId ?? ""}`}
      onClose={onClose}
      packs={packs}
      landingUrls={landingUrls}
      initialLandingId={initialLandingId}
      campaign={campaign}
      adsConnected={adsConnected}
    />
  );
}

function LaunchBody({
  onClose,
  packs,
  landingUrls,
  initialLandingId,
  campaign,
  adsConnected,
}: {
  onClose: () => void;
  packs: KeywordPack[];
  landingUrls: AdsLanding[];
  initialLandingId?: string | null;
  campaign?: CampaignStatsRow | null;
  adsConnected?: boolean;
}) {
  const start = landingUrls.find((item) => item.id === initialLandingId) ?? landingUrls[0];
  const [landingId, setLandingId] = useState(start?.id ?? "");
  const current = landingUrls.find((item) => item.id === landingId) ?? landingUrls[0];
  const [sector, setSector] = useState(current ? packSector(packs, current.sector) : packs[0]?.sector ?? "general");
  const pack = packs.find((item) => item.sector === sector) ?? packs[0];
  const kinds = KIND_ORDER.filter((item) => landingsOf(landingUrls, item).length > 0);
  const [kind, setKind] = useState<AdsLandingKind>(current?.kind ?? kinds[0] ?? "funnel");
  const ofKind = useMemo(() => landingsOf(landingUrls, kind), [landingUrls, kind]);
  const selected = ofKind.find((item) => item.id === landingId) ?? ofKind[0] ?? current;

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
            Trois gestes. La pub se crée dans Google Ads, pas ici.
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
            <p className="text-sm text-slate-500">
              Publiez un funnel, une boutique, ou branchez WordPress : c’est la page d’arrivée de la pub.
            </p>
          ) : (
            <div className="space-y-5">
              <Step n={1} title={CAMPAIGN_STEPS[0].title} text={CAMPAIGN_STEPS[0].text}>
                {kinds.length > 1 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {kinds.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setKind(item);
                          const next = landingsOf(landingUrls, item)[0];
                          if (next) {
                            setLandingId(next.id);
                            setSector(packSector(packs, next.sector));
                          }
                        }}
                        className={`rounded-full px-3 py-1.5 text-sm ${
                          item === kind
                            ? "bg-orange-50 font-medium text-[#C2410C]"
                            : "text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {LANDING_KIND_LABEL[item]}
                      </button>
                    ))}
                  </div>
                ) : null}
                {ofKind.length > 1 ? (
                  <select
                    value={selected?.id ?? ""}
                    onChange={(event) => {
                      const next = landingUrls.find((item) => item.id === event.target.value);
                      if (!next) return;
                      setLandingId(next.id);
                      setKind(next.kind);
                      setSector(packSector(packs, next.sector));
                    }}
                    className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    {ofKind.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="mt-2 font-medium text-slate-900">{selected?.name}</p>
                )}
                {selected ? <p className="mt-1 text-xs text-slate-500">{selected.hint}</p> : null}
              </Step>

              {selected ? (
                <Step n={2} title={CAMPAIGN_STEPS[1].title} text={CAMPAIGN_STEPS[1].text}>
                  <UrlCopy value={selected.url} />
                  {pack ? (
                    <p className="mt-2 text-sm text-slate-600">
                      Dans Google Ads, nommez la campagne{" "}
                      <span className="rounded bg-orange-50 px-1.5 py-0.5 font-mono text-[13px] font-medium text-[#C2410C]">
                        {pack.campaignName}
                      </span>
                    </p>
                  ) : null}
                </Step>
              ) : null}

              {pack ? (
                <details className="rounded-lg bg-slate-50 px-3 py-3">
                  <summary className="cursor-pointer text-sm font-medium text-slate-900">
                    Mots-clés du métier (optionnel)
                  </summary>
                  <p className="mt-1 text-xs text-slate-500">À coller dans le groupe d’annonces, si vous en créez un.</p>
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

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-5 py-3">
          <p className="text-xs text-slate-500">
            {adsConnected
              ? campaign && campaign.conversion != null
                ? `Conversion ${formatPercent(campaign.conversion)}`
                : "La pub se crée dans Google, pas ici."
              : "Ensuite, branchez le compte pour voir ce que ça coûte."}
          </p>
          <div className="flex items-center gap-2">
            <a
              href={GOOGLE_ADS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Ouvrir Google Ads
            </a>
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
    </div>
  );
}

function Step({
  n,
  title,
  text,
  children,
}: {
  n: number;
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-900">
        <span className="mr-1.5 tabular-nums text-slate-400">{n}.</span>
        {title}
      </p>
      <p className="mt-0.5 text-xs text-slate-500">{text}</p>
      {children}
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

function landingsOf(urls: AdsLanding[], kind: AdsLandingKind) {
  return urls.filter((item) => item.kind === kind);
}

function packSector(packs: KeywordPack[], sector: string) {
  return packs.some((item) => item.sector === sector) ? sector : packs[0]?.sector ?? "general";
}

export { campaignLanding } from "@/lib/ads/landings";
