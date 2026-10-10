import type { Metadata } from "next";
import Link from "next/link";
import { AgentConsole } from "@/components/marketing/agentic/agent-console";
import { AgentPipeline } from "@/components/marketing/agentic/agent-pipeline";
import { McpShowcase } from "@/components/marketing/agentic/mcp-showcase";
import { CountUp, Reveal } from "@/components/marketing/agentic/motion";
import { AutopilotStage } from "@/components/marketing/autopilot-stage";
import { CopyButton } from "@/components/marketing/copy-button";
import { LandingSectors } from "@/components/marketing/landing-sectors";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SystemCinema } from "@/components/marketing/system-cinema";
import { FEATURE_MENU_GROUPS, STATS } from "@/lib/marketing/content";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  SITE_URL,
  pageMetadata,
} from "@/lib/marketing/site";

const MCP_URL = `${SITE_URL}/api/mcp`;

export const metadata: Metadata = pageMetadata({
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  path: "/",
});

const MCP_TOOLS = [
  "get_leads",
  "get_lead_detail",
  "update_lead_status",
  "create_lead",
  "list_quotes",
  "get_quote_status",
  "create_quote",
  "get_stats",
  "list_funnels",
  "get_funnel_performance",
  "trigger_followup",
  "get_pending_followups",
];

const STACK = [
  "Claude",
  "ChatGPT",
  "Cursor",
  "Codex",
  "WordPress",
  "WooCommerce",
  "Shopify",
  "Widget JS",
  "Webhooks",
  "Serveur MCP",
];

