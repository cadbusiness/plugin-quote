import { Chip, type ChipTone } from "@/components/ui/chip";
import { formatPrice, formatRelative } from "@/lib/format";

export type QuoteListExtras = {
  itemCount: number;
  firstName: string | null;
  priceMin: number | null;
  priceMax: number | null;
  opened: boolean;
  validationStatus: string;
  validationApproved: number;
  validationTotal: number;
};

function validationTone(status: string): ChipTone {
  if (status === "approved") return "emerald";
  if (status === "changes_requested") return "amber";
  if (status === "partial") return "orange";
  if (status === "pending") return "violet";
  return "slate";
}

export function QuoteProjectCell({ extras }: { extras: QuoteListExtras }) {
  const count = extras.itemCount;
  return (
    <td className="px-4 py-2.5 lg:px-6">
      <div className="font-medium text-slate-900">
        {count ? `${count} produit${count > 1 ? "s" : ""}` : "Aucun produit"}
      </div>
      <div className="text-xs text-slate-500">
        {count ? extras.firstName ?? formatPrice(extras.priceMin, extras.priceMax) : "Pas encore de configuration"}
      </div>
      {count && extras.firstName ? (
        <div className="text-xs tabular-nums text-slate-400">{formatPrice(extras.priceMin, extras.priceMax)}</div>
      ) : null}
      {extras.validationTotal > 0 ? (
        <div className="mt-1">
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

export function QuoteReceivedCell({
  createdAt,
  extras,
}: {
  createdAt: string;
  extras: QuoteListExtras;
}) {
  return (
    <td className="px-4 py-2.5 lg:px-6">
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
