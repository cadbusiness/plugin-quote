import { NextResponse } from "next/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { googleAdsConfigured, oauthAuthorizeUrl, signOAuthState } from "@/lib/ads/google";
import { getAppUrl } from "@/lib/supabase/env";

export async function GET() {
  const origin = getAppUrl();
  const ctx = await getOrgContext();
  if (!ctx) return NextResponse.redirect(new URL("/onboarding", origin));
  if (!isAdminRole(ctx.role)) return NextResponse.redirect(new URL("/devis", origin));
  if (!googleAdsConfigured()) {
    return NextResponse.redirect(new URL("/acquisition?error=env", origin));
  }
  const state = signOAuthState({ orgId: ctx.organization.id, userId: ctx.userId, ts: Date.now() });
  return NextResponse.redirect(oauthAuthorizeUrl(state));
}
