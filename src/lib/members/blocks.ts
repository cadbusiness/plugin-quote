import { newMemberId, type MemberBlock, type MemberBlockType, type MemberResourceDraft } from "@/lib/members/types";

export const MEMBER_BLOCK_LABEL: Record<MemberBlockType, string> = {
  hero: "En-tête",
  text: "Texte",
  quotes: "Mes devis",
  documents: "Documents",
  plugins: "Plugins et liens",
  links: "Liste de liens",
  image: "Image",
  video: "Vidéo",
};

export function emptyMemberBlock(type: MemberBlockType): MemberBlock {
  const id = newMemberId();
  if (type === "hero") {
    return {
      id,
      type,
      heading: "Vos devis, au même endroit",
      sub: "Retrouvez chaque demande, ajoutez une pièce, ouvrez le suivi.",
      ctaLabel: "Voir mes devis",
    };
  }
  if (type === "text") {
    return {
      id,
      type,
      heading: "Comment ça marche",
      text: "Connectez-vous avec l’e-mail du devis et le code PIN reçu. Toutes vos demandes de cette enseigne apparaissent ici.",
    };
  }
  if (type === "links") {
    return { id, type, heading: "Liens utiles", links: [] };
  }
  if (type === "quotes") return { id, type, heading: "Mes devis" };
  if (type === "documents") return { id, type, heading: "Documents" };
  if (type === "image") return { id, type, heading: "Image", src: "", text: "" };
  if (type === "video") return { id, type, heading: "Vidéo", src: "" };
  return { id, type, heading: "Plugins et ressources" };
}

export function resourcesOfKind(resources: MemberResourceDraft[], kind: MemberResourceDraft["kind"] | "plugin") {
  if (kind === "plugin") {
    return resources.filter((item) => item.isPublished && (item.kind === "plugin" || item.kind === "link"));
  }
  return resources.filter((item) => item.isPublished && item.kind === kind);
}
