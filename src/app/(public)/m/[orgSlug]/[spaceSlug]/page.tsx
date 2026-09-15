import { notFound, redirect } from "next/navigation";
import { MemberSpaceScreen } from "./space-screen";
import { loadPublicMemberSpace, memberSpaceMetadata } from "@/lib/members/public";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orgSlug: string; spaceSlug: string }>;
}) {
  const { orgSlug, spaceSlug } = await params;
  return memberSpaceMetadata(orgSlug, spaceSlug);
}

export default async function MemberSpaceHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string; spaceSlug: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { orgSlug, spaceSlug } = await params;
  const query = await searchParams;
  const space = await loadPublicMemberSpace(orgSlug, spaceSlug);
  if (!space) notFound();
  if (query.token) {
    redirect(
      `/api/public/membres/enter?org=${encodeURIComponent(orgSlug)}&space=${encodeURIComponent(spaceSlug)}&token=${encodeURIComponent(query.token)}`,
    );
  }
  return <MemberSpaceScreen orgSlug={orgSlug} spaceSlug={spaceSlug} pageSlug="accueil" />;
}
