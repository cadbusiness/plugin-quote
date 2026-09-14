"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { inviteMember, type InviteMemberState } from "@/app/(app)/equipe/actions";
import { roleBlurb } from "@/lib/crm/team";

const ROLES = [
  { id: "sales", label: "Commercial", hint: roleBlurb("sales") },
  { id: "admin", label: "Admin", hint: roleBlurb("admin") },
] as const;

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-[#E85D04] px-3.5 py-1.5 text-sm font-medium text-white hover:bg-[#d35400] disabled:opacity-60"
    >
      {pending ? "Envoi…" : label}
    </button>
  );
}

export function InviteMemberDialog() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<"sales" | "admin">("sales");
  const [state, formAction] = useActionState<InviteMemberState, FormData>(inviteMember, {});

  useEffect(() => {
    function openFromHash() {
      if (window.location.hash === "#nouveau") {
        setOpen(true);
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-[#E85D04] px-3.5 py-1.5 text-sm font-medium text-white hover:bg-[#d35400]"
      >
        Inviter
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Fermer"
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-member-title"
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl"
          >
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#E85D04]">Nouvel accès</p>
              <h2 id="invite-member-title" className="mt-1 text-lg font-semibold text-slate-900">
                Qui rejoignez-vous ?
              </h2>
            </div>
            <form action={formAction} className="px-5 py-4">
              <input type="hidden" name="role" value={role} />
              <div className="grid gap-2">
                {ROLES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id)}
                    className={`rounded-lg border px-3.5 py-3 text-left ${
                      role === item.id
                        ? "border-[#E85D04] bg-orange-50/70 ring-1 ring-[#E85D04]"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-sm font-medium text-slate-900">{item.label}</span>
                    <p className="mt-0.5 text-sm text-slate-500">{item.hint}</p>
                  </button>
                ))}
              </div>
              <label className="mt-4 block text-sm">
                <span className="font-medium text-slate-900">Email</span>
                <input
                  name="email"
                  type="email"
                  required
                  autoFocus
                  placeholder="lea@equipe.com"
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              {state.error ? <p className="mt-3 text-sm text-rose-600">{state.error}</p> : null}
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <Submit label="Envoyer l’invitation" />
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
