"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
    const { data, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) {
      setBusy(false);
      setError(authError.message);
      return;
    }
    if (data.user) {
      const { data: orgs } = await supabase.from("organizations").select("id").eq("slug", "quickly").limit(1);
      const orgId = orgs?.[0]?.id;
      if (orgId) {
        await supabase.from("memberships").insert({
          organization_id: orgId,
          user_id: data.user.id,
          role: "owner",
        });
      }
    }
    setBusy(false);
    router.push("/devis");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-semibold">Créer un accès</h1>
        <p className="mt-1 text-sm text-slate-500">Premier utilisateur Quickly = propriétaire.</p>
        <label className="mt-6 block text-sm">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="mt-3 block text-sm">
          Mot de passe
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-lg bg-slate-950 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy ? "Création…" : "Créer le compte"}
        </button>
        <p className="mt-4 text-center text-sm text-slate-500">
          Déjà inscrit ? <Link href="/login" className="text-slate-900 underline">Connexion</Link>
        </p>
      </form>
    </main>
  );
}
