import { Suspense } from "react";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm configured={Boolean(getSupabaseEnv())} />
    </Suspense>
  );
}
