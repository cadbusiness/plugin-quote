import { parseBlocks, parseBlock } from "@/lib/shops/blocks";
import type { Json } from "@/lib/db/database.types";
import type { ShopBlock, ShopFaqItem, ShopLayout, ShopNode, ShopNodeTypeName } from "@/lib/shops/types";

export const SHOP_NODE_TYPES = [
  "Section",
  "Columns",
  "Heading",
  "Text",
  "Image",
  "Button",
  "Hero",
  "Catalog",
  "Categories",
  "QuoteCta",
  "Faq",
  "Features",
  "Legal",
] as const;

export type ShopNodeType = ShopNodeTypeName;

export type BoxStyleInput = {
  padding?: string;
  margin?: string;
  background?: string;
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: string;
  position?: string;
  top?: string;
  left?: string;
  zIndex?: string;
  borderRadius?: string;
  minHeight?: string;
  width?: string;
  maxWidth?: string;
};

const SLOT_KEYS = ["children", "col1", "col2", "col3", "col4"] as const;

export function isShopNodeType(value: string): value is ShopNodeType {
  return (SHOP_NODE_TYPES as readonly string[]).includes(value);
}

export function newNodeId() {
  return crypto.randomUUID();
}

export function emptyLayout(): ShopLayout {
  return { root: { props: {} }, content: [] };
}

export function boxStyle(input: BoxStyleInput): Record<string, string> {
  const style: Record<string, string> = {};
  const assign = (key: keyof BoxStyleInput, css: string) => {
    const value = input[key]?.trim();
    if (!value) return;
    if (key === "position" && value === "static") return;
    style[css] = value;
  };
  assign("padding", "padding");
  assign("margin", "margin");
  assign("background", "background");
  assign("color", "color");
  assign("fontSize", "fontSize");
  assign("fontWeight", "fontWeight");
  assign("textAlign", "textAlign");
  assign("position", "position");
  assign("top", "top");
  assign("left", "left");
  assign("zIndex", "zIndex");
  assign("borderRadius", "borderRadius");
  assign("minHeight", "minHeight");
  assign("width", "width");
  assign("maxWidth", "maxWidth");
  return style;
}

export function layoutJson(layout: ShopLayout): Json {
  return layout as unknown as Json;
}

function isNode(value: unknown): value is ShopNode {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const raw = value as { type?: unknown; props?: unknown };
  if (!isShopNodeType(String(raw.type ?? ""))) return false;
  if (!raw.props || typeof raw.props !== "object" || Array.isArray(raw.props)) return false;
  return true;
}

function isNodeArray(value: unknown): value is ShopNode[] {
  return Array.isArray(value) && value.every(isNode);
}

export function normalizeNode(value: unknown): ShopNode | null {
  if (!isNode(value)) return null;
  const props: Record<string, unknown> & { id: string } = {
    ...(value.props as Record<string, unknown>),
    id: String(value.props.id || newNodeId()),
  };
  for (const key of Object.keys(props)) {
    if (isNodeArray(props[key])) {
      props[key] = (props[key] as unknown[]).map(normalizeNode).filter((item): item is ShopNode => Boolean(item));
    }
  }
  return { type: value.type, props };
}

function normalizeContent(value: unknown): ShopNode[] {
  if (!Array.isArray(value)) return [];
  return value.map(normalizeNode).filter((item): item is ShopNode => Boolean(item));
}

export function isPuckLayout(value: unknown): boolean {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && "content" in value);
}

