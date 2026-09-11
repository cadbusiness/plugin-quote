import type { Metadata } from "next";
import { pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Créer un compte",
  description: "Créez un accès QuoteBuilder. Free sans carte.",
  path: "/signup",
  index: false,
});

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
