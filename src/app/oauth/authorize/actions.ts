"use server";

import { redirect } from "next/navigation";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import {
  authorizationRedirect,
  clientAllowsRedirect,
  issueAuthorizationCode,
  resolveOAuthClient,
} from "@/lib/mcp/oauth";
import { isAllowedRedirectUri } from "@/lib/mcp/cimd";

export async function approveMcpOAuth(formData: FormData) {
  const ctx = await getOrgContext();
  const clientId = String(formData.get("client_id") ?? "");
  const redirectUri = String(formData.get("redirect_uri") ?? "");
  const state = String(formData.get("state") ?? "") || null;
  const codeChallenge = String(formData.get("code_challenge") ?? "");
  const resource = String(formData.get("resource") ?? "") || null;
  const decision = String(formData.get("decision") ?? "");

  if (!isAllowedRedirectUri(redirectUri)) {
    redirect("/oauth/authorize?error=invalid_request");
  }

  if (!ctx) {
    redirect(`/login?next=${encodeURIComponent(`/oauth/authorize?${new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      ...(state ? { state } : {}),
      ...(resource ? { resource } : {}),
    }).toString()}`)}`);
  }

  if (decision !== "allow") {
    redirect(authorizationRedirect(redirectUri, { error: "access_denied", state }));
  }

  if (!isAdminRole(ctx.role)) {
    redirect(authorizationRedirect(redirectUri, { error: "access_denied", state }));
  }

  const client = await resolveOAuthClient(clientId);
  if (!client || !clientAllowsRedirect(client, redirectUri) || !codeChallenge) {
    redirect(authorizationRedirect(redirectUri, { error: "invalid_request", state }));
  }

  const code = await issueAuthorizationCode({
    clientId,
    organizationId: ctx.organization.id,
    userId: ctx.userId,
    redirectUri,
    codeChallenge,
    resource,
  });

  redirect(authorizationRedirect(redirectUri, { code, state }));
}
