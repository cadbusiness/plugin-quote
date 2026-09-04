import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/org";
import { markQuoteViewed } from "@/lib/crm/quotes";
import { loadQuoteDetail } from "@/lib/crm/quote-detail";
import { QuoteDetailView } from "@/components/crm/quote-detail";
import { parseQuoteCompose, parseQuoteTab } from "@/components/crm/quote-tabs";

export default async function QuoteDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; compose?: string }>;
}) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const detail = await loadQuoteDetail(supabase, ctx.organization.id, id);
  if (!detail) notFound();
  await markQuoteViewed(supabase, ctx.organization.id, id, detail.quote.extracted_params);
  return <QuoteDetailView detail={detail} tab={parseQuoteTab(query.tab)} compose={parseQuoteCompose(query.compose)} />;
}
