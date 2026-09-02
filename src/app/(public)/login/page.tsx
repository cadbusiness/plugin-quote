"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { DEMO_ACCOUNTS } from "@/lib/auth/demo";
import { postLoginPath } from "@/lib/auth/platform";
import { AuthSplit } from "@/components/marketing/auth-split";

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setBusy(false);
      setError("Email ou mot de passe incorrect.");
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next");
    window.location.assign(postLoginPath(data.user, next));
  }

  return (
    <AuthSplit>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Connexion</h1>
      <p className="mt-1.5 text-sm text-slate-500">Pipeline des demandes, ou console super admin.</p>

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
            autoComplete="current-password"
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
          {busy ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Accès test</p>
        <div className="mt-2 space-y-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => {
                setEmail(account.email);
                setPassword(account.password);
                setError(null);
              }}
              className="flex w-full items-center justify-between rounded-lg bg-white px-3 py-2 text-left text-sm ring-1 ring-slate-200 transition hover:ring-slate-400"
            >
              <span>
                <span className="font-medium text-slate-900">{account.label}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{account.email}</span>
              </span>
              <span className="text-xs text-slate-400">Remplir</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-8 text-sm text-slate-500">
        Pas de compte ?{" "}
        <Link href="/signup" className="font-medium text-slate-900 underline-offset-2 hover:underline">
          Créer un accès
        </Link>
      </p>
    </AuthSplit>
  );
}
