import Link from "next/link";
import type { Config } from "@puckeditor/core";
import type { CSSProperties, ReactNode } from "react";
import { ProductCard } from "@/components/storefront/product-card";
import type { StorefrontModel } from "@/lib/shops/types";
import { groupProductsByCategory } from "@/lib/catalog/group";
import { ColorField, CompactTextField, SpacingField } from "@/lib/shops/inspector-fields";
import type { BoxStyleInput } from "@/lib/shops/layout";
import { resolveShopHref } from "@/lib/shops/href";
import {
  cx,
  heroPadClass,
  renderBoxStyle,
  sectionPadClass,
  SHOP_BODY,
  SHOP_CARD,
  SHOP_CTA,
  SHOP_CTA_SECONDARY,
  SHOP_HEADING,
} from "@/lib/shops/storefront-style";
import { categoryPath } from "@/lib/shops/urls";

type PuckMeta = {
  model?: StorefrontModel;
  categoryFilter?: string;
};

type PuckBag = {
  isEditing?: boolean;
  metadata?: PuckMeta;
};

const MAX_WIDTH: Record<string, string> = {
  full: "100%",
  "6xl": "72rem",
  "3xl": "48rem",
};

const boxFields = {
  padding: { type: "custom" as const, label: "Padding", render: SpacingField },
  margin: { type: "custom" as const, label: "Marge", render: SpacingField },
  background: { type: "custom" as const, label: "Fond", render: ColorField },
  color: { type: "custom" as const, label: "Couleur", render: ColorField },
  fontSize: { type: "custom" as const, label: "Taille du texte", placeholder: "16px", render: CompactTextField },
  fontWeight: { type: "custom" as const, label: "Graisse", placeholder: "600", render: CompactTextField },
  textAlign: {
    type: "select" as const,
    label: "Alignement",
    options: [
      { label: "Gauche", value: "left" },
      { label: "Centre", value: "center" },
      { label: "Droite", value: "right" },
    ],
  },
  position: {
    type: "select" as const,
    label: "Position",
    options: [
      { label: "Normal", value: "static" },
      { label: "Relative", value: "relative" },
      { label: "Absolute", value: "absolute" },
    ],
  },
  top: { type: "custom" as const, label: "Top", placeholder: "0", render: CompactTextField },
  left: { type: "custom" as const, label: "Left", placeholder: "0", render: CompactTextField },
  zIndex: { type: "custom" as const, label: "Z-index", placeholder: "1", render: CompactTextField },
  borderRadius: { type: "custom" as const, label: "Arrondi", placeholder: "8px", render: CompactTextField },
  minHeight: { type: "custom" as const, label: "Hauteur min", placeholder: "auto", render: CompactTextField },
};

function styleOf(props: BoxStyleInput, extra?: CSSProperties, puck?: PuckBag): CSSProperties {
  return renderBoxStyle(props, extra, { sanitize: !puck?.isEditing });
}

function modelOf(puck?: PuckBag): StorefrontModel | null {
  return puck?.metadata?.model ?? null;
}

