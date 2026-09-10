import type Anthropic from "@anthropic-ai/sdk";

export const SHOP_AGENT_TOOLS: Anthropic.Tool[] = [
  {
    name: "get_tree",
    description:
      "Lit l’arbre visuel d’une page (ids, types, slots). slug = accueil, catalogue, mentions-legales… Sans slug : aperçu de toutes les pages.",
    input_schema: {
      type: "object",
      properties: { slug: { type: "string" } },
    },
  },
  {
    name: "insert_node",
    description:
      "Ajoute un nœud. Types : Section, Columns, Heading, Text, Image, Button, Hero, Catalog, Categories, QuoteCta, Faq, Features, Legal. parentId vide = racine. Pour une Section, slot=children. Pour Columns, slot=col1|col2|col3|col4. afterId place le nœud juste après un autre.",
    input_schema: {
      type: "object",
      properties: {
        slug: { type: "string" },
        type: { type: "string" },
        parentId: { type: "string" },
        slot: { type: "string" },
        index: { type: "number" },
        afterId: { type: "string" },
        heading: { type: "string" },
        sub: { type: "string" },
        text: { type: "string" },
        label: { type: "string" },
        href: { type: "string" },
        image: { type: "string" },
        imageAlt: { type: "string" },
        ctaLabel: { type: "string" },
        category: { type: "string" },
        limit: { type: "number" },
        level: { type: "string" },
        count: { type: "string" },
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
      required: ["slug", "type"],
    },
  },
  {
    name: "update_node",
    description: "Modifie les props d’un nœud existant (titre, texte, image, styles, FAQ…).",
    input_schema: {
      type: "object",
      properties: {
        slug: { type: "string" },
        id: { type: "string" },
        heading: { type: "string" },
        sub: { type: "string" },
        text: { type: "string" },
        label: { type: "string" },
        href: { type: "string" },
        image: { type: "string" },
        imageAlt: { type: "string" },
        ctaLabel: { type: "string" },
        category: { type: "string" },
        limit: { type: "number" },
        level: { type: "string" },
        count: { type: "string" },
        padding: { type: "string" },
        background: { type: "string" },
        color: { type: "string" },
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
    name: "delete_node",
    description: "Supprime un nœud (et ses enfants).",
    input_schema: {
      type: "object",
      properties: { slug: { type: "string" }, id: { type: "string" } },
      required: ["slug", "id"],
    },
  },
  {
    name: "move_node",
    description: "Déplace un nœud. parentId vide = racine. slot = children | col1 | col2 | col3 | col4.",
    input_schema: {
      type: "object",
      properties: {
        slug: { type: "string" },
        id: { type: "string" },
        parentId: { type: "string" },
        slot: { type: "string" },
        index: { type: "number" },
      },
      required: ["slug", "id"],
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
