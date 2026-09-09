import { BrandLogo } from "@/components/brand/brand-logo";

export default function PluginConnectLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#f8f5f1] text-slate-900">
      <header className="flex h-14 items-center border-b border-[#efe7de] bg-white px-4">
        <BrandLogo variant="wordmark" href="/" priority />
      </header>
      <main className="mx-auto w-full max-w-lg px-4 py-10">{children}</main>
    </div>
  );
}
