import { notFound } from "next/navigation";
import { loadProspectByToken } from "@/lib/prospect/access";
import { publishedMemberSpaceUrl } from "@/lib/members/public";
import { createServiceClient } from "@/lib/supabase/service";
import { ProspectSpace } from "./prospect-space";

export default async function SuiviPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const bundle = await loadProspectByToken(token);
  if (!bundle) notFound();
  const memberSpaceUrl = await publishedMemberSpaceUrl(createServiceClient(), bundle.quote.organization_id);
  return <ProspectSpace token={token} bundle={bundle} memberSpaceUrl={memberSpaceUrl} />;
}
