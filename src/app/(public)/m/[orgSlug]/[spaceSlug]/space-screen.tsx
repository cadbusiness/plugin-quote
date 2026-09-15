import { notFound } from "next/navigation";
import { MemberSpaceLogin } from "@/components/members/member-space-login";
import { MemberSpacePortal } from "@/components/members/member-space-portal";
import { loadMemberQuotes } from "@/lib/members/quotes";
import { loadPublicMemberSpace } from "@/lib/members/public";
import { loadMemberSession } from "@/lib/members/session";

export async function MemberSpaceScreen({
  orgSlug,
  spaceSlug,
  pageSlug,
}: {
  orgSlug: string;
  spaceSlug: string;
  pageSlug: string;
}) {
  const space = await loadPublicMemberSpace(orgSlug, spaceSlug);
  if (!space) notFound();
  const page =
    space.pages.find((item) => item.slug === pageSlug) ??
    (pageSlug === "accueil" ? space.pages.find((item) => item.kind === "home") : null) ??
    space.pages[0];
  if (!page) notFound();

  const session = await loadMemberSession(space.spaceId);
  if (!session) {
    return (
      <MemberSpaceLogin
        orgName={space.orgName}
        spaceName={space.name}
        theme={space.theme}
        orgSlug={orgSlug}
        spaceSlug={spaceSlug}
      />
    );
  }

  const quotes = await loadMemberQuotes(space.organizationId, session.email);
  return (
    <MemberSpacePortal
      orgSlug={orgSlug}
      spaceSlug={spaceSlug}
      name={space.name}
      theme={space.theme}
      page={page}
      pages={space.pages}
      resources={space.resources}
      quotes={quotes}
      email={session.email}
    />
  );
}
