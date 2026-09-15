import {
  FileText,
  Heading2,
  Image as ImageIcon,
  Link2,
  MessageSquareQuote,
  PlayCircle,
  Puzzle,
  Type,
  type LucideIcon,
} from "lucide-react";
import type { MemberBlockType, MemberResourceKind } from "@/lib/members/types";

export const MEMBER_BLOCK_ICON: Record<MemberBlockType, LucideIcon> = {
  hero: Heading2,
  text: Type,
  quotes: MessageSquareQuote,
  documents: FileText,
  plugins: Puzzle,
  links: Link2,
  image: ImageIcon,
  video: PlayCircle,
};

export function resourceIcon(kind: MemberResourceKind): LucideIcon {
  if (kind === "document") return FileText;
  if (kind === "plugin") return Puzzle;
  return Link2;
}

export function IconWell({
  icon: Icon,
  accent,
}: {
  icon: LucideIcon;
  accent: string;
}) {
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
      style={{ background: `${accent}14`, color: accent }}
    >
      <Icon className="h-5 w-5" aria-hidden />
    </span>
  );
}
