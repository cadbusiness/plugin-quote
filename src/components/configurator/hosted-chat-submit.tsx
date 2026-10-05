"use client";

/**
 * Chat-only hosted funnels force `showWizard` off, so the wizard contact step
 * (fields + « Envoyer ma demande ») never mounts. The commerce agent opens that
 * step by setting `currentStep` to the contact screen; the host has to render it.
 * ContactCapture (« Sauvegarder ») stays a draft save and does not send the demande.
 */
export function shouldShowHostedChatSubmit(input: {
  chatOnly: boolean;
  screenType?: string | null;
}): boolean {
  return input.chatOnly && input.screenType === "contact";
}

type ContactFields = {
  name: string;
  email: string;
  phone: string;
  company: string;
  consentMarketing: boolean;
};

export function HostedChatSubmit({
  title,
  subtitle,
  contact,
  busy,
  error,
  accent,
  themed,
  onChange,
  onSubmit,
}: {
  title: string;
  subtitle?: string | null;
  contact: ContactFields;
  busy: boolean;
  error?: string;
  accent: string;
  themed: boolean;
  onChange: (patch: Partial<ContactFields>) => void;
  onSubmit: () => void;
}) {
  return (
    <section className="mt-10">
      <h1 className="text-3xl font-semibold tracking-tight text-mk-ink">{title}</h1>
      {subtitle ? <p className="mt-2.5 text-mk-faint">{subtitle}</p> : null}
      <div className="mt-9 grid gap-5 sm:grid-cols-2">
        <Field label="Nom" value={contact.name} onChange={(name) => onChange({ name })} />
        <Field
          label="Email"
          type="email"
          value={contact.email}
          onChange={(email) => onChange({ email })}
        />
        <Field label="Téléphone" value={contact.phone} onChange={(phone) => onChange({ phone })} />
        <Field label="Société" value={contact.company} onChange={(company) => onChange({ company })} />
        <label className="sm:col-span-2 flex items-start gap-2.5 text-sm text-mk-faint">
          <input
            type="checkbox"
            className="mt-1"
            checked={Boolean(contact.consentMarketing)}
            onChange={(e) => onChange({ consentMarketing: e.target.checked })}
          />
          <span>
            J’accepte d’être recontacté par email pour des offres liées à ma demande (consentement marketing,
            facultatif). Vos données sont traitées pour établir ce devis.
          </span>
        </label>
        {error ? <p className="sm:col-span-2 text-sm text-red-600">{error}</p> : null}
      </div>
      <div className="mt-12 flex items-center justify-end border-t border-mk-border pt-6">
        <button
          type="button"
          onClick={onSubmit}
          disabled={busy}
          className={
            themed
              ? "rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
              : "rounded-full bg-mk-accent px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-mk-accent-hover disabled:opacity-50"
          }
          style={themed ? { background: accent } : undefined}
        >
          {busy ? "Envoi…" : "Envoyer ma demande"}
        </button>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-mk-ink">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-mk-border bg-white px-3.5 py-2.5 text-mk-ink outline-none transition focus:border-mk-accent focus:ring-4 focus:ring-mk-accent/15"
      />
    </label>
  );
}
