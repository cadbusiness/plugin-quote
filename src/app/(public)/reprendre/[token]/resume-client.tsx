"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ResumeClient({
  orgSlug,
  configuratorSlug,
  sessionId,
  token,
}: {
  orgSlug: string;
  configuratorSlug: string;
  sessionId: string;
  token: string;
}) {
  const router = useRouter();
  useEffect(() => {
    localStorage.setItem(`qb-session:${orgSlug}:${configuratorSlug}`, JSON.stringify({ id: sessionId, token }));
    router.replace(`/c/${orgSlug}/${configuratorSlug}`);
  }, [orgSlug, configuratorSlug, sessionId, token, router]);
  return <p className="p-8 text-center text-slate-500">Reprise de votre configuration…</p>;
}
