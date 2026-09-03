# QuoteBuilder — carte produit

Funnel de devis B2B. Vinci Liberta LTD (Dublin).  
Inventaire officiel croisé avec le code, 3 septembre 2026 — pas la liste marketing.

**Cœur** = on le livre et on le soigne maintenant.  
**Phase 2** = après le cœur. Hors menu tant que funnel et catalogue ne sont pas au niveau.  
**Phase 3** = marketplace + CRM tiers. On ne la code pas avant d’avoir des templates sectoriels excellents.

Statuts : **Livré** · **Partiel** · **Ensuite** · **Vision**

---

## Cœur — maintenant

### Funnel
- **Création guidée (secteur, modes, écrans, catalogue, nom)** — Livré. Dialog multi-étapes, plus un champ nom + bouton.
- **Éditeur de steps (réordonner en drag-and-drop)** — Livré. Réordonner les écrans, pas un builder visuel type Typeform.
- **Steps : choix multiple, texte, fichier, produits, identité, chat IA, soumission** — Partiel. Slider dédié et écran récap explicite absents ; le nombre couvre le dimensionnement.
- **3 modes : wizard guidé / chat IA / les deux** — Livré.
- **Collecte progressive d’identité (prénom, email, téléphone intercalés)** — Partiel. Capture anticipée prénom + email, puis écran contact (téléphone / société).
- **Sauvegarde de session dès l’email saisi** — Partiel. Sauvegarde au moment où l’email est soumis dans le bloc de capture, pas à la frappe. Reprise `/reprendre`.
- **URL publique standalone** — Livré. `/c/[org]/[slug]`.
- **Embed widget JS + plugin WordPress + bloc Gutenberg** — Livré.

### Catalogue
- **Saisie manuelle (nom, SKU, description, prix min/max, tags, catégorie)** — Partiel. Image non exposée dans l’UI.
- **Import CSV** — Livré.
- **Gestion des catégories** — Partiel. Champ sur le produit, pas de module dédié.
- **Activation / désactivation produits** — Partiel. `is_active` en base, pas de toggle catalogue.
- **Si/Alors réponses → suggestions produits** — Livré.
- **Page suggestions visuelles côté prospect** — Livré.
- **Sync WooCommerce (import + sync)** — Partiel. Connexion enregistrée, sync à fiabiliser.

### Demandes
- **Vue liste tableau** — Livré. `/devis`, ligne entière cliquable.
- **Statuts (Nouveau / Contacté / En cours / Gagné / Perdu / En attente)** — Partiel. Seedés et sélectionnables, pas d’éditeur CRUD.
- **Fiche prospect (réponses, produits, score, historique)** — Livré.
- **Score automatique hot / warm / cold** — Livré.
- **Assignation à un membre d’équipe** — Livré.
- **Notes internes** — Livré.
- **Timeline d’activité** — Partiel. Présente, encore mince.
- **Sessions abandonnées** — Livré. `/sessions`.
- **Export CSV** — Livré.

### Espace prospect
- **Lien magique post-soumission** — Livré. `/suivi/[token]`.
- **Code PIN 6 chiffres** — Livré.
- **Barre de statut** — Partiel. Barre oui, pas de push temps réel.
- **Récap configuration + PDF téléchargeable** — Partiel. Récap oui ; PDF envoyé par email, pas encore téléchargé depuis l’espace.
- **Zone de complétion (photos, mesures, notes)** — Partiel. Upload + notes ; pas de mesures structurées.
- **Messagerie légère prospect ↔ commercial** — Partiel. Prospect → équipe oui ; réponse commercial → prospect à durcir.
- **Historique des échanges** — Livré.

### Automatisations
- **Confirmation prospect T+0 + PDF** — Livré.
- **Notification commercial à la soumission** — Livré.
- **Relance abandon** — Partiel. Seed 1 h + 24 h (pas 30 min).
- **Rappel interne si non traité sous 4 h** — Livré.
- **Email rassurant prospect T+24 h** — Livré.
- **Relance douce T+3 j avec lien de reprise** — Partiel. Flux 72 h présent ; lien de reprise surtout sur les abandons.
- **Délais et contenus configurables** — Livré. `/automations`, `/templates`.
- **Chaque flux activable / désactivable** — Livré.

