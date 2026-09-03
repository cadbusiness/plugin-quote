export function formatPrice(min: number | null | undefined, max: number | null | undefined) {
  if (min == null && max == null) return "Sur devis";
  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n);
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`;
  return fmt((min ?? max) as number);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(diff)) return formatDate(iso);
  const min = Math.round(diff / 60_000);
  if (min < 1) return "À l’instant";
  if (min < 60) return `Il y a ${min} min`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 14) return `Il y a ${days} j`;
  return formatDate(iso);
}

export function formatEur(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatWhen(iso: string) {
  const target = new Date(iso).getTime();
  const diff = target - Date.now();
  if (!Number.isFinite(diff)) return formatDate(iso);
  if (Math.abs(diff) < 60_000) return "Maintenant";
  if (diff > 0) {
    const min = Math.round(diff / 60_000);
    if (min < 60) return `Dans ${min} min`;
    const hours = Math.round(min / 60);
    if (hours < 24) return `Dans ${hours} h`;
    const days = Math.round(hours / 24);
    if (days < 14) return `Dans ${days} j`;
    return formatDate(iso);
  }
  return formatRelative(iso);
}

export function formatHours(hours: number | null | undefined) {
  if (hours == null || Number.isNaN(hours)) return "—";
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, "0")}`;
}

export function formatPercent(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "—";
  return `${Math.round(value)}%`;
}
