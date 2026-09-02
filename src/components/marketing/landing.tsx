import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ProductWalkthrough } from "@/components/marketing/product-walkthrough";

const FAQ = [
  {
    q: "C’est un formulaire de devis ?",
    a: "Non. Un formulaire recueille un texte. QuoteBuilder fait configurer un devis à partir de vos produits : dimensions, options, quantités, règles. À la fin vous avez une demande que vous pouvez traiter, pas un mail à interpréter.",
  },
  {
    q: "Pourquoi insister sur le catalogue ?",
    a: "Parce qu’un devis « propre » sur des produits inventés ne sert à rien. Vous ne savez pas si vous pouvez le livrer, ni si le prospect est réellement qualifié. Tant que le devis n’est pas branché sur ce que vous vendez vraiment, la qualification est fausse.",
  },
  {
    q: "Page, wizard et chat, c’est trois outils ?",
    a: "C’est le même configurateur. Une page publique, un parcours à étapes, ou une conversation. Les produits, les règles et le brief qui arrive dans le pipeline sont les mêmes.",
  },
  {
    q: "Que se passe-t-il après la soumission ?",
    a: "La demande entre dans votre espace : score, statut, assignation, notes, historique. Vous pouvez relancer. L’outil ne s’arrête pas à « on a reçu quelque chose ».",
  },
];

