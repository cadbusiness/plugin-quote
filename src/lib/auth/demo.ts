export const DEMO_ACCOUNTS = [
  {
    label: "Super admin",
    email: "admin@quotebuilder.app",
    password: "Demo2026!QB",
    role: "super_admin" as const,
  },
  {
    label: "Admin espace",
    email: "demo@quotebuilder.app",
    password: "Demo2026!QB",
    role: "owner" as const,
  },
  {
    label: "Commercial",
    email: "sales@quotebuilder.app",
    password: "Demo2026!QB",
    role: "sales" as const,
  },
] as const;

export const DEMO_ORG = {
  name: "Espace démo",
  slug: "demo",
} as const;
