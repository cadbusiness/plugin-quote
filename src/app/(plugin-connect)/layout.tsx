export default function PluginConnectLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#f8f5f1] text-slate-900">
      <header className="flex h-14 items-center gap-3 border-b border-[#efe7de] bg-white px-4">
        <span className="h-8 w-8 rounded-lg bg-[#E85D04]" aria-hidden="true" />
        <span className="text-sm font-semibold tracking-tight">QuoteBuilder</span>
      </header>
      <main className="mx-auto w-full max-w-lg px-4 py-10">{children}</main>
    </div>
  );
}
