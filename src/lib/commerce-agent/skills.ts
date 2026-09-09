/**
 * High-frequency skills stay in the system prompt (Anthropic commerce pattern).
 * Long-tail skills can later load on demand; for B2B devis these cover most turns.
 */
export const QUOTE_AGENT_SKILLS = {
  searchDiscovery: `## Skill · search-discovery
- Toujours search_catalog ou match_configurations avant de citer un produit, un SKU ou un prix.
- Les prix viennent uniquement des fourchettes catalogue (priceMin/priceMax). Jamais inventés.
- Si aucun résultat : élargis la requête ou pose UNE question de clarification.`,

  quotePlanning: `## Skill · quote-planning
- Objectif : brief devis B2B structuré (surface, charge, hauteur, contraintes, budget, délai).
- Extrais tout ce qui est dit en une phrase via update_brief — ne rejoue pas un formulaire champ par champ.
- Pose au plus UNE clarification à la fois.
- Dès que type + dimensionnement + contrainte clé sont là : match_configurations puis présente.`,

  identityCollection: `## Skill · identity-collection
- Collecte prénom + email naturellement après une config crédible (« Pour vous envoyer cette configuration… »).
- collect_contact puis handoff_quote. Pas de carte bancaire, pas de paiement.
- Claude est la couche d'intelligence ; le checkout devis reste chez le commerçant (QuoteBuilder / Supabase).`,
} as const;

export function skillsBlock(): string {
  return [
    QUOTE_AGENT_SKILLS.searchDiscovery,
    QUOTE_AGENT_SKILLS.quotePlanning,
    QUOTE_AGENT_SKILLS.identityCollection,
  ].join("\n\n");
}
