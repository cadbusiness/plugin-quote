"use client";

import Link from "next/link";
import { ArrowRight, Calendar, ChevronRight, ExternalLink } from "lucide-react";
import { Chip, statusTone } from "@/components/ui/chip";
import { IconWell, MEMBER_BLOCK_ICON, resourceIcon } from "@/components/members/member-icons";
import { resourcesOfKind } from "@/lib/members/blocks";
import { formatDate } from "@/lib/format";
import { clientQuoteStageLabel } from "@/lib/members/parse";
import { memberPagePath, memberSpaceBasePath } from "@/lib/members/urls";
import type { MemberBlock, MemberPageDraft, MemberQuoteCard, MemberResourceDraft, MemberTheme } from "@/lib/members/types";

export function MemberSpaceView({
  orgSlug,
  spaceSlug,
  name,
  theme,
  page,
  pages,
  resources,
  quotes,
  preview,
  selectedBlockId,
  onSelectPage,
  onSelectBlock,
  onOpenQuotes,
}: {
  orgSlug: string;
  spaceSlug: string;
  name: string;
  theme: MemberTheme;
  page: MemberPageDraft;
  pages: MemberPageDraft[];
  resources: MemberResourceDraft[];
  quotes: MemberQuoteCard[];
  preview?: boolean;
  selectedBlockId?: string | null;
  onSelectPage?: (id: string) => void;
  onSelectBlock?: (id: string) => void;
  onOpenQuotes?: () => void;
}) {
  const base = memberSpaceBasePath(orgSlug, spaceSlug);
  return (
    <div className="min-h-full" style={{ background: theme.background, color: theme.text }}>
      <header className="border-b px-4 py-3 lg:px-8" style={{ borderColor: `${theme.text}14` }}>
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold">{name}</p>
          <nav className="flex flex-wrap gap-1 text-sm">
            {pages.map((item) => {
              const href = `${base}${memberPagePath(item.slug)}`;
              const active = item.id === page.id;
              const className = `rounded-md px-2.5 py-1 ${active ? "font-medium text-white" : "hover:opacity-100 opacity-70"}`;
              const style = active ? { background: theme.accent } : undefined;
              if (preview && onSelectPage) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectPage(item.id)}
                    className={className}
                    style={style}
                  >
                    {item.title}
                  </button>
                );
              }
              if (preview) {
                return (
                  <span key={item.id} className={className} style={style}>
                    {item.title}
                  </span>
                );
              }
              return (
                <Link key={item.id} href={href} className={className} style={style}>
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
        <div className="space-y-10">
          {page.blocks.map((block) => (
            <div
              key={block.id}
              className={
                preview
                  ? `rounded-lg ${selectedBlockId === block.id ? "ring-2 ring-[#E85D04] ring-offset-4" : "hover:ring-1 hover:ring-slate-300"}`
                  : undefined
              }
              onClick={preview && onSelectBlock ? () => onSelectBlock(block.id) : undefined}
            >
              <MemberBlockView
                block={block}
                theme={theme}
                quotes={quotes}
                resources={resources}
                quotesHref={preview ? undefined : `${base}/devis`}
                onOpenQuotes={preview ? onOpenQuotes : undefined}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function MemberBlockView({
  block,
  theme,
  quotes,
  resources,
  quotesHref,
  onOpenQuotes,
}: {
  block: MemberBlock;
  theme: MemberTheme;
  quotes: MemberQuoteCard[];
  resources: MemberResourceDraft[];
  quotesHref?: string;
  onOpenQuotes?: () => void;
}) {
  if (block.type === "hero") {
    const ctaClass =
      "mt-6 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white";
    const ctaInner = (
      <>
        {block.ctaLabel}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </>
    );
    return (
      <section className="max-w-2xl p-1">
        <h1 className="text-3xl font-semibold tracking-tight">{block.heading || theme.welcomeHeading}</h1>
        <p className="mt-3 text-base leading-7 opacity-80">{block.sub || theme.welcomeSub}</p>
        {block.ctaLabel && quotesHref ? (
          <Link href={quotesHref} className={ctaClass} style={{ background: theme.accent }}>
            {ctaInner}
          </Link>
        ) : null}
        {block.ctaLabel && !quotesHref && onOpenQuotes ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onOpenQuotes();
            }}
            className={ctaClass}
            style={{ background: theme.accent }}
          >
            {ctaInner}
          </button>
        ) : null}
        {block.ctaLabel && !quotesHref && !onOpenQuotes ? (
          <span className={ctaClass} style={{ background: theme.accent }}>
            {ctaInner}
          </span>
        ) : null}
      </section>
    );
  }
  if (block.type === "text") {
    return (
      <section className="max-w-2xl">
        {block.heading ? <h2 className="text-lg font-semibold">{block.heading}</h2> : null}
        {block.text ? <p className="mt-2 text-sm leading-6 opacity-80 whitespace-pre-wrap">{block.text}</p> : null}
      </section>
    );
  }
  if (block.type === "quotes") {
    const HeadingIcon = MEMBER_BLOCK_ICON.quotes;
    return (
      <section>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <HeadingIcon className="h-5 w-5 opacity-70" aria-hidden />
          {block.heading || "Mes devis"}
        </h2>
        {quotes.length ? (
          <ul className="mt-4 space-y-2">
            {quotes.map((quote) => {
              const href = quote.suiviUrl;
              const inner = (
                <>
                  <IconWell icon={MEMBER_BLOCK_ICON.quotes} accent={theme.accent} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{quote.contactCompany || quote.contactName}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs opacity-60">
                      <Calendar className="h-3 w-3" aria-hidden />
                      {formatDate(quote.createdAt)}
                    </p>
                  </div>
                  <Chip tone={statusTone(quote.statusSlug)}>
                    {quote.statusLabel || clientQuoteStageLabel(quote.statusSlug)}
                  </Chip>
                  <ChevronRight className="h-4 w-4 shrink-0 opacity-40" aria-hidden />
                </>
              );
              const className =
                "flex w-full items-center gap-3 rounded-xl border bg-white px-3 py-3 text-left";
              const style = { borderColor: `${theme.text}14` };
              if (href) {
                return (
                  <li key={quote.id}>
                    <a href={href} className={`${className} transition-colors hover:border-slate-300`} style={style}>
                      {inner}
                    </a>
                  </li>
                );
              }
              return (
                <li key={quote.id} className={className} style={style}>
                  {inner}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 text-sm opacity-60">Aucune demande pour le moment.</p>
        )}
      </section>
    );
  }
  if (block.type === "documents") {
    return (
      <ResourceList
        heading={block.heading || "Documents"}
        headingType="documents"
        items={resourcesOfKind(resources, "document")}
        empty="Aucun document publié."
        accent={theme.accent}
      />
    );
  }
  if (block.type === "plugins") {
    return (
      <ResourceList
        heading={block.heading || "Plugins et liens"}
        headingType="plugins"
        items={resourcesOfKind(resources, "plugin")}
        empty="Aucun plugin publié."
        accent={theme.accent}
      />
    );
  }
  const LinksIcon = MEMBER_BLOCK_ICON.links;
  return (
    <section>
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <LinksIcon className="h-5 w-5 opacity-70" aria-hidden />
        {block.heading || "Liens"}
      </h2>
      <ul className="mt-3 space-y-2">
        {(block.links ?? []).map((item) => (
          <li key={`${item.href}-${item.label}`}>
            <a
              href={item.href}
              className="inline-flex items-center gap-2 text-sm font-medium"
              style={{ color: theme.accent }}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ResourceList({
  heading,
  headingType,
  items,
  empty,
  accent,
}: {
  heading: string;
  headingType: "documents" | "plugins";
  items: MemberResourceDraft[];
  empty: string;
  accent: string;
}) {
  const HeadingIcon = MEMBER_BLOCK_ICON[headingType];
  return (
    <section>
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <HeadingIcon className="h-5 w-5 opacity-70" aria-hidden />
        {heading}
      </h2>
      {items.length ? (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {items.map((item) => {
            const Icon = resourceIcon(item.kind);
            return (
              <li key={item.id} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <IconWell icon={Icon} accent={accent} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  {item.description ? <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p> : null}
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-sm font-medium"
                      style={{ color: accent }}
                    >
                      Ouvrir
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  ) : (
                    <p className="mt-3 text-xs text-slate-400">Lien à renseigner dans le constructeur</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 text-sm opacity-60">{empty}</p>
      )}
    </section>
  );
}
