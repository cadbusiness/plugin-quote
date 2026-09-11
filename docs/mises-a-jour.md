# Mises à jour produit (in-app)

Notes de version destinées aux utilisateurs du dashboard (`/mises-a-jour`), pas un blog marketing.

## Données

| Table | Rôle |
|---|---|
| `product_updates` | Notes globales : `version` (semver `x.y.z`), `title`, `items` (tableau JSON de puces FR), `released_at` optionnel |
| `product_update_reads` | Dernière version vue **par utilisateur** (`last_seen_version`, `seen_at`) |

RLS : lecture des notes pour `authenticated` ; pas d’écriture côté app (service role / SQL). Last-seen : chaque user lit / upsert sa propre ligne.

Le badge « non lu » du menu Support compte les versions **strictement plus récentes** que `last_seen_version`. Ouvrir `/mises-a-jour` enregistre la plus récente.

Tant que la migration n’est pas appliquée, l’app affiche le seed bundlé (`src/lib/updates/seed.ts`, mêmes notes que 1.7 / 1.8 / 1.9 / 1.9.1 / 1.9.2 / 1.9.3 / 1.10.0 / 1.11.0) et mémorise le last-seen dans le cookie `qb-updates-seen`. Dès que les tables existent, elles deviennent la source de vérité.

Migrations : `0024_product_updates.sql` (tables + 1.7 / 1.8), `0025_product_update_1_9_0.sql` (1.9.0), `0026_product_update_1_9_1.sql` (1.9.1), `0027_product_update_1_9_2.sql` (1.9.2), `0028_product_update_1_9_3.sql` (1.9.3), `0029_product_update_1_10_0.sql` (1.10.0), `0030_product_update_1_11_0.sql` (1.11.0).

## Ajouter une version

1. Rédiger un titre court et 2–5 puces **côté utilisateur** (pas de jargon interne).
2. Insérer une ligne (SQL editor, `supabase db query`, ou nouvelle migration) :

```sql
insert into public.product_updates (version, title, items, released_at)
values (
  '1.9.0',
  'Titre court',
  '["Changement visible 1.", "Changement visible 2."]'::jsonb,
  '2026-09-20'
);
```

3. `version` doit être unique et matcher `^[0-9]+\.[0-9]+\.[0-9]+$`.
4. L’UI affiche « Mise à jour 1.9 » (patch `0` omis). Un patch (`1.9.1`) s’affiche en entier.
5. Si vous devez aussi voir la note avant `db push`, ajoutez la même entrée dans `src/lib/updates/seed.ts`.

Pas d’écran d’admin pour rédiger les notes : la table est la source de vérité une fois migrée.