export function emptyNode(type: ShopNodeType, extra: Record<string, unknown> = {}): ShopNode {
  const id = String(extra.id ?? newNodeId());
  const base: Record<string, unknown> = { id, padding: "", margin: "", background: "", color: "", position: "static" };
  switch (type) {
    case "Section":
      return { type, props: { ...base, maxWidth: "6xl", minHeight: "", children: [], ...extra, id } };
    case "Columns":
      return {
        type,
        props: { ...base, count: "2", gap: "16px", col1: [], col2: [], col3: [], col4: [], ...extra, id },
      };
    case "Heading":
      return { type, props: { ...base, text: "Titre", level: "h2", ...extra, id } };
    case "Text":
      return { type, props: { ...base, text: "Présentez votre savoir-faire.", ...extra, id } };
    case "Image":
      return { type, props: { ...base, image: "", imageAlt: "", ...extra, id } };
    case "Button":
      return { type, props: { ...base, label: "Demander un devis", href: "/devis", ...extra, id } };
    case "Hero":
      return {
        type,
        props: {
          ...base,
          heading: "Équipez votre projet",
          sub: "Catalogue, catégories et demande de devis — sans paiement en ligne.",
          ctaLabel: "Demander un devis",
          image: "",
          imageAlt: "",
          ...extra,
          id,
        },
      };
    case "Catalog":
      return { type, props: { ...base, heading: "Catalogue", limit: 12, category: "", ...extra, id } };
    case "Categories":
      return { type, props: { ...base, heading: "Rayons", ...extra, id } };
    case "QuoteCta":
      return {
        type,
        props: {
          ...base,
          heading: "Un projet sur mesure ?",
          text: "Décrivez le besoin : nous chiffrons à partir du catalogue.",
          ctaLabel: "Ouvrir le devis",
          ...extra,
          id,
        },
      };
    case "Faq":
      return {
        type,
        props: {
          ...base,
          heading: "Questions fréquentes",
          faq: [
            { q: "Est-ce un achat en ligne ?", a: "Non. Cette boutique prépare un devis. Aucun paiement n’est pris ici." },
            { q: "Puis-je ajouter plusieurs produits ?", a: "Oui. Le funnel devis reprend le catalogue et compile une demande globale." },
          ],
          ...extra,
          id,
        },
      };
    case "Features":
      return {
        type,
        props: {
          ...base,
          heading: "Pourquoi cette vitrine",
          features: [
            { title: "Catalogue réel", text: "Les fiches viennent de votre catalogue QuoteBuilder." },
            { title: "Devis, pas de caisse", text: "Le prospect demande un chiffrage, vous restez maître du prix." },
            { title: "Référencement", text: "Pages indexables, données structurées, mentions légales." },
          ],
          ...extra,
          id,
        },
      };
    case "Legal":
      return { type, props: { ...base, heading: "Mentions légales", text: "", ...extra, id } };
  }
}

export function migrateBlockToNode(block: ShopBlock): ShopNode {
  const id = block.id || newNodeId();
  switch (block.type) {
    case "hero":
      return emptyNode("Hero", {
        id,
        heading: block.heading,
        sub: block.sub,
        ctaLabel: block.ctaLabel,
        image: block.image,
        imageAlt: block.imageAlt,
      });
    case "text":
      return emptyNode("Section", {
        id,
        children: [
          ...(block.heading ? [emptyNode("Heading", { text: block.heading, level: "h2" })] : []),
          emptyNode("Text", { text: block.text || "" }),
        ],
      });
    case "image":
      return emptyNode("Image", { id, image: block.image, imageAlt: block.imageAlt });
    case "categories":
      return emptyNode("Categories", { id, heading: block.heading });
    case "catalog":
      return emptyNode("Catalog", { id, heading: block.heading, limit: block.limit, category: block.category });
    case "quote_cta":
      return emptyNode("QuoteCta", { id, heading: block.heading, text: block.text, ctaLabel: block.ctaLabel });
    case "faq":
      return emptyNode("Faq", { id, heading: block.heading, faq: block.faq ?? [] });
    case "features":
      return emptyNode("Features", { id, heading: block.heading, features: block.features ?? [] });
    case "legal":
      return emptyNode("Legal", { id, heading: block.heading, text: block.text });
  }
}

export function migrateBlocksToLayout(blocks: ShopBlock[]): ShopLayout {
  return { root: { props: {} }, content: blocks.map(migrateBlockToNode) };
}

export function parseLayout(value: unknown): ShopLayout {
  if (isPuckLayout(value)) {
    const raw = value as { root?: unknown; content?: unknown };
    const root = raw.root && typeof raw.root === "object" && !Array.isArray(raw.root) ? (raw.root as { props?: unknown }) : {};
    const props = root.props && typeof root.props === "object" && !Array.isArray(root.props) ? (root.props as Record<string, unknown>) : {};
    return { root: { props }, content: normalizeContent(raw.content) };
  }
  return migrateBlocksToLayout(parseBlocks(value));
}

