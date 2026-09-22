import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/marketing/site";

/** Names that are QuoteBuilder marketing, not the merchant’s devis. */
const PRODUCTISH = /quote\s*builder|quote\s*assistant|arr[eê]tez de perdre/i;

export function humanizeFunnelSubject(value?: string | null) {
  const raw = (value || "").trim().replace(/[-_]+/g, " ").replace(/\s+/g, " ");
  if (!raw || PRODUCTISH.test(raw)) return "";
  return raw;
}

/**
 * Document title for a known public funnel.
 * Product-like funnel names (QuoteAssistant, the marketing slogan) fall back to
 * « Devis {secteur} — {organisation} ».
 */
export function funnelDocumentTitle(input: {
  orgName: string;
  configuratorName: string;
  subject?: string | null;
}): string | null {
  const org = input.orgName.trim();
  const name = input.configuratorName.trim();
  const subject = humanizeFunnelSubject(input.subject);
  if (!org || (!name && !subject)) return null;

  if (name && !PRODUCTISH.test(name)) {
    const lower = name.toLocaleLowerCase("fr");
    const orgLower = org.toLocaleLowerCase("fr");
    if (orgLower && lower.includes(orgLower)) return name;
    return `${name} — ${org}`;
  }

  if (subject) return `Devis ${subject} — ${org}`;
  return `Devis — ${org}`;
}

export function funnelDocumentDescription(orgName: string, subject?: string | null) {
  const org = orgName.trim() || "ce commerçant";
  const topic = humanizeFunnelSubject(subject);
  if (topic) return `Demandez un devis ${topic} auprès de ${org}.`;
  return `Demandez un devis auprès de ${org}.`;
}

export function funnelPageMetadata(
  input: {
    orgName: string;
    configuratorName: string;
    subject?: string | null;
    canonicalPath: string;
    index: boolean;
  } | null,
): Metadata | null {
  if (!input) return null;
  const title = funnelDocumentTitle(input);
  if (!title) return null;
  const description = funnelDocumentDescription(input.orgName, input.subject);
  const canonical = absoluteUrl(input.canonicalPath);
  const org = input.orgName.trim();
  return {
    title: { absolute: title },
    description,
    applicationName: org || undefined,
    alternates: { canonical },
    robots: input.index ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: org || title,
      locale: "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}
