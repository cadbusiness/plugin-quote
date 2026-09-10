import type Anthropic from "@anthropic-ai/sdk";

export const SHOP_AGENT_TOOLS: Anthropic.Tool[] = [
  {
    name: "get_shop",
    description: "Lit l’état de la boutique : pages, blocs, menus, SEO, thème, mentions légales.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "update_block",
    description: "Modifie un bloc existant (titre, texte, image, FAQ, CTA…). slug = page (accueil, catalogue, mentions-legales…).",
    input_schema: {
      type: "object",
      properties: {
        slug: { type: "string" },
        id: { type: "string" },
        heading: { type: "string" },
        sub: { type: "string" },
        text: { type: "string" },
        image: { type: "string" },
        imageAlt: { type: "string" },
        ctaLabel: { type: "string" },
        category: { type: "string" },
        limit: { type: "number" },
        faq: {
          type: "array",
          items: {
            type: "object",
            properties: { q: { type: "string" }, a: { type: "string" } },
            required: ["q", "a"],
          },
        },
        features: {
          type: "array",
          items: {
            type: "object",
            properties: { title: { type: "string" }, text: { type: "string" } },
            required: ["title", "text"],
          },
        },
      },
      required: ["slug", "id"],
    },
  },
  {
    name: "add_block",
    description:
      "Ajoute un bloc à une page. Types : hero, text, image, categories, catalog, quote_cta, faq, features, legal.",
    input_schema: {
      type: "object",
      properties: {
        slug: { type: "string" },
        type: { type: "string" },
        afterId: { type: "string" },
        heading: { type: "string" },
        sub: { type: "string" },
        text: { type: "string" },
        image: { type: "string" },
        imageAlt: { type: "string" },
        ctaLabel: { type: "string" },
      },
      required: ["slug", "type"],
    },
  },
  {
    name: "remove_block",
    description: "Retire un bloc d’une page.",
    input_schema: {
      type: "object",
      properties: { slug: { type: "string" }, id: { type: "string" } },
      required: ["slug", "id"],
    },
  },
  {
    name: "reorder_blocks",
    description: "Réordonne les blocs d’une page. ids = ordre complet des identifiants.",
    input_schema: {
      type: "object",
      properties: {
        slug: { type: "string" },
        ids: { type: "array", items: { type: "string" } },
      },
      required: ["slug", "ids"],
    },
  },
  {
    name: "set_page_seo",
    description: "Met à jour title / meta description d’une page (référencement).",
    input_schema: {
      type: "object",
      properties: {
        slug: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
      },
      required: ["slug"],
    },
  },
  {
    name: "set_theme",
    description: "Couleur d’accent, fond, texte.",
    input_schema: {
      type: "object",
      properties: {
        accent: { type: "string" },
        background: { type: "string" },
        text: { type: "string" },
      },
    },
  },
  {
    name: "set_seo",
    description: "SEO global : titre, description, ville / région (GEO).",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        locality: { type: "string" },
        region: { type: "string" },
      },
    },
  },
  {
    name: "set_legal",
    description: "Identité éditeur (SIRET, adresse, email) puis régénère les pages légales si demandé.",
    input_schema: {
      type: "object",
      properties: {
        company: { type: "string" },
        siret: { type: "string" },
        address: { type: "string" },
        city: { type: "string" },
        postalCode: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        director: { type: "string" },
        refreshPages: { type: "boolean" },
      },
    },
  },
  {
    name: "add_page",
    description: "Ajoute une page (custom ou legal) avec slug et titre.",
    input_schema: {
      type: "object",
      properties: {
        slug: { type: "string" },
        title: { type: "string" },
        kind: { type: "string" },
        text: { type: "string" },
      },
      required: ["slug", "title"],
    },
  },
  {
    name: "set_nav",
    description: "Remplace le menu header ou footer.",
    input_schema: {
      type: "object",
      properties: {
        location: { type: "string", enum: ["header", "footer"] },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: { label: { type: "string" }, href: { type: "string" } },
            required: ["label", "href"],
          },
        },
      },
      required: ["location", "items"],
    },
  },
  {
    name: "set_status",
    description: "Passe la boutique en draft ou published.",
    input_schema: {
      type: "object",
      properties: { status: { type: "string", enum: ["draft", "published"] } },
      required: ["status"],
    },
  },
];
