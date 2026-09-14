import type { Metadata } from "next";
import { Suspense } from "react";
import { pageMetadata } from "@/lib/marketing/site";
import { MotDePasseForm } from "./mot-de-passe-form";

export const metadata: Metadata = pageMetadata({
  title: "Nouveau mot de passe",
  description: "Définissez votre mot de passe QuoteBuilder.",
  path: "/mot-de-passe",
  index: false,
});

export default function MotDePassePage() {
  return (
    <Suspense>
      <MotDePasseForm />
    </Suspense>
  );
}
