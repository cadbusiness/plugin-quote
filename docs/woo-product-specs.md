# Contrat attributs Woo → `products.specs`

QuoteBuilder stocke la fiche technique dans `public.products.specs` (jsonb), distincte des options / déclinaisons (`products.options`).

Forme :

```json
{
  "charge": { "label": "Charge", "value": "1000", "unit": "kg/niveau" },
  "hauteur": { "label": "Hauteur", "value": "250", "unit": "cm" },
  "profondeur": { "label": "Profondeur", "value": "60", "unit": "cm" },
  "materiau": { "label": "Matériau", "value": "Acier galvanisé", "unit": "" },
  "delai": { "label": "Délai", "value": "5", "unit": "jours" }
}
```

Clés canoniques, dans cet ordre : `charge`, `hauteur`, `profondeur`, `materiau`, `delai`.

## Hostinger / WooCommerce

Créer des **attributs globaux** (Produits → Attributs). Le slug WordPress est préfixé `pa_`. Une seule valeur par attribut (pas une déclinaison).

| Clé QB | Slug attribut | Nom affiché | Exemple de valeur | Unités reconnues |
|---|---|---|---|---|
| `charge` | `pa_charge` | Charge | `1000 kg/niveau` | `kg`, `kg/niveau`, `kg/m2`, `t` |
| `hauteur` | `pa_hauteur` | Hauteur | `250 cm` | `mm`, `cm`, `m` |
| `profondeur` | `pa_profondeur` | Profondeur | `60 cm` | `mm`, `cm`, `m` |
| `materiau` | `pa_materiau` | Matériau | `Acier galvanisé` | aucune (valeur entière) |
| `delai` | `pa_delai` | Délai | `5 jours` | `jour(s)`, `semaine(s)`, `mois` |

La valeur Woo reste du texte. À l’import, QuoteBuilder sépare le nombre et l’unité (`1000` + `kg/niveau`). `1000kg/niveau` (collé) est accepté. Le matériau n’est pas découpé.

## Priorité à la lecture

1. **Attribut** dont le slug ou le nom correspond à la clé (`pa_charge`, `charge`, `Charge`, `attribute_pa_charge`).
2. Meta produit **`_qb_specs`** : l’objet JSON ci-dessus (objet ou chaîne JSON).
3. Meta unitaire : `charge`, `pa_charge`, `hauteur`, `pa_hauteur`, etc.

Alias acceptés en plus des slugs : `capacite` / `load` → charge, `height` → hauteur, `depth` → profondeur, `material` / `matiere` → materiau, `delay` / `lead_time` → delai.

Un attribut de **variation** avec plusieurs options (couleur, taille) n’est pas une spec. La **description** et la description courte ne sont jamais lues comme source.

Si Woo n’envoie aucune de ces clés, la sync **ne vide pas** `products.specs`. Si le texte affiché est le même (`1000 kg/niveau`), l’entrée déjà stockée reste (label, valeur et unité intacts) — un attribut libre ne dégrade pas la fiche Quickly. Si le texte change, cette clé est remplacée ; les autres restent.

Enregistrer la fiche produit renvoie le JSON `specs` tel qu’il a été lu. Un corps illisible ne touche pas la colonne. `parse` → JSON → `parse` est identique pour la forme ci-dessus, y compris après un aller-retour Woo (`_qb_specs` + attributs).

## Écriture vers Woo

Quand l’export boutique est actif, QuoteBuilder renvoie :

- meta `_qb_specs` (objet structuré) et meta `charge`, `hauteur`, `profondeur`, `materiau`, `delai` (texte affiché) ;
- les attributs existants mis à jour (`options` = `valeur unité`) sans retirer les autres attributs (couleur, etc.).

Les attributs ne sont renvoyés que si le produit Woo a été relu avant le PUT, pour ne pas remplacer la liste entière par un envoi incomplet.

## Hors de ce contrat

Les pastilles / `SpecTable` du parcours devis lisent ce jsonb. Elles ne parsent pas le HTML produit.

Les photos, plans et vues d’usage sont un autre contrat : `docs/product-media.md` (`products.images[].role`).
