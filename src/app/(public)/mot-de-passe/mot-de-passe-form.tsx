"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AuthSplit } from "@/components/marketing/auth-split";

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10";

export function MotDePasseForm() {
  const [password, setPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) {
      setError("Impossible d’enregistrer ce mot de passe. Le lien a peut-être expiré.");
      return;
    }
    setDone(true);
  }

  return (
    <AuthSplit>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Nouveau mot de passe</h1>
      {done ? (
        <p className="mt-4 text-sm text-slate-600">
          Mot de passe enregistré.{" "}
          <a href="/accueil" className="font-medium text-slate-900 underline-offset-2 hover:underline">
            Ouvrir l’espace
          </a>
        </p>
      ) : ready ? (
        <form onSubmit={onSubmit} className="mt-8">
          <label className="block text-sm font-medium text-slate-700">
            Mot de passe
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={fieldClass}
            />
          </label>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {busy ? "Enregistrement…" : "Enregistrer"}
          </button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-slate-500">
          Ouvrez le lien reçu par email pour définir votre mot de passe. S’il a expiré, demandez un nouvel envoi depuis
          l’équipe.
        </p>
      )}
    </AuthSplit>
  );
}
