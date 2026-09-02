import { createHmac } from "crypto";
import { createServiceClient } from "@/lib/supabase/service";
import type { Json } from "@/lib/db/database.types";
import type { Tables } from "@/lib/db/database.types";

export async function dispatchQuoteWebhooks(input: {
  organizationId: string;
  quote: Tables<"quotes">;
  answers: Record<string, Json>;
  items: {
    name: string;
    quantity: number;
    product_id: string | null;
    options: Json;
    price_min: number | null;
    price_max: number | null;
  }[];
  files: Tables<"quote_files">[];
  suggestion: { id: string; name: string; headline: string | null } | null;
}) {
  const supabase = createServiceClient();
  const { data: hooks } = await supabase
    .from("webhooks")
    .select("*")
    .eq("organization_id", input.organizationId)
    .eq("is_active", true);

  if (!hooks?.length) return;

  const payload = {
    event: "quote.submitted",
    quote: input.quote,
    answers: input.answers,
    items: input.items,
    files: input.files.map((f) => ({
      id: f.id,
      fileName: f.file_name,
      storagePath: f.storage_path,
    })),
    suggestion: input.suggestion,
  };
  const body = JSON.stringify(payload);

  for (const hook of hooks) {
    const signature = createHmac("sha256", hook.secret).update(body).digest("hex");
    let status = "failed";
    let statusCode: number | null = null;
    let responseBody: string | null = null;
    let lastError: string | null = null;
    try {
      const res = await fetch(hook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-QuoteBuilder-Signature": signature,
        },
        body,
      });
      statusCode = res.status;
      responseBody = (await res.text()).slice(0, 2000);
      status = res.ok ? "success" : "failed";
    } catch (error) {
      lastError = error instanceof Error ? error.message : "unknown error";
    }

    await supabase.from("webhook_deliveries").insert({
      organization_id: input.organizationId,
      webhook_id: hook.id,
      quote_id: input.quote.id,
      status,
      status_code: statusCode,
      request_body: payload,
      response_body: responseBody,
      attempts: 1,
      last_error: lastError,
    });
  }
}
