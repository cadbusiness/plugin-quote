"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { connectChannel, type ChannelState } from "@/app/(app)/canaux/actions";
import {
  EMAIL_PRESETS,
  PROVIDER_LABELS,
  type CommProvider,
  type CommScope,
} from "@/lib/comm/types";

const EMAILS: { id: CommProvider; label: string; blurb: string; tint: string }[] = [
  { id: "gmail", label: PROVIDER_LABELS.gmail, blurb: "Boîte Google. Mot de passe d’application, pas le mot de passe Google.", tint: "bg-rose-50 text-rose-900 ring-rose-200" },
  { id: "outlook", label: PROVIDER_LABELS.outlook, blurb: "Microsoft 365 / Outlook.com. Mot de passe d’application ou SMTP.", tint: "bg-sky-50 text-sky-900 ring-sky-200" },
  { id: "imap", label: PROVIDER_LABELS.imap, blurb: "OVH, Ionos, Proton, serveur maison. IMAP + SMTP.", tint: "bg-orange-50 text-[#9a3412] ring-orange-200" },
];

const SOCIAL: { id: CommProvider; label: string; blurb: string; tint: string }[] = [
  { id: "instagram", label: PROVIDER_LABELS.instagram, blurb: "DM Instagram. L’API Meta se branche ici dès que le connecteur est ouvert.", tint: "bg-violet-50 text-violet-900 ring-violet-200" },
  { id: "facebook", label: PROVIDER_LABELS.facebook, blurb: "Page Facebook et Messenger. Même socle que Instagram.", tint: "bg-indigo-50 text-indigo-900 ring-indigo-200" },
  { id: "whatsapp", label: PROVIDER_LABELS.whatsapp, blurb: "WhatsApp Business. Prêt dans le schéma, OAuth ensuite.", tint: "bg-emerald-50 text-emerald-900 ring-emerald-200" },
  { id: "messenger", label: PROVIDER_LABELS.messenger, blurb: "Messenger autonome si la page n’est pas Facebook.", tint: "bg-sky-50 text-sky-900 ring-sky-200" },
];

