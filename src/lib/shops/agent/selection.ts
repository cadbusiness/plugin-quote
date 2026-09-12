import { shopNodeLabel } from "@/lib/shops/labels";

export type ShopAgentNodeSelection = {
  kind: "node";
  pageSlug: string;
  pageTitle: string;
  id: string;
  type: string;
};

export type ShopAgentChromeSelection = {
  kind: "chrome";
  chrome: "header" | "footer";
};

export type ShopAgentSelection = ShopAgentNodeSelection | ShopAgentChromeSelection;

export function parseShopAgentSelection(raw: unknown): ShopAgentSelection | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  if (value.kind === "chrome" && (value.chrome === "header" || value.chrome === "footer")) {
    return { kind: "chrome", chrome: value.chrome };
  }
  if (
    value.kind === "node" &&
    typeof value.pageSlug === "string" &&
    value.pageSlug.trim() &&
    typeof value.id === "string" &&
    value.id.trim() &&
    typeof value.type === "string" &&
    value.type.trim()
  ) {
    return {
      kind: "node",
      pageSlug: value.pageSlug,
      pageTitle: typeof value.pageTitle === "string" && value.pageTitle.trim() ? value.pageTitle : value.pageSlug,
      id: value.id,
      type: value.type,
    };
  }
  return null;
}

export function shopAgentSelectionLabel(selection: ShopAgentSelection) {
  if (selection.kind === "chrome") return selection.chrome === "header" ? "En-tête" : "Pied de page";
  return shopNodeLabel(selection.type);
}

export function shopAgentSelectionPrompt(selection: ShopAgentSelection) {
  if (selection.kind === "chrome") {
    const zone =
      selection.chrome === "header"
        ? "l’en-tête (nom de la boutique + liens du menu haut)"
        : "le pied de page (liens du menu bas)";
    return `## Sélection
Le commerçant a cliqué sur ${zone}.
- Utilise set_nav location=${selection.chrome} pour les liens. set_name si le nom de boutique change.
- Ne parcours pas toutes les pages. N’appelle pas get_tree sans slug.
- Ne réécris pas le contenu des pages sauf demande explicite.`;
  }

  const label = shopNodeLabel(selection.type);
  return `## Sélection
Le commerçant a cliqué sur « ${label} » (type ${selection.type}, id ${selection.id}) sur la page ${selection.pageTitle} (slug ${selection.pageSlug}).
- Modifie CE nœud en priorité : update_node slug=${selection.pageSlug} id=${selection.id}.
- get_tree uniquement avec slug=${selection.pageSlug}.
- Ne parcours pas les autres pages sauf si le message le demande clairement.`;
}

export function shouldSendChatOnEnter(event: { key: string; shiftKey: boolean; isComposing?: boolean }) {
  return event.key === "Enter" && !event.shiftKey && !event.isComposing;
}
