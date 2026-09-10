import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/org";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const user = await getAuthUser();
  if (!user) redirect(`/login?next=/invite/${token}`);

  const email = (user.email ?? "").trim().toLowerCase();
  if (!email) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-slate-600">
          Votre compte n’a pas d’email. Connectez-vous avec l’adresse invitée.
        </p>
      </main>
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("accept_org_invite", { p_token: token });

  if (error) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4">
        <p className="max-w-md text-sm text-slate-600">
          Invitation introuvable, déjà utilisée, ou réservée à une autre adresse email ({email}).
        </p>
      </main>
    );
  }

  redirect("/devis");
}
