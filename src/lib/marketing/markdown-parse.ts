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

export function calloutKind(text: string): CalloutKind {
  const trimmed = text.replace(/^\*\*|\*\*$/g, "").trim();
  if (/^(note|astuce|tip)\b/i.test(trimmed)) return "tip";
  if (/^(attention|warning|avertissement)\b/i.test(trimmed)) return "warning";
  return "quote";
}

export function paragraphCalloutKind(text: string): Exclude<CalloutKind, "quote"> | null {
  const kind = calloutKind(text);
  return kind === "quote" ? null : kind;
}