### Statistiques
- **KPI + tunnel visiteurs → gagné** — Livré. `/stats`, événements `analytics_events`.
- **Sources UTM (Google Ads, organique, etc.)** — Livré. Capture sur session + widget.
- **Pipeline financier et CA potentiel** — Livré.
- **Abandons relançables depuis les stats** — Livré. CTA vers `/sessions`.
- **Courbe 6 mois + export PDF agence** — Livré.
- **Connexion GA4** — Partiel. Champ org encore dans la toolbar.

### Équipe
- **Invitation par email** — Livré.
- **Rôles Admin / Commercial** — Livré. Owner en plus.
- **Assignation des demandes** — Livré.
- **Notifications d’assignation** — Livré.

### Intégrations cœur
- **Widget JS universel** — Livré.
- **Plugin WordPress + bloc Gutenberg** — Livré.
- **Webhook sortant / export JSON** — Livré.
- **WooCommerce (catalogue + commandes + statuts)** — Partiel. Settings only.

### Paramètres cœur
- **Templates email personnalisables** — Livré.
- **Templates PDF personnalisables** — Livré.

---

## Phase 2 — ensuite

Hors menu tant que le funnel et le catalogue ne sont pas au niveau.

### Funnel
- **Logique conditionnelle Si/Alors entre les steps** — Ensuite. Le Si/Alors actuel mappe vers des produits, pas vers des branches.
- **Prévisualisation mobile / desktop en temps réel** — Ensuite. Aujourd’hui : lien public dans un nouvel onglet.
- **Duplication de funnels** — Ensuite.
- **Domaine custom / white-label** — Ensuite.

### Catalogue & CRM
- **Sync Shopify** — Ensuite.
- **Vue pipeline Kanban** — Ensuite.
- **Newsletter segmentée par données de configuration** — Ensuite.

### Automatisations longues
- **Nurturing T+7 j (contenu sectoriel)** — Ensuite.
- **Réactivation T+30 j** — Ensuite.

### Pilotage
- **Taux de complétion par étape du funnel** — Livré (tunnel `/stats`).
- **Performance par membre d’équipe** — Ensuite.
- **Historique des actions par membre (vue dédiée)** — Ensuite. Données partielles aujourd’hui, pas d’écran.
- **GTM** — Ensuite.

### Intégrations & réglages
- **Zapier** — Ensuite.
- **Gestion organisation (logo, couleurs)** — Ensuite. `branding` jsonb existe, pas d’écran.
- **Abonnement Stripe** — Ensuite.
- **API keys** — Ensuite.

---

## Phase 3 — marketplace

Les clients et agences publient des funnels configurés. D’autres les installent en un clic. Ce n’est pas un store de thèmes : ce sont des parcours d’achat complets.

**Effet** : plus de secteurs couverts → plus de nouveaux clients. Le contenu devient une barrière. Les agences ont un revenu passif. QuoteBuilder prend 30 % sur le payant.

### Offre
- **Templates de funnels sectoriels** — Vision. Ex. cuisiniste haut de gamme, location matériel BTP.
- **Templates avec catalogue pré-configuré** — Vision.
- **Packs complets : funnel + mapping produits + séquences email** — Vision.

### Distribution
- **Gratuit — communauté** — Vision.
- **Payant 5–50 €, commission QuoteBuilder 30 %** — Vision.
- **Premium officiel QuoteBuilder par secteur** — Vision.

### Mécaniques
- **Notation et avis** — Vision.
- **Nombre d’installations** — Vision.
- **Preview du funnel avant achat** — Vision.
- **Filtres secteur / langue / nombre d’étapes / prix** — Vision.
- **Profil créateur avec portfolio** — Vision.
- **Programme Certified Partner** — Vision.

### CRM tiers
- **HubSpot / Pipedrive** — Vision.

---

## Ce qu’on ne fait pas

QuoteBuilder n’est pas un formulaire de contact, ni un thème de site.  
On ne met pas Quickly en avant sur la landing.  
On ne pose pas Kanban, newsletter ou marketplace dans le menu ou le schéma tant que le funnel et le catalogue ne sont pas au niveau.
