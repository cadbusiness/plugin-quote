import type { Metadata } from "next";
import { Suspense } from "react";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { pageMetadata } from "@/lib/marketing/site";
import { LoginForm } from "./login-form";

export const metadata: Metadata = pageMetadata({
  title: "Connexion",
  description: "Accédez à votre espace QuoteBuilder.",
  path: "/login",
  index: false,
});

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm configured={Boolean(getSupabaseEnv())} />
    </Suspense>
  );
}