export default function HomePage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-mk-dark px-6 pb-16 pt-14 text-mk-on-dark sm:pb-24 sm:pt-20">
        <div aria-hidden className="qb-hero-glow pointer-events-none absolute -inset-[10%] -z-10" />
        <div aria-hidden className="qb-dark-grid pointer-events-none absolute inset-0 -z-10" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div className="text-center lg:text-left">
            <div className="qb-enter" style={{ "--qb-delay": "0ms" } as React.CSSProperties}>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[12px] font-medium text-white/75">
                <span className="qb-live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Agents de devis B2B · serveur MCP inclus
              </p>
            </div>
            <div className="qb-enter" style={{ "--qb-delay": "80ms" } as React.CSSProperties}>
              <h1 className="mt-6 text-[2.4rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl sm:leading-[1.02]">
                Vos devis avancent.
                <br />
                <span className="qb-shimmer-text">Vos agents s’en chargent.</span>
              </h1>
            </div>
            <div className="qb-enter" style={{ "--qb-delay": "160ms" } as React.CSSProperties}>
              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg lg:mx-0">
                Un agent qualifie le prospect sur votre catalogue et monte le dossier. L’autopilote
                relance jusqu’à la réponse. Et votre propre IA, Claude, ChatGPT ou Cursor, pilote le
                tout via MCP.
              </p>
            </div>
            <div className="qb-enter" style={{ "--qb-delay": "240ms" } as React.CSSProperties}>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/signup"
                  className="group inline-flex items-center gap-2 rounded-full bg-mk-accent px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_40px_-10px_rgba(232,93,4,0.8)] transition hover:bg-mk-accent-hover"
                >
                  Commencer gratuitement
                  <span className="transition group-hover:translate-x-0.5">→</span>
                </Link>
                <Link
                  href="#mcp"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white/85 transition hover:border-white/30 hover:bg-white/[0.05]"
                >
                  <span className="font-mono text-[12px] text-sky-300">mcp</span>
                  Brancher mon IA
                </Link>
              </div>
              <p className="mt-4 text-xs text-white/40">Free · sans carte · upgrade quand vous voulez</p>
            </div>
          </div>
          <div className="qb-enter" style={{ "--qb-delay": "200ms" } as React.CSSProperties}>
            <div className="qb-float">
              <AgentConsole />
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Intégrations" className="overflow-hidden border-b border-mk-border bg-mk-surface py-5">
        <div className="qb-marquee flex w-max gap-10 pr-10">
          {[...STACK, ...STACK].map((name, i) => (
            <span
              key={`${name}-${i}`}
              aria-hidden={i >= STACK.length}
              className="flex items-center gap-10 whitespace-nowrap text-sm font-medium text-mk-faint"
            >
              {name}
              <span className="h-1 w-1 rounded-full bg-mk-border" />
            </span>
          ))}
        </div>
      </section>

      <section className="border-b border-mk-border bg-mk-band px-6 py-12 sm:py-14">
        <p className="text-center text-xs font-medium uppercase tracking-[0.16em] text-mk-faint">
          Pourquoi les devis meurent
        </p>
        <div className="mx-auto mt-8 grid max-w-4xl gap-8 sm:grid-cols-3 sm:gap-6">
          {STATS.map((stat, i) => (
            <Reveal key={stat.value} delay={i * 100} className="text-center">
              <p className="text-4xl font-semibold tracking-tight text-mk-ink sm:text-5xl">
                <CountUp value={stat.value} />
              </p>
              <p className="mx-auto mt-2 max-w-[14rem] text-sm leading-5 text-mk-muted">
                {stat.label}
              </p>
            </Reveal>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-md text-center text-sm text-mk-muted">
          Un humain abandonne après une relance. Un agent, jamais.
        </p>
      </section>

      <section className="relative px-6 py-16 sm:py-24">
        <div aria-hidden className="marketing-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-mk-accent">Le système</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              De la première question à la relance.
              <br className="hidden sm:block" /> Sans que personne ne tienne le fil.
            </h2>
            <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-[17px]">
              Chaque étape a son agent et ses outils. Vous intervenez quand il faut conclure.
            </p>
          </Reveal>
          <div className="mt-12">
            <AgentPipeline />
          </div>
        </div>
      </section>

      <section id="mcp" className="relative isolate scroll-mt-20 overflow-hidden bg-mk-dark px-6 py-16 text-mk-on-dark sm:py-24">
        <div aria-hidden className="qb-dark-grid pointer-events-none absolute inset-0 -z-10" />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 top-10 -z-10 h-[480px] w-[480px] rounded-full bg-sky-500/10 blur-3xl"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <Reveal>
              <p className="font-mono text-[12px] font-medium uppercase tracking-[0.18em] text-sky-300">
                Model Context Protocol
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Votre IA pilote vos devis.
              </h2>
              <p className="mt-4 max-w-lg text-[16px] leading-7 text-white/65 sm:text-[17px]">
                QuoteBuilder expose un serveur MCP. Claude, ChatGPT, Cursor ou Codex lisent votre
                pipeline, créent des demandes et déclenchent les relances. Avec les droits de votre
                espace, révocables à tout moment.
              </p>
            </Reveal>
            <Reveal delay={120}>
              <div className="mt-7 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-1.5 pl-4">
                <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-white/85">
                  {MCP_URL}
                </code>
                <CopyButton text={MCP_URL} label="Copier l’URL" />
              </div>
              <p className="mt-2 text-xs text-white/40">
                OAuth 2.1 pour ChatGPT et Claude, ou clé <span className="font-mono">qb_live_…</span>{" "}
                dans Paramètres → API & webhooks.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <div className="mt-8 flex flex-wrap gap-1.5">
                {MCP_TOOLS.map((t) => (
                  <span
                    key={t}
                    className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[11px] text-white/60 transition hover:border-sky-300/40 hover:text-sky-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <Link
                href="/fonctionnalites/mcp"
                className="mt-8 inline-flex text-sm font-semibold text-white underline-offset-4 hover:underline"
              >
                Tout sur les agents et le MCP →
              </Link>
            </Reveal>
          </div>
          <Reveal delay={150}>
            <McpShowcase />
          </Reveal>
        </div>
      </section>

      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-mk-accent">La chaîne</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Offre → funnel → dossier → autopilote.
            </h2>
            <p className="mt-3 text-[16px] leading-7 text-mk-muted">
              La même séquence que dans le logiciel. En quelques secondes.
            </p>
          </div>
          <div className="mt-10">
            <SystemCinema />
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/comment-ca-marche"
              className="text-sm font-semibold text-mk-ink underline-offset-4 hover:underline"
            >
              Voir comment ça marche en détail →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-mk-dark px-6 py-16 text-mk-on-dark sm:py-24">
        <div className="mx-auto max-w-6xl">
          <AutopilotStage />
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/fonctionnalites/autopilote"
              className="rounded-full bg-mk-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-mk-accent-hover"
            >
              Zoom autopilote
            </Link>
            <Link
              href="/fonctionnalites"
              className="text-sm font-medium text-mk-on-dark/65 underline-offset-4 hover:text-white hover:underline"
            >
              Toutes les fonctionnalités
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-mk-accent">Plateforme</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Dix modules. Un système.
            </h2>
            <p className="mt-3 text-[16px] leading-7 text-mk-muted">
              Acquisition, pilotage, organisation. Tout relié au même dossier.
            </p>
          </div>
          <div className="mt-12 space-y-10">
            {FEATURE_MENU_GROUPS.map((group) => (
              <div key={group.id}>
                <div className="mb-4 flex items-end justify-between gap-3 border-b border-mk-border pb-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mk-accent">
                      {group.label}
                    </p>
                    <p className="mt-1 text-sm text-mk-muted">{group.blurb}</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((item, i) => (
                    <Reveal key={item.slug} delay={i * 70}>
                    <Link
                      href={`/fonctionnalites/${item.slug}`}
                      className="group block h-full rounded-xl bg-mk-surface p-4 ring-1 ring-mk-border transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-28px_rgba(11,13,18,0.2)] sm:p-5"
                    >
                      <h3 className="text-[15px] font-semibold tracking-tight group-hover:text-mk-accent">
                        {item.menuLabel}
                      </h3>
                      <p className="mt-1.5 text-[13px] leading-5 text-mk-muted">{item.menuBlurb}</p>
                    </Link>
                    </Reveal>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-mk-border bg-mk-band px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-mk-accent">Secteurs</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Votre métier. Votre offre.
            </h2>
            <p className="mt-3 text-[16px] leading-7 text-mk-muted">
              Le funnel s’appuie sur ce que vous livrez vraiment. Pas un formulaire générique.
            </p>
          </div>
          <div className="mt-10">
            <LandingSectors />
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/secteurs"
              className="text-sm font-semibold text-mk-ink underline-offset-4 hover:underline"
            >
              Voir tous les secteurs →
            </Link>
          </div>
        </div>
      </section>

      <MarketingCta
        title="Mettez vos devis en pilote automatique."
        text="Un agent pour le prospect. Un autopilote pour les relances. Votre IA aux commandes. Free sans carte."
      />
    </>
  );
}
