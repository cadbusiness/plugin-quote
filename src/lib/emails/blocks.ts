import type { Json } from "@/lib/db/database.types";

export type EmailBlockType =
  | "heading"
  | "text"
  | "button"
  | "image"
  | "spacer"
  | "divider"
  | "recap"
  | "footer";

export type EmailBlock = {
  id: string;
  type: EmailBlockType;
  heading?: string;
  sub?: string;
  text?: string;
  label?: string;
  href?: string;
  src?: string;
  alt?: string;
  height?: number;
};

export type EmailDesign = {
  blocks: EmailBlock[];
  accent?: string;
};

export const BLOCK_LABELS: Record<EmailBlockType, string> = {
  heading: "Titre",
  text: "Texte",
  button: "Bouton",
  image: "Image",
  spacer: "Espace",
  divider: "Séparateur",
  recap: "Récap devis",
  footer: "Pied de page",
};

export function newBlockId() {
  return crypto.randomUUID();
}

export function emptyBlock(type: EmailBlockType): EmailBlock {
  switch (type) {
    case "heading":
      return { id: newBlockId(), type, heading: "Bonjour {{contact_name}}", sub: "Votre projet avance." };
    case "text":
      return {
        id: newBlockId(),
        type,
        text: "Nous avons bien étudié votre configuration. Voici une proposition adaptée à vos réponses.",
      };
    case "button":
      return { id: newBlockId(), type, label: "Voir ma demande", href: "{{suivi_url}}" };
    case "image":
      return { id: newBlockId(), type, src: "", alt: "" };
    case "spacer":
      return { id: newBlockId(), type, height: 24 };
    case "divider":
      return { id: newBlockId(), type };
    case "recap":
      return { id: newBlockId(), type };
    case "footer":
      return { id: newBlockId(), type, text: "Vous recevez cet email car vous avez demandé un devis." };
  }
}

export type CampaignKind = "relance" | "offre" | "nurturing" | "perso";

export function starterDesign(kind: CampaignKind, orgName: string): EmailDesign {
  const accent = "#E85D04";
  if (kind === "offre") {
    return {
      accent,
      blocks: [
        { id: newBlockId(), type: "heading", heading: "{{contact_name}}, une offre pour votre projet", sub: orgName },
        {
          id: newBlockId(),
          type: "text",
          text: "Nous avons préparé une proposition qui reprend vos choix. Répondez à cet email, on s’occupe du reste.",
        },
        { id: newBlockId(), type: "recap" },
        { id: newBlockId(), type: "button", label: "Ouvrir mon espace", href: "{{suivi_url}}" },
        { id: newBlockId(), type: "footer", text: `${orgName} · devis sur-mesure` },
      ],
    };
  }
  if (kind === "nurturing") {
    return {
      accent,
      blocks: [
        { id: newBlockId(), type: "heading", heading: "Des nouvelles pour {{contact_name}}", sub: orgName },
        {
          id: newBlockId(),
          type: "text",
          text: "Vous aviez commencé une configuration. On a gardé vos réponses — dites-nous si le projet est toujours d’actualité.",
        },
        { id: newBlockId(), type: "button", label: "Reprendre", href: "{{suivi_url}}" },
        { id: newBlockId(), type: "footer", text: `${orgName}` },
      ],
    };
  }
  if (kind === "perso") {
    return {
      accent,
      blocks: [
        { id: newBlockId(), type: "heading", heading: "Bonjour {{contact_name}}", sub: "" },
        { id: newBlockId(), type: "text", text: "Je reviens vers vous au sujet de votre demande." },
        { id: newBlockId(), type: "footer", text: orgName },
      ],
    };
  }
  return {
    accent,
    blocks: [
      { id: newBlockId(), type: "heading", heading: "{{contact_name}}, on n’a pas oublié votre projet", sub: orgName },
      {
        id: newBlockId(),
        type: "text",
        text: "Vous aviez configuré un devis chez nous. Si le besoin est toujours là, on peut avancer cette semaine.",
      },
      { id: newBlockId(), type: "recap" },
      { id: newBlockId(), type: "button", label: "Reprendre le fil", href: "{{suivi_url}}" },
      { id: newBlockId(), type: "footer", text: `${orgName} · relance commerciale` },
    ],
  };
}

export function parseDesign(value: unknown): EmailDesign {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { blocks: [] };
  const raw = value as { blocks?: unknown; accent?: unknown };
  const blocks = Array.isArray(raw.blocks)
    ? raw.blocks
        .filter((item): item is EmailBlock => Boolean(item && typeof item === "object" && "type" in item))
        .map((item) => ({ ...item, id: item.id || newBlockId() }))
    : [];
  return {
    blocks,
    accent: typeof raw.accent === "string" ? raw.accent : "#E85D04",
  };
}

export function designJson(design: EmailDesign): Json {
  return design as unknown as Json;
}
