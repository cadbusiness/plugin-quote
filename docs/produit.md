# QuoteBuilder — carte produit

Funnel de devis B2B. Vinci Liberta LTD (Dublin).  
Inventaire croisé avec le code, 3 septembre 2026 — pas la liste marketing.

**Cœur** = on le livre et on le soigne maintenant.  
**Phase 2** = après le cœur (Kanban, newsletter, Shopify, Zapier, preview, billing).  
**Phase 3** = marketplace + CRM tiers. On ne la code pas avant d’avoir des templates sectoriels excellents.

---

## Cœur — déjà là ou à finir

### Funnel
- Éditeur de steps (réordonner en drag-and-drop)
- Questions : choix visuel, nombre, select, multi-select, texte, fichier
- Écrans : cadrage, suggestions catalogue, personnalisation, contact
- 3 modes : funnel guidé / chat IA / les deux
- URL publique `/c/[org]/[slug]`
- Embed : widget JS, `/embed`, plugin WordPress + bloc Gutenberg
- Session sauvegardée dès qu’un email est dans le brouillon ; reprise `/reprendre`

À finir dans le cœur : dialog de création (secteur, modes, écrans, catalogue) — plus jamais un champ nom + bouton. Collecte d’identité encore trop tardive (un seul écran contact).

### Catalogue
- Produits manuels (nom, SKU, description, prix min/max, tags, catégorie)
- Import CSV
- Règles Si/Alors → suggestions
- Écran suggestions côté prospect

Partiel : sync WooCommerce (connexion enregistrée, sync à fiabiliser), images / activation dans l’UI.

### Demandes
- Liste tableau, filtres, ligne cliquable
- Fiche prospect (réponses, produits, score)
- Score hot / warm / cold
- Assignation, notes, export CSV
- Abandons `/sessions`

Partiel : statuts seedés mais pas éditables ; timeline d’activité encore mince.  
Kanban = phase 2, hors menu.

### Espace prospect
- Lien magique `/suivi/[token]`
- PIN 6 chiffres
- Barre de statut, récap, upload, notes
- Messagerie légère prospect ↔ commercial

### Automatisations
Actives, délais et on/off dans `/automations` :
- Confirm prospect + brief commercial (T+0)
- Rappel interne si non traité (4 h)
- Reprise abandon (~1 h et 24 h)
- Rassurant T+24 h, relance T+72 h
- Templates email et PDF éditables

Pas encore : nurturing T+7 j, réactivation T+30 j, newsletter.

### Pilotage & équipe
- Stats volume / conversion / délai / mix score
- Invitation email, rôles Admin / Commercial / Owner
- Assignation + mail

Partiel : champ GA4, pas de drop-off par étape ni perf par commercial.

### Intégrations cœur
- Widget JS, WordPress, webhook sortant
- WooCommerce : settings only

---

## Phase 2 — ensuite

- Logique conditionnelle **entre steps** (pas seulement vers les produits)
- Preview mobile / desktop dans l’éditeur
- Duplication de funnel
- Domaine custom / white-label
- Pipeline Kanban
- Newsletter segmentée
- Nurturing T+7 j / réactivation T+30 j
- Shopify, Zapier
- Stripe (abonnement)
- Complétion par étape, perf équipe
- Écran branding (logo, couleurs)

---

## Phase 3 — marketplace

Les clients et agences publient des funnels configurés. D’autres les installent en un clic.

**Offre**
- Templates sectoriels (ex. cuisiniste haut de gamme, location BTP)
- Packs : funnel + catalogue + mapping + emails

**Distribution**
- Gratuit (communauté)
- Payant 5–50 €, QuoteBuilder prend 30 %
- Premium officiel QuoteBuilder

**Mécaniques**
- Preview avant achat
- Filtres secteur / langue / étapes / prix
- Avis, nombre d’installs, profil créateur
- Certified Partner pour les agences

**Effet** : plus de secteurs couverts → plus de nouveaux clients. Le contenu devient une barrière. Les agences ont un revenu passif.

Aussi en phase 3 : HubSpot / Pipedrive.

---

## Ce qu’on ne fait pas

QuoteBuilder n’est pas un formulaire de contact, ni un thème de site.  
On ne met pas Quickly en avant sur la landing.  
On ne code pas la marketplace, le Kanban ni la newsletter tant que le funnel et le catalogue ne sont pas au niveau.
