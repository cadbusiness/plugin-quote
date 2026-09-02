import { redirect } from "next/navigation";
import { getAuthUser, getOrgContext } from "@/lib/auth/org";
import { CreateSpaceForm, JoinSpaceForm } from "@/app/(public)/onboarding/onboarding-forms";
import { BrandLogo } from "@/components/brand/brand-logo";

export default async function OnboardingPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  const ctx = await getOrgContext();
  if (ctx) redirect("/devis");

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div>
          <div className="mb-6 w-48">
            <BrandLogo variant="lockup" priority />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Votre espace</h1>
          <p className="mt-1 text-sm text-slate-500">
            Créez l’espace de votre entreprise, ou rejoignez un espace encore vide.
          </p>
        </div>
        <CreateSpaceForm />
        <JoinSpaceForm />
      </div>
    </main>
  );
}