function ShopLink({
  href,
  editing,
  model,
  className,
  style,
  children,
}: {
  href: string;
  editing?: boolean;
  model: StorefrontModel | null;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const resolved = model
    ? resolveShopHref(href || "/devis", {
        orgSlug: model.orgSlug,
        shopSlug: model.shopSlug,
        funnelSlug: model.funnelSlug,
      })
    : href || "#";
  if (editing) {
    return (
      <span className={className} style={style}>
        {children}
      </span>
    );
  }
  return (
    <Link href={resolved} className={className} style={style}>
      {children}
    </Link>
  );
}

function ShopSection({
  box,
  puck,
  className,
  extraStyle,
  maxWidth = "6xl",
  children,
}: {
  box: BoxStyleInput;
  puck?: PuckBag;
  className?: string;
  extraStyle?: CSSProperties;
  maxWidth?: string;
  children: ReactNode;
}) {
  return (
    <section className={cx(sectionPadClass(box.padding), className)} style={styleOf(box, extraStyle, puck)}>
      <div className="mx-auto w-full px-4 lg:px-6" style={{ maxWidth: MAX_WIDTH[maxWidth] || maxWidth || MAX_WIDTH["6xl"] }}>
        {children}
      </div>
    </section>
  );
}

function columnsClass(count: number) {
  if (count >= 4) return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
  if (count === 3) return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  return "grid grid-cols-1 sm:grid-cols-2";
}

function emptyHint(text: string) {
  return (
    <p className="mt-8 rounded-2xl border border-dashed border-black/15 px-6 py-10 text-sm text-[color-mix(in_srgb,var(--shop-text)_62%,var(--shop-bg))]">
      {text}
    </p>
  );
}

export const shopPuckConfig = {
  categories: {
    layout: { title: "Disposition", defaultExpanded: true, components: ["Section", "Columns"] },
    content: { title: "Contenu", defaultExpanded: true, components: ["Heading", "Text", "Image", "Button", "Hero"] },
    shop: {
      title: "Boutique",
      defaultExpanded: true,
      components: ["Catalog", "Categories", "QuoteCta", "Faq", "Features", "Legal"],
    },
  },
  components: {
    Section: {
      label: "Section",
      fields: {
        children: { type: "slot" },
        maxWidth: {
          type: "select",
          label: "Largeur",
          options: [
            { label: "Pleine page", value: "full" },
            { label: "Standard", value: "6xl" },
            { label: "Étroit", value: "3xl" },
          ],
        },
        ...boxFields,
      },
      defaultProps: { children: [], maxWidth: "6xl", padding: "64px 0", position: "static" },
      render: ({
        children: Children,
        maxWidth,
        puck,
        ...box
      }: BoxStyleInput & { children: (props?: { className?: string }) => ReactNode; maxWidth?: string; puck?: PuckBag }) => (
        <ShopSection box={box} puck={puck} maxWidth={maxWidth || "6xl"}>
          <Children className="flex flex-col gap-5 md:gap-6" />
        </ShopSection>
      ),
    },
    Columns: {
      label: "Colonnes",
      fields: {
        count: {
          type: "radio",
          label: "Nombre",
          options: [
            { label: "2", value: "2" },
            { label: "3", value: "3" },
            { label: "4", value: "4" },
          ],
        },
        gap: { type: "text", label: "Gutter" },
        col1: { type: "slot" },
        col2: { type: "slot" },
        col3: { type: "slot" },
        col4: { type: "slot" },
        ...boxFields,
      },
      defaultProps: {
        count: "2",
        gap: "24px",
        col1: [],
        col2: [],
        col3: [],
        col4: [],
        position: "static",
      },
      render: ({
        count,
        gap,
        col1: Col1,
        col2: Col2,
        col3: Col3,
        col4: Col4,
        puck,
        ...box
      }: BoxStyleInput & {
        count?: string;
        gap?: string;
        col1: (props?: { className?: string }) => ReactNode;
        col2: (props?: { className?: string }) => ReactNode;
        col3: (props?: { className?: string }) => ReactNode;
        col4: (props?: { className?: string }) => ReactNode;
        puck?: PuckBag;
      }) => {
        const n = Number(count || 2);
        const cols = [Col1, Col2, Col3, Col4].slice(0, n);
        return (
          <div className={columnsClass(n)} style={styleOf(box, { gap: gap || "24px" }, puck)}>
            {cols.map((Col, index) => (
              <div key={index} className="min-w-0">
                <Col className="flex flex-col gap-4" />
              </div>
            ))}
          </div>
        );
      },
    },
    Heading: {
      label: "Titre",
      fields: {
        text: { type: "text", label: "Texte" },
        level: {
          type: "select",
          label: "Niveau",
          options: [
            { label: "H1", value: "h1" },
            { label: "H2", value: "h2" },
            { label: "H3", value: "h3" },
          ],
        },
        ...boxFields,
      },
      defaultProps: { text: "Titre", level: "h2", position: "static" },
      render: ({ text, level, puck, ...box }: BoxStyleInput & { text?: string; level?: string; puck?: PuckBag }) => {
        const Tag = (level === "h1" || level === "h3" ? level : "h2") as "h1" | "h2" | "h3";
        return (
          <Tag className={SHOP_HEADING[Tag]} style={styleOf(box, undefined, puck)}>
            {text || "Titre"}
          </Tag>
        );
      },
    },
    Text: {
      label: "Texte",
      fields: {
        text: { type: "textarea", label: "Texte" },
        ...boxFields,
      },
      defaultProps: { text: "Présentez votre savoir-faire.", position: "static" },
      render: ({ text, puck, ...box }: BoxStyleInput & { text?: string; puck?: PuckBag }) => (
        <p className={cx(SHOP_BODY, "whitespace-pre-wrap")} style={styleOf(box, undefined, puck)}>
          {text}
        </p>
      ),
    },
    Image: {
      label: "Image",
      fields: {
        image: { type: "text", label: "Image (URL)" },
        imageAlt: { type: "text", label: "Texte alternatif" },
        ...boxFields,
      },
      defaultProps: { image: "", imageAlt: "", position: "static" },
      render: ({ image, imageAlt, puck, ...box }: BoxStyleInput & { image?: string; imageAlt?: string; puck?: PuckBag }) =>
        image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={imageAlt || ""} className="w-full rounded-2xl object-cover" style={styleOf(box, undefined, puck)} />
        ) : (
          <div
            className="flex min-h-48 items-center justify-center rounded-2xl bg-black/5 text-sm opacity-60"
            style={styleOf(box, undefined, puck)}
          >
            Image
          </div>
        ),
    },
    Button: {
      label: "Bouton",
      fields: {
        label: { type: "text", label: "Libellé" },
        href: { type: "text", label: "Lien (/devis, /catalogue…)" },
        ...boxFields,
      },
      defaultProps: { label: "Demander un devis", href: "/devis", position: "static" },
      render: ({
        label,
        href,
        puck,
        ...box
      }: BoxStyleInput & { label?: string; href?: string; puck?: PuckBag }) => {
        const model = modelOf(puck);
        return (
          <ShopLink
            href={href || "/devis"}
            editing={puck?.isEditing}
            model={model}
            className={cx(SHOP_CTA, "w-fit")}
            style={styleOf(box, { background: model?.theme.accent || "#E85D04" }, puck)}
          >
            {label || "Demander un devis"}
          </ShopLink>
        );
      },
    },
    Hero: {
      label: "Bandeau",
      fields: {
        heading: { type: "text", label: "Titre" },
        sub: { type: "textarea", label: "Chapô" },
        ctaLabel: { type: "text", label: "Bouton" },
        image: { type: "text", label: "Image (URL)" },
        imageAlt: { type: "text", label: "Texte alternatif" },
        ...boxFields,
      },
      defaultProps: {
        heading: "Équipez votre projet",
        sub: "Catalogue, catégories et demande de devis — sans paiement en ligne.",
        ctaLabel: "Demander un devis",
        image: "",
        imageAlt: "",
        padding: "80px 0",
        position: "static",
      },
      render: ({
        heading,
        sub,
        ctaLabel,
        image,
        imageAlt,
        puck,
        ...box
      }: BoxStyleInput & {
        heading?: string;
        sub?: string;
        ctaLabel?: string;
        image?: string;
        imageAlt?: string;
        puck?: PuckBag;
      }) => {
        const model = modelOf(puck);
        const accent = model?.theme.accent || "#E85D04";
        const wash = box.background
          ? undefined
          : {
              background: `linear-gradient(165deg, color-mix(in srgb, ${accent} 16%, var(--shop-bg)) 0%, var(--shop-bg) 62%)`,
            };
        return (
          <section className={cx("border-b border-black/10", heroPadClass(box.padding))} style={styleOf(box, wash, puck)}>
            <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 lg:grid-cols-2 lg:px-6">
              <div className={image ? "" : "lg:col-span-2 lg:max-w-3xl"}>
                <h1 className={SHOP_HEADING.h1}>{heading || model?.shopName}</h1>
                {sub ? <p className={cx(SHOP_BODY, "mt-5 text-lg")}>{sub}</p> : null}
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <ShopLink
                    href="/devis"
                    editing={puck?.isEditing}
                    model={model}
                    className={SHOP_CTA}
                    style={{ background: accent }}
                  >
                    {ctaLabel || "Demander un devis"}
                  </ShopLink>
                  <ShopLink href="/catalogue" editing={puck?.isEditing} model={model} className={SHOP_CTA_SECONDARY}>
                    Voir le catalogue
                  </ShopLink>
                </div>
              </div>
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt={imageAlt || heading || ""} className="aspect-[4/3] w-full rounded-2xl object-cover shadow-sm" />
              ) : null}
            </div>
          </section>
        );
      },
    },
    Catalog: {
      label: "Grille produits",
      fields: {
        heading: { type: "text", label: "Titre" },
        category: { type: "text", label: "Catégorie (vide = tout)" },
        limit: { type: "number", label: "Nombre max", min: 1, max: 48 },
        ...boxFields,
      },
      defaultProps: { heading: "Catalogue", category: "", limit: 12, padding: "64px 0", position: "static" },
      render: ({
        heading,
        category,
        limit,
        puck,
        ...box
      }: BoxStyleInput & { heading?: string; category?: string; limit?: number; puck?: PuckBag }) => {
        const model = modelOf(puck);
        const products = model?.products ?? [];
        const wanted = puck?.metadata?.categoryFilter || category || "";
        const listed = wanted ? products.filter((product) => (product.category || "Autres") === wanted) : products;
        const sliced = listed.slice(0, Number(limit) || 12);
        return (
          <ShopSection box={box} puck={puck}>
            {heading ? <h2 className={SHOP_HEADING.h2}>{heading}</h2> : null}
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sliced.map((product) => (
                <li key={product.id}>
                  <ProductCard
                    orgSlug={model?.orgSlug || ""}
                    shopSlug={model?.shopSlug || ""}
                    product={product}
                    editing={puck?.isEditing}
                  />
                </li>
              ))}
            </ul>
            {!sliced.length ? emptyHint("Aucun produit dans ce rayon pour l’instant.") : null}
          </ShopSection>
        );
      },
    },
    Categories: {
      label: "Menu catégories",
      fields: {
        heading: { type: "text", label: "Titre" },
        ...boxFields,
      },
      defaultProps: { heading: "Rayons", padding: "64px 0", position: "static" },
      render: ({ heading, puck, ...box }: BoxStyleInput & { heading?: string; puck?: PuckBag }) => {
        const model = modelOf(puck);
        const groups = groupProductsByCategory(model?.products ?? []);
        return (
          <ShopSection box={box} puck={puck}>
            {heading ? <h2 className={SHOP_HEADING.h2}>{heading}</h2> : null}
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => {
                const card = (
                  <>
                    <span className="font-semibold tracking-tight">{group.label}</span>
                    <span className="mt-2 block text-sm text-[color-mix(in_srgb,var(--shop-text)_62%,var(--shop-bg))]">
                      {group.products.length} produit{group.products.length > 1 ? "s" : ""}
                    </span>
                  </>
                );
                return (
                  <li key={group.key}>
                    {puck?.isEditing ? (
                      <div className={cx(SHOP_CARD, "px-6 py-6")}>{card}</div>
                    ) : (
                      <Link
                        href={`/b/${model?.orgSlug}/${model?.shopSlug}${categoryPath(group.label)}`}
                        className={cx(SHOP_CARD, "block px-6 py-6 transition hover:-translate-y-0.5 hover:shadow-md")}
                      >
                        {card}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
            {!groups.length ? emptyHint("Le catalogue se remplira depuis QuoteBuilder.") : null}
          </ShopSection>
        );
      },
    },
    QuoteCta: {
      label: "Demande de devis",
      fields: {
        heading: { type: "text", label: "Titre" },
        text: { type: "textarea", label: "Texte" },
        ctaLabel: { type: "text", label: "Bouton" },
        ...boxFields,
      },
      defaultProps: {
        heading: "Un projet sur mesure ?",
        text: "Décrivez le besoin : nous chiffrons à partir du catalogue.",
        ctaLabel: "Ouvrir le devis",
        padding: "64px 0",
        position: "static",
      },
      render: ({
        heading,
        text,
        ctaLabel,
        puck,
        ...box
      }: BoxStyleInput & { heading?: string; text?: string; ctaLabel?: string; puck?: PuckBag }) => {
        const model = modelOf(puck);
        const accent = model?.theme.accent || "#E85D04";
        return (
          <ShopSection
            box={box}
            puck={puck}
            className="border-y border-black/10"
            extraStyle={{ background: box.background || `${accent}14` }}
          >
            <div className="max-w-2xl">
              <h2 className={SHOP_HEADING.h2}>{heading || "Demander un devis"}</h2>
              {text ? <p className={cx(SHOP_BODY, "mt-4")}>{text}</p> : null}
              <ShopLink
                href="/devis"
                editing={puck?.isEditing}
                model={model}
                className={cx(SHOP_CTA, "mt-8")}
                style={{ background: accent }}
              >
                {ctaLabel || "Ouvrir le devis"}
              </ShopLink>
            </div>
          </ShopSection>
        );
      },
    },
    Faq: {
      label: "Questions fréquentes",
      fields: {
        heading: { type: "text", label: "Titre" },
        faq: {
          type: "array",
          label: "Questions",
          getItemSummary: (item: { q?: string }) => item.q || "Question",
          defaultItemProps: { q: "Nouvelle question", a: "" },
          arrayFields: {
            q: { type: "text", label: "Question" },
            a: { type: "textarea", label: "Réponse" },
          },
        },
        ...boxFields,
      },
      defaultProps: { heading: "Questions fréquentes", faq: [], padding: "64px 0", position: "static" },
      render: ({
        heading,
        faq,
        puck,
        ...box
      }: BoxStyleInput & { heading?: string; faq?: { q?: string; a?: string }[]; puck?: PuckBag }) => (
        <ShopSection box={box} puck={puck}>
          {heading ? <h2 className={SHOP_HEADING.h2}>{heading}</h2> : null}
          <dl className="mt-8 max-w-3xl divide-y divide-black/10">
            {(faq ?? []).map((item) => (
              <div key={item.q} className="py-5 first:pt-0">
                <dt className="text-base font-semibold">{item.q}</dt>
                <dd className={cx(SHOP_BODY, "mt-2")}>{item.a}</dd>
              </div>
            ))}
          </dl>
        </ShopSection>
      ),
    },
    Features: {
      label: "Points forts",
      fields: {
        heading: { type: "text", label: "Titre" },
        features: {
          type: "array",
          label: "Points",
          getItemSummary: (item: { title?: string }) => item.title || "Point",
          defaultItemProps: { title: "Point fort", text: "" },
          arrayFields: {
            title: { type: "text", label: "Titre" },
            text: { type: "textarea", label: "Texte" },
          },
        },
        ...boxFields,
      },
      defaultProps: { heading: "Pourquoi cette vitrine", features: [], padding: "64px 0", position: "static" },
      render: ({
        heading,
        features,
        puck,
        ...box
      }: BoxStyleInput & { heading?: string; features?: { title?: string; text?: string }[]; puck?: PuckBag }) => (
        <ShopSection box={box} puck={puck}>
          {heading ? <h2 className={SHOP_HEADING.h2}>{heading}</h2> : null}
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(features ?? []).map((item) => (
              <li key={item.title} className={cx(SHOP_CARD, "px-6 py-6")}>
                <p className="font-semibold tracking-tight">{item.title}</p>
                <p className={cx(SHOP_BODY, "mt-2")}>{item.text}</p>
              </li>
            ))}
          </ul>
        </ShopSection>
      ),
    },
    Legal: {
      label: "Texte légal",
      fields: {
        heading: { type: "text", label: "Titre" },
        text: { type: "textarea", label: "Texte" },
        ...boxFields,
      },
      defaultProps: { heading: "Mentions légales", text: "", padding: "64px 0", position: "static" },
      render: ({ heading, text, puck, ...box }: BoxStyleInput & { heading?: string; text?: string; puck?: PuckBag }) => (
        <ShopSection box={box} puck={puck} maxWidth="3xl">
          <h1 className={SHOP_HEADING.h1}>{heading}</h1>
          <div className={cx(SHOP_BODY, "mt-6 whitespace-pre-wrap")}>{text}</div>
        </ShopSection>
      ),
    },
  },
} as unknown as Config;
