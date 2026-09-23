import type { ChatDecision } from "@/lib/chat-agent/policy";
import { decideChatTurn } from "@/lib/chat-agent/policy";
import { acceptModelReply, composeChatReply } from "@/lib/chat-agent/reply";
import { retrieveSources, type ChatSource } from "@/lib/chat-agent/sources";

export type ChatPhrase = (input: { message: string; decision: ChatDecision }) => Promise<string | null>;

export async function runChatRetrieval(input: {
  message: string;
  sources: ChatSource[];
  delivered: boolean;
  hasContact: boolean;
  phrase?: ChatPhrase;
}) {
  const retrieved = retrieveSources(input.sources, input.message);
  const decision = decideChatTurn(input.message, retrieved);
  let reply = composeChatReply({
    message: input.message,
    decision,
    delivered: input.delivered,
    hasContact: input.hasContact,
  });
  if (input.phrase && decision.outcome === "answer" && decision.reason === "grounded") {
    try {
      const phrased = await input.phrase({ message: input.message, decision });
      const accepted = phrased ? acceptModelReply(phrased, decision) : null;
      if (accepted) reply = accepted;
    } catch (error) {
      console.error("chat agent phrase failed", error);
    }
  }
  return { reply, decision };
}