export function childSlots(node: ShopNode): { key: string; nodes: ShopNode[] }[] {
  const slots: { key: string; nodes: ShopNode[] }[] = [];
  for (const key of Object.keys(node.props)) {
    const value = node.props[key];
    if (isNodeArray(value)) slots.push({ key, nodes: value });
  }
  return slots;
}

export function defaultSlot(type: string) {
  if (type === "Columns") return "col1";
  return "children";
}

export function canHaveChildren(type: string) {
  return type === "Section" || type === "Columns";
}

type NodeLocation = {
  node: ShopNode;
  parentId: string | null;
  slot: string;
  index: number;
  siblings: ShopNode[];
};

function walkFind(nodes: ShopNode[], parentId: string | null, slot: string, id: string): NodeLocation | null {
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index]!;
    if (node.props.id === id) return { node, parentId, slot, index, siblings: nodes };
    for (const child of childSlots(node)) {
      const found = walkFind(child.nodes, node.props.id, child.key, id);
      if (found) return found;
    }
  }
  return null;
}

export function findNode(layout: ShopLayout, id: string): NodeLocation | null {
  return walkFind(layout.content, null, "content", id);
}

function cloneNode(node: ShopNode): ShopNode {
  const props: Record<string, unknown> & { id: string } = { ...node.props, id: node.props.id };
  for (const slot of childSlots(node)) {
    props[slot.key] = slot.nodes.map(cloneNode);
  }
  return { type: node.type, props };
}

function cloneLayout(layout: ShopLayout): ShopLayout {
  return { root: { props: { ...layout.root.props } }, content: layout.content.map(cloneNode) };
}

function slotOf(node: ShopNode, slot: string): ShopNode[] {
  const value = node.props[slot];
  return isNodeArray(value) ? value : [];
}

function setSlot(node: ShopNode, slot: string, nodes: ShopNode[]) {
  node.props[slot] = nodes;
}

function removeAt(layout: ShopLayout, loc: NodeLocation) {
  if (loc.parentId == null) {
    layout.content = layout.content.filter((_, index) => index !== loc.index);
    return;
  }
  const parent = findNode(layout, loc.parentId);
  if (!parent) return;
  setSlot(parent.node, loc.slot, slotOf(parent.node, loc.slot).filter((_, index) => index !== loc.index));
}

function insertAt(layout: ShopLayout, parentId: string | null, slot: string, index: number, node: ShopNode) {
  if (parentId == null) {
    const next = [...layout.content];
    next.splice(Math.max(0, Math.min(index, next.length)), 0, node);
    layout.content = next;
    return true;
  }
  const parent = findNode(layout, parentId);
  if (!parent) return false;
  if (!canHaveChildren(parent.node.type)) return false;
  const key = slot && slot !== "content" ? slot : defaultSlot(parent.node.type);
  if (parent.node.type === "Section" && key !== "children") return false;
  if (parent.node.type === "Columns" && !key.startsWith("col")) return false;
  const current = [...slotOf(parent.node, key)];
  current.splice(Math.max(0, Math.min(index, current.length)), 0, node);
  setSlot(parent.node, key, current);
  return true;
}

export function insertNode(
  layout: ShopLayout,
  input: {
    type: string;
    parentId?: string;
    slot?: string;
    index?: number;
    afterId?: string;
    props?: Record<string, unknown>;
  },
): { ok: true; layout: ShopLayout; id: string } | { ok: false; error: string } {
  if (!isShopNodeType(input.type)) return { ok: false, error: `Type inconnu: ${input.type}` };
  const next = cloneLayout(layout);
  const node = emptyNode(input.type, input.props ?? {});
  let parentId = input.parentId?.trim() ? input.parentId.trim() : null;
  let slot = input.slot?.trim() || "";
  let index = typeof input.index === "number" ? input.index : -1;

  if (input.afterId) {
    const after = findNode(next, input.afterId);
    if (!after) return { ok: false, error: `Nœud ${input.afterId} introuvable` };
    parentId = after.parentId;
    slot = after.slot === "content" ? "content" : after.slot;
    index = after.index + 1;
  }

  if (parentId && parentId !== "root") {
    const parent = findNode(next, parentId);
    if (!parent) return { ok: false, error: `Parent ${parentId} introuvable` };
    if (!canHaveChildren(parent.node.type)) {
      return { ok: false, error: "Ce nœud n’accepte pas d’enfants. Utilisez une Section ou des Colonnes." };
    }
    if (!slot || slot === "content") slot = defaultSlot(parent.node.type);
    if (index < 0) index = slotOf(parent.node, slot).length;
    if (!insertAt(next, parentId, slot, index, node)) return { ok: false, error: "Impossible d’insérer dans ce parent" };
  } else {
    if (index < 0) index = next.content.length;
    insertAt(next, null, "content", index, node);
  }
  return { ok: true, layout: next, id: node.props.id };
}

