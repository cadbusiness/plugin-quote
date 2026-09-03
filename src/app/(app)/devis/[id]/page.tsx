import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/org";
import { loadQuoteDetail } from "@/lib/crm/quote-detail";
import { QuoteDetailView } from "@/components/crm/quote-detail";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const { id } = await params;
  const supabase = await createClient();
  const detail = await loadQuoteDetail(supabase, ctx.organization.id, id);
  if (!detail) notFound();
  return <QuoteDetailView detail={detail} />;
}
