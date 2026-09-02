import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/org";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const user = await getAuthUser();
  if (!user) redirect(`/login?next=/invite/${token}`);
  const supabase = await createClient();
  const { data: invite } = await supabase
    .from("memberships")
    .select("*")
    .eq("invite_token", token)
    .eq("status", "pending")
    .maybeSingle();
  if (!invite) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-slate-600">Invitation introuvable ou déjà utilisée.</p>
      </main>
    );
  }

  await supabase
    .from("memberships")
    .update({ user_id: user.id, status: "active", invite_token: null })
    .eq("id", invite.id);

  redirect("/devis");
}
