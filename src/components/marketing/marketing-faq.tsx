export type FaqItem = { q: string; a: string };

export function MarketingFaq({ items, title = "FAQ" }: { items: readonly FaqItem[]; title?: string }) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
      <div className="mt-6 divide-y divide-[#1A1510]/10 border-y border-[#1A1510]/10">
        {items.map((item) => (
          <details key={item.q} className="group py-3.5">
            <summary className="cursor-pointer list-none text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
              <span className="flex items-start justify-between gap-4">
                {item.q}
                <span className="mt-0.5 text-[#1A1510]/30 group-open:hidden">+</span>
                <span className="mt-0.5 hidden text-[#1A1510]/30 group-open:inline">–</span>
              </span>
            </summary>
            <p className="mt-2.5 text-[14px] leading-6 text-[#1A1510]/65">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
