import type { ShopEditorDraft } from "@/lib/shops/draft";
import type { ShopAgentSelection } from "@/lib/shops/agent/selection";

export const SHOP_TOOL_LABEL: Record<string, string> = {
  get_tree: "Lecture de la page",
  get_shop: "Lecture de la boutique",
  insert_node: "Ajout d’un bloc",
  add_block: "Ajout d’un bloc",
  update_node: "Mise à jour du bloc",
  update_block: "Mise à jour du bloc",
  delete_node: "Suppression d’un bloc",
  remove_block: "Suppression d’un bloc",
  move_node: "Déplacement d’un bloc",
  reorder_blocks: "Déplacement d’un bloc",
  set_page_seo: "SEO de la page",
  set_theme: "Couleurs",
  set_seo: "SEO / GEO",
  set_legal: "Mentions légales",
  add_page: "Nouvelle page",
  set_name: "Nom de la boutique",
  set_nav: "Menu",
  set_status: "Publication",
};

export function shopToolLabel(name: string) {
  return SHOP_TOOL_LABEL[name] ?? name.replace(/_/g, " ");
}

export function shopToolTouched(name: string, args: Record<string, unknown>, summary: string) {
  const pageSlug = typeof args.slug === "string" ? args.slug : undefined;
  let nodeId = typeof args.id === "string" ? args.id : undefined;
  if (!nodeId) {
    const match = summary.match(/\(([0-9a-f-]{8,})\)/i);
    if (match?.[1]) nodeId = match[1];
  }
  const mutated = !["get_tree", "get_shop"].includes(name);
  return { pageSlug, nodeId, mutated };
}

export type ShopAgentToolStep = {
  name: string;
  label: string;
  status: "run" | "ok" | "error";
  summary?: string;
};

export type ShopAgentStreamEvent =
  | { type: "tool"; step: ShopAgentToolStep; nodeId?: string; pageSlug?: string }
  | { type: "draft"; draft: ShopEditorDraft }
  | { type: "text"; text: string }
  | { type: "done"; text: string; draft: ShopEditorDraft; nodeId?: string; pageSlug?: string }
  | { type: "error"; error: string };

export function encodeShopAgentSse(event: ShopAgentStreamEvent) {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export function parseShopAgentSse(buffer: string) {
  const events: ShopAgentStreamEvent[] = [];
  const parts = buffer.split("\n\n");
  const rest = parts.pop() ?? "";
  for (const part of parts) {
    const line = part
      .split("\n")
      .filter((row) => row.startsWith("data:"))
      .map((row) => row.slice(5).trim())
      .join("");
    if (!line) continue;
    try {
      const parsed = JSON.parse(line) as ShopAgentStreamEvent;
      if (parsed && typeof parsed === "object" && typeof parsed.type === "string") events.push(parsed);
    } catch {
      /* ignore a truncated frame */
    }
  }
  return { events, rest };
}

export function shopAgentClosingText(text: string, toolTrace: { name: string; status: string }[]) {
  const clean = text.trim();
  if (clean) return clean;
  const wrote = toolTrace.some((item) => item.status === "ok" && !["get_tree", "get_shop"].includes(item.name));
  if (wrote) return "C’est mis à jour.";
  if (toolTrace.some((item) => item.status === "error")) {
    return "Je n’ai pas pu modifier la page. Réessaie : « Ajoute une section à propos sous le bandeau ».";
  }
  return "C’est mis à jour.";
}

export function shopChatChips(selection?: ShopAgentSelection | null) {
  if (selection?.kind === "chrome") {
    return selection.chrome === "header"
      ? ["Renomme la boutique", "Simplifie le menu", "Mets Devis en avant"]
      : ["Garde seulement le légal", "Ajoute Mentions et CGV"];
  }
  if (selection?.kind === "node") {
    return ["Réécris le titre", "Raccourcis le texte", "Change l’image", "Plus premium"];
  }
  return ["Plus premium", "Ajoute une section à propos", "Présente l’équipe", "Raccourcis les textes", "Change l’image du bandeau", "Ajoute une FAQ"];
}

export function shopChatFollowUps() {
  return ["Plus net", "Autre texte"];
}
