import type { Json } from "@/lib/db/database.types";
import type { FunnelKind } from "@/lib/funnels/builder";

export const FUNNEL_KIND_OPTIONS: {
  id: FunnelKind;
  label: string;
  hint: string;
  tone: "orange" | "violet" | "sky";
}[] = [
  {
    id: "form",
    label: "Formulaire",
    hint: "Questions de cadrage, puis les produits adaptés.",
    tone: "orange",
  },
  {
    id: "chat",
    label: "Chat IA",
    hint: "Le prospect décrit le projet, l’IA propose.",
    tone: "violet",
  },
  {
    id: "catalog",
    label: "Catalogue",
    hint: "Rayons, fiches produits, ajout au devis, une demande globale.",
    tone: "sky",
  },
];

export function isFunnelKind(value: string): value is FunnelKind {
  return value === "form" || value === "chat" || value === "catalog";
}

export function parseFunnelKind(
  theme: Json | Record<string, unknown> | null | undefined,
  wizardEnabled: boolean,
  chatEnabled: boolean,
): FunnelKind {
  if (theme && typeof theme === "object" && !Array.isArray(theme)) {
    const kind = (theme as { kind?: unknown }).kind;
    if (kind === "catalog") return "catalog";
  }
  if (chatEnabled && !wizardEnabled) return "chat";
  return "form";
}

export function funnelKindFlags(kind: FunnelKind): { wizardEnabled: boolean; chatEnabled: boolean } {
  if (kind === "chat") return { wizardEnabled: false, chatEnabled: true };
  return { wizardEnabled: true, chatEnabled: false };
}

export function themeWithKind(theme: Json | null | undefined, kind: FunnelKind): Json {
  const base =
    theme && typeof theme === "object" && !Array.isArray(theme)
      ? { ...(theme as Record<string, unknown>) }
      : {};
  if (kind === "catalog") return { ...base, kind: "catalog" } as Json;
  const next = { ...base };
  delete next.kind;
  return next as Json;
}

export function funnelKindLabel(kind: FunnelKind): string {
  return FUNNEL_KIND_OPTIONS.find((item) => item.id === kind)?.label ?? "Formulaire";
}

export function funnelKindTone(kind: FunnelKind): "orange" | "violet" | "sky" {
  return FUNNEL_KIND_OPTIONS.find((item) => item.id === kind)?.tone ?? "orange";
}

export function catalogDefaultName(formName: string) {
  if (formName.startsWith("Funnel ")) return `Catalogue ${formName.slice("Funnel ".length)}`;
  if (formName === "Nouveau funnel") return "Catalogue";
  if (formName.startsWith("Catalogue ")) return formName;
  return `Catalogue ${formName}`;
}

export function quoteLineCount(customization: {
  quantities?: Record<string, number>;
  storefrontLines?: { quantity: number }[];
} | null | undefined) {
  const quantities = Object.values(customization?.quantities ?? {}).reduce(
    (sum, qty) => sum + (Number(qty) > 0 ? Number(qty) : 0),
    0,
  );
  const extra = (customization?.storefrontLines ?? []).reduce(
    (sum, line) => sum + (Number(line.quantity) > 0 ? Number(line.quantity) : 0),
    0,
  );
  return quantities + extra;
}
