"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MemberTheme } from "@/lib/members/types";

export function MemberSpaceLogin({
  orgName,
  spaceName,
  theme,
  orgSlug,
  spaceSlug,
}: {
  orgName: string;
  spaceName: string;
  theme: MemberTheme;
  orgSlug: string;
  spaceSlug: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/public/membres/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orgSlug, spaceSlug, email, pin }),
    });
    setBusy(false);
    if (!res.ok) {
      setError("E-mail ou code introuvable. Utilisez l’e-mail du devis et le PIN à 6 chiffres.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center px-6" style={{ background: theme.background, color: theme.text }}>
      <div className="mx-auto w-full max-w-md">
        <p className="text-xs font-medium uppercase tracking-[0.14em] opacity-60">{orgName}</p>
        <h1 className="mt-2 text-2xl font-semibold">{spaceName}</h1>
        <p className="mt-2 text-sm leading-6 opacity-70">
          Entrez l’e-mail utilisé pour le devis et le code PIN reçu par e-mail. Tous vos devis de cette enseigne
          apparaissent ensuite ici.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="vous@entreprise.fr"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          />
          <input
            value={pin}
            onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            placeholder="000000"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm tracking-[0.4em] text-slate-900"
          />
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <button
            disabled={busy || pin.length !== 6}
            className="w-full rounded-lg py-2.5 text-sm font-medium text-white disabled:opacity-50"
            style={{ background: theme.accent }}
          >
            {busy ? "Vérification…" : "Ouvrir mon espace"}
          </button>
        </form>
      </div>
    </div>
  );
}
