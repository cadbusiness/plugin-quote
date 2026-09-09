import { redirect } from "next/navigation";
import { getAuthUser, getOrgContext } from "@/lib/auth/org";
import { CreateSpaceForm, JoinSpaceForm } from "@/app/(public)/onboarding/onboarding-forms";
import { BrandLogo } from "@/components/brand/brand-logo";
import { safeNextPath } from "@/lib/auth/next-path";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  const next = safeNextPath((await searchParams).next ?? null);
  const ctx = await getOrgContext();
  if (ctx) redirect(next || "/devis");

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div>
          <div className="mb-6 w-48">
            <BrandLogo variant="lockup" priority />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Votre espace</h1>
          <p className="mt-1 text-sm text-slate-500">
            {next
              ? "Créez l’espace de votre entreprise pour brancher WordPress et collecter les demandes."
              : "Créez l’espace de votre entreprise, ou rejoignez un espace encore vide."}
          </p>
        </div>
        <CreateSpaceForm next={next ?? ""} />
        <JoinSpaceForm next={next ?? ""} />
      </div>
    </main>
  );
}
