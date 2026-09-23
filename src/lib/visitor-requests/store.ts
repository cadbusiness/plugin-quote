import type { Json } from "@/lib/db/database.types";
import type { CatalogProduct, VisitorContact, VisitorLine, VisitorRequestRecord } from "@/lib/visitor-requests/types";

export type VisitorQuoteInput = {
  organizationId: string;
  configuratorId: string;
  contact: VisitorContact & { name: string };
  answers: Record<string, Json>;
  lines: VisitorLine[];
};

export interface VisitorRequestStore {
  findIdentity(input: {
    organizationId: string;
    connectionId: string | null;
    tokenHash: string;
  }): Promise<{ id: string } | null>;
  createIdentity(input: {
    organizationId: string;
    connectionId: string | null;
    tokenHash: string;
  }): Promise<{ id: string }>;
  touchIdentity(id: string): Promise<void>;
  findRequestByIdentity(identityId: string): Promise<VisitorRequestRecord | null>;
  saveRequest(record: VisitorRequestRecord): Promise<VisitorRequestRecord>;
  productsByIds(input: {
    organizationId: string;
    configuratorId: string;
    ids: string[];
  }): Promise<CatalogProduct[]>;
  createQuote(input: VisitorQuoteInput): Promise<{ id: string }>;
  syncQuote(input: VisitorQuoteInput & { quoteId: string }): Promise<void>;
  salesContext(organizationId: string): Promise<{
    salesEmail: string | null;
    salesName: string | null;
    template: { subject: string; body: string } | null;
  }>;
  recordSalesNotice(input: { organizationId: string; quoteId: string }): Promise<void>;
}
