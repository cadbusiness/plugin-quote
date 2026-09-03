const TONES = {
  emerald: "bg-emerald-50 text-emerald-800",
  amber: "bg-amber-50 text-amber-800",
  orange: "bg-orange-50 text-orange-800",
  rose: "bg-rose-50 text-rose-800",
  violet: "bg-violet-50 text-violet-800",
  sky: "bg-sky-50 text-sky-800",
  slate: "bg-slate-100 text-slate-600",
  indigo: "bg-indigo-50 text-indigo-800",
} as const;

export type ChipTone = keyof typeof TONES;

export function Chip({
  tone,
  children,
}: {
  tone: ChipTone;
  children: React.ReactNode;
}) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${TONES[tone]}`}>
      {children}
    </span>
  );
}

export function scoreTone(label: string | null | undefined): ChipTone {
  if (label === "hot") return "rose";
  if (label === "warm") return "orange";
  if (label === "cold") return "sky";
  return "slate";
}

export function statusTone(slug: string | null | undefined): ChipTone {
  if (slug === "new") return "sky";
  if (slug === "contacted") return "amber";
  if (slug === "in_progress") return "violet";
  if (slug === "won") return "emerald";
  if (slug === "lost") return "rose";
  if (slug === "waiting") return "slate";
  return "slate";
}
