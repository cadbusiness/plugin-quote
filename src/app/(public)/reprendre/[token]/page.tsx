import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { ResumeClient } from "./resume-client";

export default async function ResumePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = createServiceClient();
  const { data: session } = await supabase
    .from("quote_sessions")
    .select("id, token, organization_id, configurator_id, submitted_quote_id")
    .eq("token", token)
    .maybeSingle();
  if (!session) redirect("/");
  const [{ data: org }, { data: cfg }] = await Promise.all([
    supabase.from("organizations").select("slug").eq("id", session.organization_id).maybeSingle(),
    supabase.from("configurators").select("slug").eq("id", session.configurator_id).maybeSingle(),
  ]);
  if (!org || !cfg) redirect("/");
  if (session.submitted_quote_id) {
    const { data: access } = await supabase
      .from("prospect_access")
      .select("token")
      .eq("quote_id", session.submitted_quote_id)
      .maybeSingle();
    redirect(access ? `/suivi/${access.token}` : "/");
  }
  return <ResumeClient orgSlug={org.slug} configuratorSlug={cfg.slug} sessionId={session.id} token={session.token} />;
}
