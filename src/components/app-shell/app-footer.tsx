export function AppFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-2 text-center text-[11px] text-slate-400 lg:px-6">
      © {year} Vinci Liberta LTD · QuoteBuilder
    </footer>
  );
}
