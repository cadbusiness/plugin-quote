/** Catégories trop génériques : on prend la feuille métier s'il y en a une autre. */
const GENERIC_CATEGORY = /^(divers|non class[ée]e?|uncategorized|non classe)$/i;

export type WooTermRef = { id?: number; name?: string | null };
export type WooCategoryNode = { id: number; name: string; parent: number };

function ancestors(id: number, byId: Map<number, WooCategoryNode>) {
  const out: number[] = [];
  let current = byId.get(id);
  let guard = 0;
  while (current?.parent && guard < 12) {
    out.push(current.parent);
    current = byId.get(current.parent);
    guard += 1;
  }
  return out;
}

/** Catégorie la plus précise assignée au produit (feuille), pas le parent Woo. */
export function pickLeafCategory(assigned: WooTermRef[], taxonomy: WooCategoryNode[]): string | null {
  const names = assigned.map((term) => term.name?.trim()).filter((name): name is string => Boolean(name));
  if (!names.length) return null;

  const byId = new Map(taxonomy.map((node) => [node.id, node]));
  const assignedIds = assigned
    .map((term) => term.id)
    .filter((id): id is number => typeof id === "number" && byId.has(id));

  if (!assignedIds.length) {
    const usable = names.filter((name) => !GENERIC_CATEGORY.test(name));
    return (usable.at(-1) ?? names.at(-1)) ?? null;
  }

  const ancestorIds = new Set<number>();
  for (const id of assignedIds) {
    for (const parent of ancestors(id, byId)) {
      if (assignedIds.includes(parent)) ancestorIds.add(parent);
    }
  }
  const leaves = assignedIds.filter((id) => !ancestorIds.has(id));
  const pool = leaves.length ? leaves : assignedIds;
  const maxDepth = Math.max(...pool.map((id) => ancestors(id, byId).length));
  const deepest = pool.filter((id) => ancestors(id, byId).length === maxDepth);
  const nodes = deepest.map((id) => byId.get(id)).filter((node): node is WooCategoryNode => Boolean(node));
  const specific = nodes.filter((node) => !GENERIC_CATEGORY.test(node.name));
  const pickFrom = specific.length ? specific : nodes;
  const order = new Map(assignedIds.map((id, index) => [id, index]));
  pickFrom.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  return pickFrom[0]?.name ?? names[0] ?? null;
}
