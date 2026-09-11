import Link from "next/link";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import {
  FEATURE_MENU_GROUPS,
  FEATURES,
  getFeatureHref,
  type Feature,
} from "@/lib/marketing/content";

const MOCK_BY_SLUG: Record<
  string,
  { eyebrow: string; rows: { label: string; value: string; tone?: "hot" | "ok" | "muted" }[] }
> = {
  funnel: {
    eyebrow: "Parcours prospect",
    rows: [
      { label: "Étape 2 / 6", value: "Choix de gamme", tone: "ok" },
      { label: "Budget indicatif", value: "4 200 – 6 800 €" },
      { label: "Identité", value: "Email capté", tone: "ok" },
      { label: "Mode", value: "Wizard + chat" },
    ],
  },
  catalogue: {
    eyebrow: "Catalogue live",
    rows: [
      { label: "Produits actifs", value: "128" },
      { label: "Règles Si/Alors", value: "14 actives", tone: "ok" },
      { label: "Sync Woo", value: "Il y a 12 min", tone: "ok" },
      { label: "Suggestions", value: "Selon réponses" },
    ],
  },
  demandes: {
    eyebrow: "Pipeline du jour",
    rows: [
      { label: "Martin · Terrasse", value: "Hot", tone: "hot" },
      { label: "Dupont · Rénovation", value: "Warm", tone: "ok" },
      { label: "Bernard · Abandon", value: "À relancer", tone: "muted" },
      { label: "Assignés", value: "3 / 7 traités" },
    ],
  },
  autopilote: {
    eyebrow: "Workflow Actif",
    rows: [
      { label: "T+0", value: "Confirmation + PDF", tone: "ok" },
      { label: "T+4 h", value: "Rappel commercial", tone: "ok" },
      { label: "J+3", value: "Nurturing", tone: "ok" },
      { label: "Runs 24 h", value: "41 exécutions" },
    ],
  },
  "espace-prospect": {
    eyebrow: "Espace partagé",
    rows: [
      { label: "Accès", value: "Lien + PIN", tone: "ok" },
      { label: "Statut", value: "En étude" },
      { label: "Compléments", value: "2 photos reçues", tone: "ok" },
      { label: "Messages", value: "1 non lu" },
    ],
  },
  stats: {
    eyebrow: "Cette semaine",
    rows: [
      { label: "Visiteurs → devis", value: "18 %" },
      { label: "CA potentiel", value: "84 k€", tone: "ok" },
      { label: "Délai médian", value: "1,4 j" },
      { label: "Abandons utiles", value: "9 à relancer", tone: "hot" },
    ],
  },
  equipe: {
    eyebrow: "Organisation",
    rows: [
      { label: "Léa", value: "4 dossiers", tone: "ok" },
      { label: "Karim", value: "3 dossiers" },
      { label: "Invitations", value: "1 en attente", tone: "muted" },
      { label: "Rôles", value: "Admin · Commercial" },
    ],
  },
  integrations: {
    eyebrow: "Connecté",
    rows: [
      { label: "Widget", value: "Actif", tone: "ok" },
      { label: "WordPress", value: "v1.4 installé", tone: "ok" },
      { label: "WooCommerce", value: "Sync OK", tone: "ok" },
      { label: "Webhooks", value: "2 endpoints" },
    ],
  },
};

function toneClass(tone?: "hot" | "ok" | "muted") {
  if (tone === "hot") return "bg-rose-100 text-rose-700";
  if (tone === "ok") return "bg-emerald-100 text-emerald-800";
  if (tone === "muted") return "bg-amber-100 text-amber-800";
  return "bg-mk-band text-mk-muted";
}

