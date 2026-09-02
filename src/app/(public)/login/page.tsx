import { getSupabaseEnv } from "@/lib/supabase/env";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return <LoginForm configured={Boolean(getSupabaseEnv())} />;
}
