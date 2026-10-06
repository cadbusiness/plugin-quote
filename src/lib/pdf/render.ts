import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { QuotePdf } from "@/lib/pdf/quote-pdf";
import type { QuestionMeta } from "@/lib/crm/answers";
import type { Tables } from "@/lib/db/database.types";
import type { Answers } from "@/lib/wizard/types";

export async function renderQuotePdf(input: {
  organization: Tables<"organizations">;
  configurator: Tables<"configurators">;
  quote: Tables<"quotes">;
  items: {
    name: string;
    quantity: number;
    options: Record<string, string>;
    priceMin: number | null;
    priceMax: number | null;
    currency?: string | null;
  }[];
  answers: Answers;
  suggestionName: string;
  priceMin: number | null;
  priceMax: number | null;
  currency?: string | null;
  questions?: QuestionMeta[];
}) {
  return renderToBuffer(
    createElement(QuotePdf, {
      organizationName: input.organization.name,
      salesName: input.organization.sales_name,
      salesEmail: input.organization.sales_email,
      salesPhone: input.organization.sales_phone,
      configuratorName: input.configurator.name,
      contactName: input.quote.contact_name,
      contactEmail: input.quote.contact_email ?? "",
      contactCompany: input.quote.contact_company,
      answers: input.answers,
      items: input.items,
      suggestionName: input.suggestionName,
      priceMin: input.priceMin,
      priceMax: input.priceMax,
      currency: input.currency,
      questions: input.questions,
    }) as Parameters<typeof renderToBuffer>[0],
  );
}
