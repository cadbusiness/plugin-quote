"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SuiviPinPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/public/suivi/pin", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok || !data.token) {
      setError("Code introuvable ou expiré.");
      return;
    }
    router.push(`/suivi/${data.token}`);
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold">Suivre votre demande</h1>
      <p className="mt-2 text-sm text-slate-500">Entrez le code à 6 chiffres reçu par email.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 tracking-[0.4em]"
          placeholder="000000"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button disabled={busy || pin.length !== 6} className="w-full rounded-lg bg-slate-950 py-2.5 text-sm text-white disabled:opacity-50">
          {busy ? "Vérification…" : "Ouvrir"}
        </button>
      </form>
    </div>
  );
}
