import type { Metadata } from "next";
import Link from "next/link";
import { VerificateurSignatureWebhookDevisCalculator } from "@/components/marketing/verificateur-signature-webhook-devis-calculator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Vérificateur de signature webhook (HMAC SHA-256)",
  description:
    "Collez le corps brut d'un webhook de demande de devis, votre secret et l'en-tête X-QuoteBuilder-Signature reçu. L'outil recalcule la signature HMAC SHA-256 dans votre navigateur, la compare, et explique les causes d'écart les plus courantes (JSON reformaté, espace en trop, préfixe). Rien n'est envoyé.",
  path: "/outils/verificateur-signature-webhook-devis",
});

const FAQ = [
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Le corps, le secret et l'en-tête restent dans votre navigateur. Le HMAC SHA-256 est calculé avec Web Crypto. Rien n'est envoyé.",
  },
  {
    q: "Quel en-tête QuoteBuilder envoie-t-il ?",
    a: "X-QuoteBuilder-Signature : 64 caractères hexadécimaux minuscules, HMAC SHA-256 du corps brut, sans préfixe sha256=.",
  },
  {
    q: "Pourquoi un JSON réindenté ne correspond-il pas ?",
    a: "La signature porte sur les octets reçus. Un outil qui réindente le JSON change le corps. Signez le corps brut, avant tout parsing.",
  },
  {
    q: "Un envoi en échec est-il renvoyé ?",
    a: "Non. Chaque webhook actif reçoit une seule tentative par demande. Un échec se rattrape ensuite par l'API.",
  },
];

export default function VerificateurSignatureWebhookDevisPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Vérificateur de signature webhook (HMAC SHA-256)",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Recalcule la signature HMAC SHA-256 d'un webhook de demande de devis à partir du corps brut et du secret, la compare à l'en-tête X-QuoteBuilder-Signature reçu et signale les causes d'écart courantes. Calcul local dans le navigateur.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/verificateur-signature-webhook-devis`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Vérificateur de signature webhook (HMAC SHA-256)
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Votre serveur reçoit les demandes de devis QuoteBuilder par webhook et la signature ne passe pas ? Collez le
            corps brut de la requête, le secret enregistré avec le webhook et la valeur de l&apos;en-tête{" "}
            <code>X-QuoteBuilder-Signature</code>. L&apos;outil recalcule la signature dans votre navigateur, la compare
            et cherche les causes d&apos;écart les plus courantes. Rien n&apos;est envoyé : utilisez quand même un secret
            de test.{" "}
            <Link
              href="/blog/webhook-demande-devis-crm-signature-hmac"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Webhook de demande de devis
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <VerificateurSignatureWebhookDevisCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Vérifier côté serveur</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Node.js (corps brut conservé, comparaison en temps constant) :
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-mk-dark p-4 text-[13px] leading-6 text-mk-on-dark">{`const crypto = require("crypto");

function signatureValide(corpsBrut, entete, secret) {
  const attendue = crypto.createHmac("sha256", secret).update(corpsBrut).digest("hex");
  const recue = String(entete || "").trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(recue)) return false;
  return crypto.timingSafeEqual(Buffer.from(attendue, "hex"), Buffer.from(recue, "hex"));
}
// corpsBrut : le Buffer ou la chaîne lue AVANT JSON.parse
// entete : req.headers["x-quotebuilder-signature"]`}</pre>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">PHP :</p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-mk-dark p-4 text-[13px] leading-6 text-mk-on-dark">{`$corpsBrut = file_get_contents('php://input');
$recue = strtolower(trim($_SERVER['HTTP_X_QUOTEBUILDER_SIGNATURE'] ?? ''));
$attendue = hash_hmac('sha256', $corpsBrut, $secret);
if (!hash_equals($attendue, $recue)) {
  http_response_code(401);
  exit;
}
$demande = json_decode($corpsBrut, true);`}</pre>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href="/signup?plan=free" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            compte Free
          </Link>
          {" · "}
          <Link
            href="/blog/webhook-demande-devis-crm-signature-hmac"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            webhook de demande de devis vers votre CRM
          </Link>
          {" · "}
          <Link
            href="/secteurs/funnel-devis-formation-professionnelle"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            funnel de devis formation professionnelle
          </Link>
          {" · "}
          <Link
            href="/blog/sources-demande-devis-b2b-funnel-api"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            sources d&apos;une demande : funnel, API, plugins
          </Link>
          {" · "}
          <Link
            href="/outils/estimateur-cout-double-saisie-devis"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            estimateur du coût de la double saisie
          </Link>
          {" · "}
          <Link
            href="/fonctionnalites/integrations"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            Intégrations
          </Link>
          {" · "}
          <Link href="/c/demo/rayonnage" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            démo rayonnage
          </Link>
          .
        </p>
      </section>

      <MarketingFaq items={FAQ} />
      <MarketingCta
        title="Brancher un webhook sur une demande réelle."
        text="Compte Free sans carte. Menu Support, API & webhooks, secret HMAC. La démo rayonnage montre un parcours public."
      />
    </>
  );
}