export function ConnectChannelDialog({
  isAdmin,
  staffEmail,
}: {
  isAdmin: boolean;
  staffEmail: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [kind, setKind] = useState<"email" | "social">("email");
  const [scope, setScope] = useState<CommScope>(isAdmin ? "org" : "staff");
  const [provider, setProvider] = useState<CommProvider>("gmail");
  const [state, formAction] = useActionState<ChannelState, FormData>(connectChannel, {});

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

  const email = kind === "email";
  const providers = email ? EMAILS : SOCIAL;
  const preset = email && (provider === "gmail" || provider === "outlook" || provider === "imap") ? EMAIL_PRESETS[provider] : null;
  const maxStep = email ? 3 : 2;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setStep(0);
        }}
        className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400]"
      >
        Connecter un canal
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" aria-label="Fermer" className="absolute inset-0 bg-slate-950/40" onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="connect-channel-title"
            className="relative z-10 flex max-h-[min(40rem,calc(100dvh-2rem))] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
          >
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#E85D04]">
                Canal · {step + 1} / {maxStep + 1}
              </p>
              <h2 id="connect-channel-title" className="mt-1 text-lg font-semibold text-slate-900">
                {step === 0 && "Quel moyen brancher ?"}
                {step === 1 && "Pour qui ?"}
                {step === 2 && (email ? "Quel fournisseur ?" : "Quel réseau ?")}
                {step === 3 && "Accès à la boîte"}
              </h2>
            </div>

            <form action={formAction} className="flex min-h-0 flex-1 flex-col">
              <input type="hidden" name="provider" value={provider} />
              <input type="hidden" name="scope" value={scope} />

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                <div hidden={step !== 0} className="grid gap-2 sm:grid-cols-2">
                  <Choice
                    on={kind === "email"}
                    tint="bg-orange-50 text-[#9a3412] ring-orange-200"
                    title="Boîte mail"
                    blurb="Recevoir les mails clients, répondre, envoyer les campagnes depuis cette adresse."
                    onClick={() => {
                      setKind("email");
                      setProvider("gmail");
                    }}
                  />
                  <Choice
                    on={kind === "social"}
                    tint="bg-violet-50 text-violet-900 ring-violet-200"
                    title="Réseaux"
                    blurb="Instagram, Facebook, WhatsApp. On pose le canal maintenant, l’OAuth suit."
                    onClick={() => {
                      setKind("social");
                      setProvider("instagram");
                    }}
                  />
                </div>

                <div hidden={step !== 1} className="grid gap-2 sm:grid-cols-2">
                  {isAdmin ? (
                    <Choice
                      on={scope === "org"}
                      tint="bg-emerald-50 text-emerald-900 ring-emerald-200"
                      title="Boîte de l’équipe"
                      blurb="Partagée. Tous les commerciaux voient les messages et peuvent relancer."
                      onClick={() => setScope("org")}
                    />
                  ) : null}
                  <Choice
                    on={scope === "staff"}
                    tint="bg-sky-50 text-sky-900 ring-sky-200"
                    title="Ma boîte perso"
                    blurb="Seulement vous. Idéal pour écrire aux clients en votre nom."
                    onClick={() => setScope("staff")}
                  />
                </div>

                <div hidden={step !== 2} className="grid gap-2 sm:grid-cols-2">
                  {providers.map((item) => (
                    <Choice
                      key={item.id}
                      on={provider === item.id}
                      tint={item.tint}
                      title={item.label}
                      blurb={item.blurb}
                      onClick={() => setProvider(item.id)}
                    />
                  ))}
                </div>

                <div hidden={step !== 3} className="space-y-4">
                  {email ? (
                    <>
                      <Field label="Adresse email" hint="Les mails reçus sur cette adresse apparaîtront dans le canal.">
                        <input
                          name="address"
                          type="email"
                          required
                          defaultValue={scope === "staff" ? staffEmail ?? "" : ""}
                          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                        />
                      </Field>
                      <Field label="Nom affiché" hint="Laissez vide pour reprendre l’adresse.">
                        <input name="label" className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
                      </Field>
                      <Field
                        label={provider === "gmail" || provider === "outlook" ? "Mot de passe d’application" : "Mot de passe IMAP"}
                        hint="Jamais le mot de passe du compte Google/Microsoft. Créez un mot de passe d’application."
                      >
                        <input
                          name="password"
                          type="password"
                          required
                          autoComplete="new-password"
                          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 font-mono text-sm"
                        />
                      </Field>
                      <input type="hidden" name="username" defaultValue={scope === "staff" ? staffEmail ?? "" : ""} />
                      {provider === "imap" ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field label="Hôte IMAP">
                            <input name="imap_host" defaultValue={preset?.imapHost} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
                          </Field>
                          <Field label="Port IMAP">
                            <input name="imap_port" type="number" defaultValue={preset?.imapPort} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
                          </Field>
                          <Field label="Hôte SMTP">
                            <input name="smtp_host" defaultValue={preset?.smtpHost} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
                          </Field>
                          <Field label="Port SMTP">
                            <input name="smtp_port" type="number" defaultValue={preset?.smtpPort} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
                          </Field>
                        </div>
                      ) : (
                        <>
                          <input type="hidden" name="imap_host" value={preset?.imapHost ?? ""} />
                          <input type="hidden" name="imap_port" value={preset?.imapPort ?? 993} />
                          <input type="hidden" name="smtp_host" value={preset?.smtpHost ?? ""} />
                          <input type="hidden" name="smtp_port" value={preset?.smtpPort ?? 587} />
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <Field label="Compte / page" hint="@handle, URL de page ou numéro WhatsApp.">
                        <input name="address" required placeholder="@votrepage" className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
                      </Field>
                      <Field label="Nom affiché">
                        <input name="label" className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
                      </Field>
                      <p className="rounded-lg bg-violet-50 px-3 py-2 text-sm text-violet-900">
                        On enregistre le canal. La connexion OAuth {PROVIDER_LABELS[provider]} s’activera sur ce même écran.
                      </p>
                    </>
                  )}
                </div>
              </div>

              {state.error ? (
                <p className="border-t border-rose-100 bg-rose-50 px-5 py-2 text-sm text-rose-700">{state.error}</p>
              ) : null}

              <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-5 py-3">
                <button type="button" onClick={() => setOpen(false)} className="text-sm text-slate-500 hover:text-slate-900">
                  Annuler
                </button>
                <div className="flex gap-2">
                  {step > 0 ? (
                    <button type="button" onClick={() => setStep((s) => s - 1)} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm">
                      Retour
                    </button>
                  ) : null}
                  {step < maxStep ? (
                    <button
                      type="button"
                      onClick={() => setStep((s) => s + 1)}
                      className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400]"
                    >
                      Continuer
                    </button>
                  ) : (
                    <Submit email={email} />
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Submit({ email }: { email: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400] disabled:opacity-50"
    >
      {pending ? "Connexion…" : email ? "Connecter la boîte" : "Enregistrer le canal"}
    </button>
  );
}

function Choice({
  on,
  tint,
  title,
  blurb,
  onClick,
}: {
  on: boolean;
  tint: string;
  title: string;
  blurb: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-3 text-left ring-1 transition-colors ${
        on ? `${tint} ring-current` : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
      }`}
    >
      <span className="block text-sm font-medium">{title}</span>
      <span className="mt-1 block text-xs leading-5 opacity-80">{blurb}</span>
    </button>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-slate-900">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}
