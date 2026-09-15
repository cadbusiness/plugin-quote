"use client";

import { useRouter } from "next/navigation";
import { MemberSpaceView } from "@/components/members/member-space-view";
import type { MemberPageDraft, MemberQuoteCard, MemberResourceDraft, MemberTheme } from "@/lib/members/types";

export function MemberSpacePortal({
  orgSlug,
  spaceSlug,
  name,
  theme,
  page,
  pages,
  resources,
  quotes,
  email,
}: {
  orgSlug: string;
  spaceSlug: string;
  name: string;
  theme: MemberTheme;
  page: MemberPageDraft;
  pages: MemberPageDraft[];
  resources: MemberResourceDraft[];
  quotes: MemberQuoteCard[];
  email: string;
}) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/public/membres/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="min-h-dvh">
      <div className="flex items-center justify-end gap-3 border-b border-slate-100 bg-white px-4 py-2 text-xs text-slate-500 lg:px-8">
        <span>{email}</span>
        <button type="button" onClick={() => void logout()} className="hover:text-slate-900">
          Se déconnecter
        </button>
      </div>
      <MemberSpaceView
        orgSlug={orgSlug}
        spaceSlug={spaceSlug}
        name={name}
        theme={theme}
        page={page}
        pages={pages}
        resources={resources}
        quotes={quotes}
      />
    </div>
  );
}