export function updateNode(
  layout: ShopLayout,
  id: string,
  patch: Record<string, unknown>,
): { ok: true; layout: ShopLayout } | { ok: false; error: string } {
  const next = cloneLayout(layout);
  const loc = findNode(next, id);
  if (!loc) return { ok: false, error: `Nœud ${id} introuvable` };
  for (const [key, value] of Object.entries(patch)) {
    if (key === "id" || key === "type") continue;
    if (value === undefined) continue;
    loc.node.props[key] = value;
  }
  return { ok: true, layout: next };
}

export function deleteNode(
  layout: ShopLayout,
  id: string,
): { ok: true; layout: ShopLayout } | { ok: false; error: string } {
  const next = cloneLayout(layout);
  const loc = findNode(next, id);
  if (!loc) return { ok: false, error: `Nœud ${id} introuvable` };
  removeAt(next, loc);
  return { ok: true, layout: next };
}

export function moveNode(
  layout: ShopLayout,
  input: { id: string; parentId?: string; slot?: string; index?: number },
): { ok: true; layout: ShopLayout } | { ok: false; error: string } {
  const next = cloneLayout(layout);
  const loc = findNode(next, input.id);
  if (!loc) return { ok: false, error: `Nœud ${input.id} introuvable` };
  const moved = cloneNode(loc.node);
  removeAt(next, loc);
  const parentId = input.parentId?.trim() && input.parentId !== "root" ? input.parentId.trim() : null;
  const slot = input.slot?.trim() || (parentId ? defaultSlot(findNode(next, parentId)?.node.type ?? "Section") : "content");
  const index = typeof input.index === "number" ? input.index : 0;
  if (!insertAt(next, parentId, slot, index, moved)) {
    return { ok: false, error: "Impossible de déplacer vers ce parent" };
  }
  return { ok: true, layout: next };
}

export function replaceLegalText(layout: ShopLayout, heading: string, text: string): ShopLayout {
  const next = cloneLayout(layout);
  const legal = next.content.find((node) => node.type === "Legal");
  if (legal) {
    legal.props.heading = heading;
    legal.props.text = text;
    return next;
  }
  next.content.push(emptyNode("Legal", { heading, text }));
  return next;
}

export function collectFaq(layout: ShopLayout): ShopFaqItem[] {
  const items: ShopFaqItem[] = [];
  function visit(nodes: ShopNode[]) {
    for (const node of nodes) {
      if (node.type === "Faq" && Array.isArray(node.props.faq)) {
        for (const row of node.props.faq) {
          if (!row || typeof row !== "object") continue;
          const q = String((row as { q?: unknown }).q ?? "");
          const a = String((row as { a?: unknown }).a ?? "");
          if (q || a) items.push({ q, a });
        }
      }
      for (const slot of childSlots(node)) visit(slot.nodes);
    }
  }
  visit(layout.content);
  return items;
}

export function summarizeLayout(layout: ShopLayout): string {
  const parts: string[] = [];
  function visit(nodes: ShopNode[], depth: number) {
    for (const node of nodes) {
      const label = String(node.props.heading || node.props.text || node.props.label || node.type);
      parts.push(`${"  ".repeat(depth)}${node.type}:${node.props.id.slice(0, 8)} « ${String(label).slice(0, 48)} »`);
      for (const slot of childSlots(node)) visit(slot.nodes, depth + 1);
    }
  }
  visit(layout.content, 0);
  return parts.join("\n") || "(vide)";
}

export function parseLegacyBlock(value: unknown) {
  return parseBlock(value);
}

export function layoutHasContent(layout: ShopLayout) {
  return layout.content.length > 0;
}