export function Landing() {
  return (
    <div className="min-h-dvh bg-[#F6F0E8] text-[#1A1510]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <BrandLogo variant="wordmark" href="/" priority />
        <div className="flex items-center gap-3">
          <Link href="/c/quickly/rayonnage" className="hidden text-sm font-medium text-[#1A1510]/70 hover:text-[#1A1510] sm:inline">
            Voir une démo
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-[#1A1510] px-4 py-2 text-sm font-medium text-white hover:bg-black"
          >
            Connexion
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden px-6 pb-6 pt-10 sm:pt-14">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-[#F3B184]/45 blur-3xl sm:h-[26rem] sm:w-[26rem]"
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-[#C45C26]">Configurateur de devis B2B</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-[3.4rem] sm:leading-[1.08]">
            Vos clients configurent le devis. Vous le traitez.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#1A1510]/70">
            QuoteBuilder sert aux entreprises qui vendent des produits réels, souvent
            sur mesure : rayonnage, aménagement, équipement. Le prospect compose sa
            demande sur votre catalogue. L’équipe récupère un dossier, le suit, et
            relance. Ce n’est pas une boîte de réception habillée.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/c/quickly/rayonnage"
              className="rounded-full bg-[#E85D04] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d35400]"
            >
              Essayer le configurateur
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1A1510] shadow-sm ring-1 ring-black/5 hover:bg-[#FFF8F1]"
            >
              Ouvrir l’espace
            </Link>
          </div>
        </div>
        <div className="relative mx-auto mt-12 max-w-5xl px-0">
          <p className="mb-3 text-center text-sm text-[#1A1510]/50">
            Simulation — catalogue, configurateur client, puis le devis dans votre pipeline.
          </p>
          <ProductWalkthrough />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Le problème n’est pas « trop peu de devis ».
        </h2>
        <p className="mt-5 text-[17px] leading-8 text-[#1A1510]/75">
          La plupart des demandes arrivent en vrac : un mail, un formulaire, parfois
          une photo. Le commercial passe une heure à comprendre ce que le client
          veut, à vérifier si ça existe dans le catalogue, puis à rappeler pour
          les dimensions oubliées. Pendant ce temps le devis n’existe pas encore.
        </p>
        <p className="mt-4 text-[17px] leading-8 text-[#1A1510]/75">
          D’autres outils promettent un devis « parfait » en générant du texte.
          Si les produits ne sont pas les vôtres — enregistrés, avec options et
          règles — vous ne pouvez ni qualifier le client, ni lui fournir ce qu’il
          a « choisi ». C’est un exercice de style. QuoteBuilder part de l’inverse :
          d’abord le catalogue, ensuite le parcours.
        </p>
      </section>

      <section className="bg-white/70 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Tout part des produits que vous avez déjà.
          </h2>
          <p className="mt-5 text-[17px] leading-8 text-[#1A1510]/75">
            Vous enregistrez vos gammes, vos options, vos contraintes. Le
            configurateur ne laisse choisir que ce que vous savez produire ou
            commander. Quand une demande arrive, elle parle votre langage : le
            même SKU, les mêmes hauteurs, les mêmes finitions que dans l’atelier
            ou chez le fournisseur.
          </p>
          <p className="mt-4 text-[17px] leading-8 text-[#1A1510]/75">
            C’est ça qui change la qualification. Un prospect qui a configuré
            trois travées, un type de lisse et une charge, ce n’est pas « un
            contact chaud ». C’est quelqu’un dont le besoin est déjà assez précis
            pour être chiffré et discuté.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <h2 className="max-w-3xl text-2xl font-semibold tracking-tight sm:text-3xl">
          Un configurateur, trois façons de l’utiliser
        </h2>
        <p className="mt-4 max-w-3xl text-[17px] leading-8 text-[#1A1510]/75">
          Ce n’est pas trois produits. C’est le même moteur, ouvert autrement
          selon le site, le commercial, ou le niveau de cadrage du projet.
        </p>
        <div className="mt-10 space-y-10">
          <article className="grid gap-3 border-t border-[#1A1510]/10 pt-8 sm:grid-cols-[200px_1fr] sm:gap-10">
            <h3 className="text-lg font-semibold">Page de devis</h3>
            <p className="text-[17px] leading-8 text-[#1A1510]/75">
              Une adresse publique, ou un embed sur votre site. Le visiteur avance
              dans la configuration comme sur un configurateur auto : il choisit,
              ajuste, voit ce qui est possible. À la fin il laisse ses coordonnées.
              Vous récupérez le devis, pas un commentaire.
            </p>
          </article>
          <article className="grid gap-3 border-t border-[#1A1510]/10 pt-8 sm:grid-cols-[200px_1fr] sm:gap-10">
            <h3 className="text-lg font-semibold">Wizard</h3>
            <p className="text-[17px] leading-8 text-[#1A1510]/75">
              Un parcours à questions, dans l’ordre que vous décidez. Utile quand
              il faut cadrer le projet avant de parler produits : usage, lieu,
              contraintes. Chaque réponse oriente la suite. Le catalogue reste
              derrière, il n’est pas contourné.
            </p>
          </article>
          <article className="grid gap-3 border-t border-[#1A1510]/10 pt-8 sm:grid-cols-[200px_1fr] sm:gap-10">
            <h3 className="text-lg font-semibold">Chat</h3>
            <p className="text-[17px] leading-8 text-[#1A1510]/75">
              Même catalogue, en conversation. Quand le prospect ne sait pas par
              où commencer, le chat pose les questions et propose des produits
              possibles. Ça ne remplace pas le wizard : ça ouvre le devis pour
              ceux qui n’ont pas encore le vocabulaire.
            </p>
          </article>
        </div>
      </section>

      <section className="bg-[#1A1510] px-6 py-16 text-[#F6F0E8] sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Recevoir une demande ne suffit pas.
          </h2>
          <p className="mt-5 text-[17px] leading-8 text-[#F6F0E8]/75">
            Une fois le devis soumis, il faut le manager. Qui le prend ? Où ça en
            est ? Qu’est-ce qui a été dit au téléphone ? Est-ce qu’on a rappelé
            au bout de deux jours ? QuoteBuilder garde ça dans le même outil que
            le configurateur.
          </p>
          <p className="mt-4 text-[17px] leading-8 text-[#F6F0E8]/75">
            Vous voyez le pipeline : nouveau, contacté, en cours, gagné, perdu.
            Vous assignez un commercial, vous ajoutez une note, vous changez le
            statut. Les relances partent selon le délai que vous choisissez —
            confirmation tout de suite, rappel si personne n’a traité, suivi à
            J+1 ou J+3. Ce n’est pas du marketing de masse. C’est le suivi d’un
            devis déjà configuré.
          </p>
          <p className="mt-4 text-[17px] leading-8 text-[#F6F0E8]/75">
            L’équipe n’a pas besoin d’un second logiciel pour « le CRM ». Les
            demandes vivent ici, à côté des produits et du wizard.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Pour qui c’est fait
        </h2>
        <p className="mt-5 text-[17px] leading-8 text-[#1A1510]/75">
          Les équipes qui vendent des produits configurables, souvent B2B, souvent
          avec un commercial qui doit reprendre la main. Fabricants, distributeurs,
          installateurs. Ceux qui en ont assez des PDF envoyés à la main et des
          formulaires WordPress qui ne parlent pas au stock.
        </p>
        <p className="mt-4 text-[17px] leading-8 text-[#1A1510]/75">
          Ce n’est pas un site vitrine. Ce n’est pas un générateur de pages pour
          coachs. Si vous n’avez pas de catalogue à enregistrer, QuoteBuilder
          n’a rien à configurer.
        </p>
      </section>

      <section className="border-t border-[#1A1510]/10 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Questions fréquentes</h2>
          <dl className="mt-10 space-y-8">
            {FAQ.map((item) => (
              <div key={item.q}>
                <dt className="text-lg font-semibold">{item.q}</dt>
                <dd className="mt-2 text-[17px] leading-8 text-[#1A1510]/70">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl rounded-[28px] bg-[#E85D04] px-8 py-12 text-white sm:px-12">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Regardez un parcours, puis l’espace où on le traite.
          </h2>
          <p className="mt-4 max-w-xl text-[17px] leading-7 text-white/85">
            La démo publique montre le configurateur côté prospect. La connexion
            ouvre le pipeline : les demandes, les notes, les relances. Les deux
            font partie du même logiciel.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/c/quickly/rayonnage"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#E85D04] hover:bg-[#FFF4EC]"
            >
              Configurateur de démo
            </Link>
            <Link
              href="/login"
              className="rounded-full px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/40 hover:bg-white/10"
            >
              Connexion
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#1A1510]/10 px-6 py-8 text-sm text-[#1A1510]/45">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:justify-between">
          <p>QuoteBuilder</p>
          <p>Configurateur de devis + suivi des demandes</p>
        </div>
      </footer>
    </div>
  );
}
