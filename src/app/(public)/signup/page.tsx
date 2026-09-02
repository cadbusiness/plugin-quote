"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthSplit } from "@/components/marketing/auth-split";

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <AuthSplit>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Créer un accès</h1>
      <p className="mt-1.5 text-sm text-slate-500">
        Ensuite vous créez ou rejoignez un espace client.
      </p>

      <form onSubmit={onSubmit} className="mt-8">
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Mot de passe
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldClass}
          />
        </label>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {busy ? "Création…" : "Continuer"}
        </button>
      </form>

      <p className="mt-8 text-sm text-slate-500">
        Déjà inscrit ?{" "}
        <Link href="/login" className="font-medium text-slate-900 underline-offset-2 hover:underline">
          Connexion
        </Link>
      </p>
    </AuthSplit>
  );
}
