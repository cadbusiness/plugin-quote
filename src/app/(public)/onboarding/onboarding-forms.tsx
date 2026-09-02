"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createSpace, joinSpace } from "@/app/(public)/onboarding/actions";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-4 w-full bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
    >
      {pending ? "…" : label}
    </button>
  );
}

export function CreateSpaceForm() {
  const [state, action] = useActionState(createSpace, { error: "" });
  return (
    <form action={action} className="border-t border-slate-200 pt-6">
      <h2 className="text-sm font-medium text-slate-900">Créer mon espace</h2>
      <label className="mt-3 block text-sm text-slate-600">
        Nom de l’entreprise
        <input
          name="name"
          required
          minLength={2}
          placeholder="Atelier Dupont"
          className="mt-1 w-full border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </label>
      {state?.error ? <p className="mt-2 text-sm text-red-600">{state.error}</p> : null}
      <Submit label="Créer l’espace" />
    </form>
  );
}

export function JoinSpaceForm() {
  const [state, action] = useActionState(joinSpace, { error: "" });
  return (
    <form action={action} className="border-t border-slate-200 pt-6">
      <h2 className="text-sm font-medium text-slate-900">Rejoindre un espace</h2>
      <p className="mt-1 text-xs text-slate-500">
        Uniquement si personne n’y est encore. Sinon, demandez une invitation.
      </p>
      <label className="mt-3 block text-sm text-slate-600">
        Identifiant (slug)
        <input
          name="slug"
          required
          placeholder="atelier-nord"
          className="mt-1 w-full border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </label>
      {state?.error ? <p className="mt-2 text-sm text-red-600">{state.error}</p> : null}
      <button
        type="submit"
        className="mt-4 w-full border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50"
      >
        Rejoindre
      </button>
    </form>
  );
}
