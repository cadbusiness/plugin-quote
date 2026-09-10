import { Chip, scoreTone, statusTone, type ChipTone } from "@/components/ui/chip";
import { formatPrice, formatRelative } from "@/lib/format";
import type { QuoteInboxCue } from "@/lib/crm/quote-next-action";

export type QuoteListExtras = {
  itemCount: number;
  firstName: string | null;
  priceMin: number | null;
  priceMax: number | null;
  opened: boolean;
  validationStatus: string;
  validationApproved: number;
  validationTotal: number;
  source: string;
  reasons: string[];
  context: string | null;
  cue: QuoteInboxCue | null;
};

function validationTone(status: string): ChipTone {
  if (status === "approved") return "emerald";
  if (status === "changes_requested") return "amber";
  if (status === "partial") return "orange";
  if (status === "pending") return "violet";
  return "slate";
}

export function emptyQuoteExtras(opened: boolean): QuoteListExtras {
  return {
    itemCount: 0,
    firstName: null,
    priceMin: null,
    priceMax: null,
    opened,
    validationStatus: "none",
    validationApproved: 0,
    validationTotal: 0,
    source: "Direct",
    reasons: [],
    context: null,
    cue: null,
  };
}

export function QuoteDossierCell({
  name,
  company,
  email,
  assigned,
  statusLabel,
  statusSlug,
  score,
  scoreLabel,
  extras,
}: {
  name: string;
  company: string | null;
  email: string;
  assigned: string;
  statusLabel: string;
  statusSlug: string;
  score: number | null;
  scoreLabel: string | null;
  extras: QuoteListExtras;
}) {
  const place = company || email;
  const meta = [place, extras.source !== "Direct" ? extras.source : null].filter(Boolean).join(" · ");
  return (
    <td className="px-4 py-3.5 lg:px-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold tracking-tight text-slate-900">{name}</span>
        <Chip tone={scoreTone(scoreLabel)}>
          {(scoreLabel ?? "-").toUpperCase()}
          {score != null ? ` ${score}` : ""}
        </Chip>
        <Chip tone={statusTone(statusSlug)}>{statusLabel}</Chip>
      </div>
      {meta ? <p className="mt-0.5 text-sm text-slate-500">{meta}</p> : null}
      {extras.cue ? (
        <p className={`mt-1.5 line-clamp-2 text-sm ${extras.cue.hot ? "text-slate-900" : "text-slate-600"}`}>
          <span className="mr-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
            {extras.cue.kicker}
          </span>
          {extras.cue.quoted ? `« ${extras.cue.title} »` : extras.cue.title}
        </p>
      ) : null}
      {assigned && assigned !== "-" ? <p className="mt-1 text-xs text-slate-400">Suivi par {assigned}</p> : null}
    </td>
  );
}

export function QuoteProjectCell({ extras }: { extras: QuoteListExtras }) {
  const count = extras.itemCount;
  return (
    <td className="px-4 py-3.5 lg:px-6">
      <div className="font-medium text-slate-900">
        {count ? `${count} produit${count > 1 ? "s" : ""} · ${formatPrice(extras.priceMin, extras.priceMax)}` : "Pas encore de configuration"}
      </div>
      {count && extras.firstName ? <p className="mt-0.5 text-sm text-slate-500">{extras.firstName}</p> : null}
      {extras.reasons.length ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {extras.reasons.slice(0, 3).map((reason) => (
            <Chip key={reason} tone="orange">
              {reason}
            </Chip>
          ))}
        </div>
      ) : extras.context ? (
        <p className="mt-1 text-xs text-slate-500">{extras.context}</p>
      ) : null}
      {extras.validationTotal > 0 ? (
        <div className="mt-1.5">
          <Chip tone={validationTone(extras.validationStatus)}>
            {extras.validationStatus === "approved"
              ? `Validé ${extras.validationApproved}/${extras.validationTotal}`
              : extras.validationStatus === "changes_requested"
                ? "Modifs demandées"
                : `${extras.validationApproved}/${extras.validationTotal} validations`}
          </Chip>
        </div>
      ) : null}
    </td>
  );
}

export function QuoteScoreCell({
  score,
}: {
  score: number | null;
  scoreLabel?: string | null;
}) {
  return (
    <td className="w-24 px-4 py-3.5 lg:w-28 lg:px-6">
      <span className="text-3xl font-semibold leading-none tabular-nums tracking-tight text-slate-900">
        {score != null ? score : "–"}
      </span>
    </td>
  );
}

export function QuoteReceivedCell({
  createdAt,
  extras,
}: {
  createdAt: string;
  extras: QuoteListExtras;
}) {
  return (
    <td className="w-32 px-4 py-3.5 lg:px-6">
      <div className={`text-sm ${extras.opened ? "font-medium text-slate-900" : "text-lg font-semibold leading-tight text-slate-900"}`}>
        {formatRelative(createdAt)}
      </div>
      <div className="mt-1">
        {extras.opened ? (
          <Chip tone="slate">Consulté</Chip>
        ) : (
          <Chip tone="orange">À ouvrir</Chip>
        )}
      </div>
    </td>
  );
}
