import Link from "next/link";
import type { Config } from "@puckeditor/core";
import type { CSSProperties, ReactNode } from "react";
import { ProductCard } from "@/components/storefront/product-card";
import type { StorefrontModel } from "@/lib/shops/types";
import { groupProductsByCategory } from "@/lib/catalog/group";
import { ColorField, CompactTextField, SpacingField } from "@/lib/shops/inspector-fields";
import { boxStyle, type BoxStyleInput } from "@/lib/shops/layout";
import { resolveShopHref } from "@/lib/shops/href";
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

function styleOf(props: BoxStyleInput, extra?: CSSProperties): CSSProperties {
  return { ...boxStyle(props), ...extra };
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
      defaultProps: { children: [], maxWidth: "6xl", padding: "56px 24px", position: "static" },
      render: ({
        children: Children,
        maxWidth,
        puck,
        ...box
      }: BoxStyleInput & { children: (props?: object) => ReactNode; maxWidth?: string; puck?: PuckBag }) => (
        <section style={styleOf(box)}>
          <div className="mx-auto w-full px-4 lg:px-6" style={{ maxWidth: MAX_WIDTH[maxWidth || "6xl"] || maxWidth }}>
            <Children />
          </div>
        </section>
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
        gap: "16px",
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
        ...box
      }: BoxStyleInput & {
        count?: string;
        gap?: string;
        col1: (props?: object) => ReactNode;
        col2: (props?: object) => ReactNode;
        col3: (props?: object) => ReactNode;
        col4: (props?: object) => ReactNode;
      }) => {
        const n = Number(count || 2);
        const cols = [Col1, Col2, Col3, Col4].slice(0, n);
        return (
          <div
            style={{
              ...styleOf(box),
              display: "grid",
              gap: gap || "16px",
              gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
            }}
          >
            {cols.map((Col, index) => (
              <div key={index} className="min-w-0">
                <Col />
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
      render: ({ text, level, ...box }: BoxStyleInput & { text?: string; level?: string }) => {
        const Tag = (level === "h1" || level === "h3" ? level : "h2") as "h1" | "h2" | "h3";
        const size = Tag === "h1" ? "text-3xl lg:text-4xl" : Tag === "h3" ? "text-lg" : "text-xl";
        return (
          <Tag className={`font-semibold tracking-tight ${size}`} style={styleOf(box)}>
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
      render: ({ text, ...box }: BoxStyleInput & { text?: string }) => (
        <p className="max-w-3xl text-sm leading-7 opacity-80 whitespace-pre-wrap" style={styleOf(box)}>
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
      render: ({ image, imageAlt, ...box }: BoxStyleInput & { image?: string; imageAlt?: string }) =>
        image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={imageAlt || ""} className="w-full rounded-lg object-cover" style={styleOf(box)} />
        ) : (
          <div className="flex min-h-40 items-center justify-center rounded-lg bg-black/5 text-sm opacity-60" style={styleOf(box)}>
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
            className="inline-flex rounded-md px-4 py-2 text-sm font-medium text-white"
            style={styleOf(box, { background: model?.theme.accent || "#E85D04" })}
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
        padding: "56px 0",
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
        return (
          <section className="border-b border-black/10" style={styleOf(box)}>
            <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-2 lg:items-center lg:px-6">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">{heading || model?.shopName}</h1>
                {sub ? <p className="mt-4 max-w-xl text-base leading-7 opacity-80">{sub}</p> : null}
                <ShopLink
                  href="/devis"
                  editing={puck?.isEditing}
                  model={model}
                  className="mt-6 inline-flex rounded-md px-4 py-2 text-sm font-medium text-white"
                  style={{ background: model?.theme.accent || "#E85D04" }}
                >
                  {ctaLabel || "Demander un devis"}
                </ShopLink>
              </div>
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt={imageAlt || heading || ""} className="w-full rounded-lg object-cover" />
              ) : (
                <div className="min-h-48 rounded-lg bg-black/5" />
              )}
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
      defaultProps: { heading: "Catalogue", category: "", limit: 12, padding: "40px 0", position: "static" },
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
          <section className="mx-auto max-w-6xl px-4 lg:px-6" style={styleOf(box)}>
            {heading ? <h2 className="text-xl font-semibold">{heading}</h2> : null}
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            {!sliced.length ? <p className="mt-3 text-sm opacity-60">Aucun produit dans ce rayon pour l’instant.</p> : null}
          </section>
        );
      },
    },
    Categories: {
      label: "Menu catégories",
      fields: {
        heading: { type: "text", label: "Titre" },
        ...boxFields,
      },
      defaultProps: { heading: "Rayons", padding: "40px 0", position: "static" },
      render: ({ heading, puck, ...box }: BoxStyleInput & { heading?: string; puck?: PuckBag }) => {
        const model = modelOf(puck);
        const groups = groupProductsByCategory(model?.products ?? []);
        return (
          <section className="mx-auto max-w-6xl px-4 lg:px-6" style={styleOf(box)}>
            {heading ? <h2 className="text-xl font-semibold">{heading}</h2> : null}
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => (
                <li key={group.key}>
                  {puck?.isEditing ? (
                    <div className="block rounded-lg px-4 py-4 ring-1 ring-black/10">
                      <span className="font-medium">{group.label}</span>
                      <span className="mt-1 block text-xs opacity-60">
                        {group.products.length} produit{group.products.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  ) : (
                    <Link
                      href={`/b/${model?.orgSlug}/${model?.shopSlug}${categoryPath(group.label)}`}
                      className="block rounded-lg px-4 py-4 ring-1 ring-black/10 hover:bg-black/5"
                    >
                      <span className="font-medium">{group.label}</span>
                      <span className="mt-1 block text-xs opacity-60">
                        {group.products.length} produit{group.products.length > 1 ? "s" : ""}
                      </span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            {!groups.length ? <p className="mt-3 text-sm opacity-60">Le catalogue se remplira depuis QuoteBuilder.</p> : null}
          </section>
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
        padding: "48px 0",
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
          <section className="border-y border-black/10" style={styleOf(box, { background: `${accent}12` })}>
            <div className="mx-auto max-w-6xl px-4 lg:px-6">
              <h2 className="text-xl font-semibold">{heading || "Demander un devis"}</h2>
              {text ? <p className="mt-2 max-w-2xl text-sm leading-6 opacity-80">{text}</p> : null}
              <ShopLink
                href="/devis"
                editing={puck?.isEditing}
                model={model}
                className="mt-5 inline-flex rounded-md px-4 py-2 text-sm font-medium text-white"
                style={{ background: accent }}
              >
                {ctaLabel || "Ouvrir le devis"}
              </ShopLink>
            </div>
          </section>
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
      defaultProps: { heading: "Questions fréquentes", faq: [], padding: "40px 0", position: "static" },
      render: ({
        heading,
        faq,
        ...box
      }: BoxStyleInput & { heading?: string; faq?: { q?: string; a?: string }[] }) => (
        <section className="mx-auto max-w-6xl px-4 lg:px-6" style={styleOf(box)}>
          {heading ? <h2 className="text-xl font-semibold">{heading}</h2> : null}
          <dl className="mt-4 max-w-3xl divide-y divide-black/10">
            {(faq ?? []).map((item) => (
              <div key={item.q} className="py-4">
                <dt className="font-medium">{item.q}</dt>
                <dd className="mt-1 text-sm leading-6 opacity-80">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>
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
      defaultProps: { heading: "Pourquoi cette vitrine", features: [], padding: "40px 0", position: "static" },
      render: ({
        heading,
        features,
        ...box
      }: BoxStyleInput & { heading?: string; features?: { title?: string; text?: string }[] }) => (
        <section className="mx-auto max-w-6xl px-4 lg:px-6" style={styleOf(box)}>
          {heading ? <h2 className="text-xl font-semibold">{heading}</h2> : null}
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {(features ?? []).map((item) => (
              <li key={item.title} className="rounded-lg px-4 py-4 ring-1 ring-black/10">
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-sm leading-6 opacity-75">{item.text}</p>
              </li>
            ))}
          </ul>
        </section>
      ),
    },
    Legal: {
      label: "Texte légal",
      fields: {
        heading: { type: "text", label: "Titre" },
        text: { type: "textarea", label: "Texte" },
        ...boxFields,
      },
      defaultProps: { heading: "Mentions légales", text: "", padding: "48px 0", position: "static" },
      render: ({ heading, text, ...box }: BoxStyleInput & { heading?: string; text?: string }) => (
        <article className="mx-auto max-w-3xl px-4 lg:px-6" style={styleOf(box)}>
          <h1 className="text-3xl font-semibold tracking-tight">{heading}</h1>
          <div className="mt-6 whitespace-pre-wrap text-sm leading-7 opacity-85">{text}</div>
        </article>
      ),
    },
  },
} as unknown as Config;

