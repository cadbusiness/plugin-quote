import Link from "next/link";

export function MarketingCta({
  title = "Bouchez le trou. Maintenant.",
  text = "Parcours pour le prospect. Autopilote pour vous. Free sans carte.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="px-6 pb-20 pt-8">
      <div className="mx-auto max-w-4xl rounded-2xl bg-mk-dark px-8 py-12 text-center text-mk-on-dark sm:px-16 sm:py-16">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-[16px] leading-7 text-mk-on-dark/65">{text}</p>
        <Link
          href="/signup"
          className="mt-8 inline-flex rounded-full bg-mk-accent px-6 py-3 text-sm font-semibold text-white hover:bg-mk-accent-hover"
        >
          Commencer gratuitement
        </Link>
      </div>
    </section>
  );
}
