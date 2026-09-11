export const DEMO_SEED_VERSION = 2;

export const DEMO_ORG = {
  name: "QuoteBuilder Démo",
  slug: "demo",
  plan: "pro",
  salesName: "Équipe démo QuoteBuilder",
  salesEmail: "demo@quotebuilder.app",
  salesPhone: "+33 1 86 95 00 00",
  family: "racking",
  accent: "#E85D04",
} as const;

export const DEMO_FUNNEL_SLUG = "rayonnage";
/** Canonical first, then legacy slugs seen on the demo org (onboarding + UI create). */
export const DEMO_FUNNEL_ALIASES = ["rayonnage", "principal", "funnel-rayonnage"] as const;
export const DEMO_SHOP_SLUG = "vitrine";
export const DEMO_SHOP_ALIASES = ["vitrine", "espace-demo", "vitrine-rayonnage"] as const;

export const DEMO_ACCOUNTS = [
  {
    label: "Super admin",
    email: "admin@quotebuilder.app",
    role: null,
    platform: "super_admin",
  },
  {
    label: "Admin espace",
    email: "demo@quotebuilder.app",
    role: "owner",
    platform: null,
  },
  {
    label: "Commercial",
    email: "sales@quotebuilder.app",
    role: "sales",
    platform: null,
  },
] as const;

export const DEMO_OWNER_EMAIL = "demo@quotebuilder.app";
export const DEMO_SALES_EMAIL = "sales@quotebuilder.app";

export function demoPasswordFromEnv() {
  return process.env.DEMO_PASSWORD?.trim() || "";
}

export function publicDemoPasswordFromEnv() {
  return process.env.NEXT_PUBLIC_DEMO_PASSWORD?.trim() || "";
}

export function requireDemoPassword() {
  const password = demoPasswordFromEnv();
  if (!password) {
    throw new Error(
      "DEMO_PASSWORD manquant. Définissez-le dans l’environnement (jamais dans git), puis relancez npm run seed:demo.",
    );
  }
  return password;
}
