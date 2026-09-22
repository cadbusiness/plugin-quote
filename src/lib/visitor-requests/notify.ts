import { Resend } from "resend";
import { salesRecipientDecision } from "@/lib/visitor-requests/brief";
import type { SalesNotice } from "@/lib/visitor-requests/types";

/** Sales inbox only. The prospect is never a recipient, and blocked addresses stay silent. */
export async function sendSalesNotice(notice: SalesNotice): Promise<{ sent: boolean }> {
  const decision = salesRecipientDecision(notice.to, notice.contactEmail);
  if (!decision.ok) return { sent: false };
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn("RESEND_API_KEY manquante, brief commercial non envoyé");
    return { sent: false };
  }
  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM || "QuoteBuilder <devis@localhost>";
  const { error } = await resend.emails.send({
    from,
    to: decision.to,
    subject: notice.subject,
    text: notice.text,
  });
  if (error) throw new Error(error.message);
  return { sent: true };
}
