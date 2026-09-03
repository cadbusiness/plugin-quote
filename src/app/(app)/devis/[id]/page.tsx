import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/org";
import { loadQuoteDetail } from "@/lib/crm/quote-detail";
import { QuoteDetailView } from "@/components/crm/quote-detail";
import { parseQuoteTab } from "@/components/crm/quote-tabs";

export default async function QuoteDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const detail = await loadQuoteDetail(supabase, ctx.organization.id, id);
  if (!detail) notFound();
  return <QuoteDetailView detail={detail} tab={parseQuoteTab(query.tab)} />;
}
