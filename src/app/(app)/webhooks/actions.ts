"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { createOrgApiKey, revokeOrgApiKey } from "@/lib/api/keys";

const FLASH_COOKIE = "qb_api_key_flash";

export async function createApiKey(formData: FormData) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");

  const name = String(formData.get("name") ?? "").trim() || "MCP / Claude";
  const { token } = await createOrgApiKey({
    organizationId: ctx.organization.id,
    name,
    createdBy: ctx.userId,
  });

  const jar = await cookies();
  jar.set(FLASH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/webhooks",
    maxAge: 60,
  });

  revalidatePath("/webhooks");
  redirect("/webhooks");
}

export async function revokeApiKey(formData: FormData) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");

  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await revokeOrgApiKey(ctx.organization.id, id);
  revalidatePath("/webhooks");
}

export async function consumeApiKeyFlash(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(FLASH_COOKIE)?.value ?? null;
  if (token) {
    jar.set(FLASH_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/webhooks",
      maxAge: 0,
    });
  }
  return token;
}
