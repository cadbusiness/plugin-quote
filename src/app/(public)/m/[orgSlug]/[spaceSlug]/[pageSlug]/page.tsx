import { MemberSpaceScreen } from "../space-screen";
import { memberSpaceMetadata } from "@/lib/members/public";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orgSlug: string; spaceSlug: string; pageSlug: string }>;
}) {
  const { orgSlug, spaceSlug, pageSlug } = await params;
  return memberSpaceMetadata(orgSlug, spaceSlug, pageSlug);
}

export default async function MemberSpaceInnerPage({
  params,
}: {
  params: Promise<{ orgSlug: string; spaceSlug: string; pageSlug: string }>;
}) {
  const { orgSlug, spaceSlug, pageSlug } = await params;
  return <MemberSpaceScreen orgSlug={orgSlug} spaceSlug={spaceSlug} pageSlug={pageSlug} />;
}