export function FeaturePage({ feature }: { feature: Feature }) {
  const idx = FEATURES.findIndex((f) => f.slug === feature.slug);
  const prev = idx > 0 ? FEATURES[idx - 1] : null;
  const next = idx < FEATURES.length - 1 ? FEATURES[idx + 1] : null;
  const mock = MOCK_BY_SLUG[feature.slug];
  const relatedGroup = FEATURE_MENU_GROUPS.find((g) => g.slugs.includes(feature.slug));
  const siblings = (relatedGroup?.items ?? []).filter((f) => f.slug !== feature.slug);

  return (
    <>
      <section className="relative overflow-hidden border-b border-mk-border px-6 pb-14 pt-12 sm:pb-16 sm:pt-16">
        <div aria-hidden className="marketing-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-mk-faint">
              <Link href="/fonctionnalites" className="hover:text-mk-ink">
                Fonctionnalités
              </Link>
              <span>/</span>
              <span className="text-mk-muted">{feature.title}</span>
            </div>
            <p className="mt-6 text-sm font-medium text-mk-accent">{feature.eyebrow}</p>
            <h1 className="mt-3 max-w-3xl text-[1.9rem] font-semibold leading-[1.12] tracking-tight sm:text-5xl sm:leading-[1.08]">
              {feature.headline}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
              {feature.lead}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-full bg-mk-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-mk-accent-hover"
              >
                Essayer gratuitement
              </Link>
              <Link
                href="/comment-ca-marche"
                className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-mk-ink ring-1 ring-mk-border hover:bg-mk-band"
              >
                Voir la démo
              </Link>
            </div>
          </div>

          {mock ? (
            <div className="rounded-2xl bg-mk-dark p-5 text-mk-on-dark shadow-[0_30px_80px_-40px_rgba(26,21,16,0.7)] sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mk-accent">
                  {mock.eyebrow}
                </p>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
                  Live
                </span>
              </div>
              <ul className="mt-4 space-y-2.5">
                {mock.rows.map((row) => (
                  <li
                    key={row.label}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-white/6 px-3.5 py-3 ring-1 ring-white/8"
                  >
                    <span className="text-sm text-mk-on-dark/70">{row.label}</span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${toneClass(row.tone)}`}
                    >
                      {row.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <section className="px-6 py-12 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Ce que ça change</h2>
            <ul className="mt-5 space-y-3">
              {feature.outcomes.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 rounded-2xl bg-white px-4 py-3 text-[15px] leading-6 text-mk-ink/80 ring-1 ring-mk-border"
                >
                  <span className="mt-0.5 font-semibold text-mk-accent">▸</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm italic leading-6 text-mk-muted">{feature.proof}</p>
          </div>

          <div className="rounded-2xl bg-white p-6 ring-1 ring-mk-border sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mk-accent">
              Capacités
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {feature.capabilities.map((cap) => (
                <div key={cap.title} className="rounded-2xl bg-mk-band p-4">
                  <h3 className="text-sm font-semibold text-mk-ink">{cap.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-mk-muted">{cap.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {siblings.length > 0 ? (
        <section className="border-y border-mk-border bg-mk-band px-6 py-12">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-medium text-mk-accent">
              Même famille · {relatedGroup?.label}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
              Modules qui travaillent ensemble
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {siblings.map((item) => (
                <Link
                  key={item.slug}
                  href={getFeatureHref(item.slug)}
                  className="group rounded-xl bg-mk-surface p-5 ring-1 ring-mk-border transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-28px_rgba(11,13,18,0.2)]"
                >
                  <h3 className="text-base font-semibold group-hover:text-mk-accent">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-mk-muted">{item.menuBlurb}</p>
                  <p className="mt-3 text-sm font-medium text-mk-faint group-hover:text-mk-accent">
                    Voir →
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {prev ? (
              <Link
                href={getFeatureHref(prev.slug)}
                className="text-sm font-medium text-mk-muted hover:text-mk-ink"
              >
                ← {prev.title}
              </Link>
            ) : (
              <Link
                href="/fonctionnalites"
                className="text-sm font-medium text-mk-muted hover:text-mk-ink"
              >
                ← Toutes les fonctionnalités
              </Link>
            )}
          </div>
          <div className="sm:text-right">
            {next ? (
              <Link
                href={getFeatureHref(next.slug)}
                className="text-sm font-medium text-mk-muted hover:text-mk-ink"
              >
                {next.title} →
              </Link>
            ) : (
              <Link href="/tarifs" className="text-sm font-medium text-mk-muted hover:text-mk-ink">
                Voir les tarifs →
              </Link>
            )}
          </div>
        </div>
      </section>

      <MarketingCta
        title={`${feature.title}. Dans le même système.`}
        text="Tout est déjà relié : funnel, catalogue, pipeline, autopilote."
      />
    </>
  );
}
