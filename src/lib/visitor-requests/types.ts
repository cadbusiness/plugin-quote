import type { Json } from "@/lib/db/database.types";

export type VisitorRequestStatus = "draft" | "submitted";

export type VisitorChannel = "email" | "phone" | "both";

/** Channel the visitor picked. Email stores `contact.email`; phone stores `contact.phone`. */
export type ChosenChannel = "email" | "phone";

export type VisitorContact = {
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
};

export type VisitorLine = {
  productId: string;
  name: string;
  quantity: number;
  options: Record<string, string>;
  priceMin: number | null;
  priceMax: number | null;
};

export type VisitorRequestRecord = {
  id: string;
  organizationId: string;
  identityId: string;
  configuratorId: string;
  connectionId: string | null;
  status: VisitorRequestStatus;
  quoteId: string | null;
  contact: VisitorContact;
  /** Set when the visitor chooses « Par e-mail » or the phone channel. */
  contactChannel: ChosenChannel | null;
  answers: Record<string, Json>;
  salesNotifiedAt: string | null;
  submittedAt: string | null;
  lines: VisitorLine[];
};

export type CatalogProduct = {
  id: string;
  name: string;
  priceMin: number | null;
  priceMax: number | null;
  active: boolean;
};

export type PublicVisitorLine = {
  productId: string;
  name: string;
  quantity: number;
};

export type PublicVisitorRequest = {
  id: string;
  status: VisitorRequestStatus;
  lines: PublicVisitorLine[];
  needsChannel: boolean;
  channel: VisitorChannel | null;
  recognized: boolean;
  contact: VisitorContact;
  quoteId: string | null;
};

export type LineCommand =
  | { op: "set"; productId: string; quantity: number; options?: Record<string, string> }
  | { op: "add"; productId: string; quantity: number; options?: Record<string, string> }
  | { op: "remove"; productId: string };

export type SalesNotice = {
  to: string;
  subject: string;
  text: string;
  organizationId: string;
  quoteId: string;
  contactEmail: string | null;
};

export function emptyContact(): VisitorContact {
  return { name: null, email: null, phone: null, company: null };
}

export function toPublicRequest(record: VisitorRequestRecord): PublicVisitorRequest {
  const channel = record.contactChannel ?? channelOf(record.contact);
  const needsChannel =
    record.contactChannel === "email"
      ? !record.contact.email
      : record.contactChannel === "phone"
        ? !record.contact.phone
        : channel == null;
  return {
    id: record.id,
    status: record.status,
    lines: record.lines.map((line) => ({
      productId: line.productId,
      name: line.name,
      quantity: line.quantity,
    })),
    needsChannel,
    channel: record.contactChannel ?? (channel === "both" ? null : channel),
    recognized: true,
    contact: record.contact,
    quoteId: record.quoteId,
  };
}

export function channelOf(contact: VisitorContact): VisitorChannel | null {
  if (contact.email && contact.phone) return "both";
  if (contact.email) return "email";
  if (contact.phone) return "phone";
  return null;
}

export function displayName(contact: VisitorContact): string {
  const name = contact.name?.trim();
  if (name) return name.slice(0, 120);
  if (contact.email) return contact.email;
  if (contact.phone) return contact.phone;
  return "Prospect";
}
