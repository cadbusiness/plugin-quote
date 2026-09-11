export const IMAGE_RE = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/;

export function parseImageLine(line: string) {
  const match = line.trim().match(IMAGE_RE);
  if (!match) return null;
  return { alt: match[1] ?? "", src: match[2] ?? "", title: match[3] };
}

export function parseCaption(line: string | undefined) {
  if (!line) return null;
  const trimmed = line.trim();
  const italic = trimmed.match(/^\*(.+)\*$/);
  if (italic) return italic[1] ?? null;
  return null;
}

export type CalloutKind = "tip" | "warning" | "quote";

const CALLOUT_LABEL: Record<Exclude<CalloutKind, "quote">, string> = {
  tip: "Astuce",
  warning: "Attention",
};

export function calloutLabel(kind: Exclude<CalloutKind, "quote">): string {
  return CALLOUT_LABEL[kind];
}

function githubCalloutKind(text: string): Exclude<CalloutKind, "quote"> | null {
  const match = text.trimStart().match(/^\[!(TIP|NOTE|WARNING|CAUTION|IMPORTANT)\]\s*/i);
  if (!match) return null;
  const token = match[1].toUpperCase();
  if (token === "WARNING" || token === "CAUTION") return "warning";
  return "tip";
}

export function calloutKind(text: string): CalloutKind {
  const trimmed = text.replace(/^\*\*|\*\*$/g, "").trim();
  const github = githubCalloutKind(trimmed);
  if (github) return github;
  if (/^(note|astuce|tip)\b/i.test(trimmed)) return "tip";
  if (/^(attention|warning|avertissement)\b/i.test(trimmed)) return "warning";
  return "quote";
}

export function paragraphCalloutKind(text: string): Exclude<CalloutKind, "quote"> | null {
  const kind = calloutKind(text);
  return kind === "quote" ? null : kind;
}

/** Enlève `[!TIP]` / `Astuce :` pour ne pas doubler le badge. */
export function stripCalloutPrefix(text: string): string {
  return text
    .replace(/^\s*\*\*|\*\*\s*$/g, "")
    .replace(/^\s*\[!(?:TIP|NOTE|WARNING|CAUTION|IMPORTANT)\]\s*/i, "")
    .replace(/^\s*(Astuce|Note|Attention|Tip|Warning|Avertissement)\s*:\s*/i, "")
    .trimStart();
}
