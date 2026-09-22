import type { Tables } from "@/lib/db/database.types";
import type { Answers, ContactDraft, Product } from "@/lib/wizard/types";
import { evaluateSuggestions } from "@/lib/wizard/suggestions";
import { searchCatalog } from "./catalog";
import { fenceCatalogPayload } from "./fencing";
import {
  canHandoffQuote,
  canPresentConfigurations,
  isValidEmail,
  rememberIds,
} from "./gates";
import type { AgentSessionState, ToolOutcome } from "./types";

type ToolInput = Record<string, unknown>;

function asParams(value: unknown): Answers {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Answers;
  }
  return {};
}

export function executeQuoteTool(input: {
  name: string;
  args: ToolInput;
  state: AgentSessionState;
  products: Product[];
  rules: Tables<"suggestion_rules">[];
}): { outcome: ToolOutcome; state: AgentSessionState } {
  const { name, args, products, rules } = input;
  let state = input.state;

  switch (name) {
    case "update_brief": {
      const params = asParams(args.params);
      state = {
        ...state,
        answers: { ...state.answers, ...params },
      };
      return {
        state,
        outcome: {
          status: "ok",
          result: {
            brief: state.answers,
            next: "Si le brief est assez riche, appelle search_catalog ou match_configurations.",
          },
        },
      };
    }

    case "search_catalog": {
      const found = searchCatalog(products, {
        query: typeof args.query === "string" ? args.query : undefined,
        category: typeof args.category === "string" ? args.category : undefined,
        tags: Array.isArray(args.tags) ? args.tags.map(String) : undefined,
        limit: typeof args.limit === "number" ? args.limit : undefined,
      });
      state = {
        ...state,
        provenance: rememberIds(
          state.provenance,
          found.products.map((p) => p.id),
        ),
      };
      return {
        state,
        outcome: {
          status: "ok",
          result: {
            total: found.total,
            products: found.products,
            note: fenceCatalogPayload(found.products),
          },
        },
      };
    }

    case "match_configurations": {
      const limit = typeof args.limit === "number" ? args.limit : 3;
      const suggestions = evaluateSuggestions(state.answers, rules, products, limit);
      const productIds = suggestions.flatMap((s) => s.products.map((p) => p.id));
      state = {
        ...state,
        lastSuggestions: suggestions,
        provenance: rememberIds(
          state.provenance,
          productIds,
          suggestions.map((s) => s.id),
        ),
      };
      const compact = suggestions.map((s) => ({
        id: s.id,
        name: s.name,
        headline: s.headline,
        description: s.description,
        priceMin: s.priceMin,
        priceMax: s.priceMax,
        products: s.products.map((p) => ({
          id: p.id,
          name: p.name,
          priceMin: p.priceMin,
          priceMax: p.priceMax,
          category: p.category,
        })),
      }));
      return {
        state,
        outcome: {
          status: "ok",
          result: {
            count: compact.length,
            configurations: compact,
            note: fenceCatalogPayload(compact),
            next:
              compact.length > 0
                ? "Présente 1–2 options au prospect, pose UNE clarification si besoin, puis present_configurations."
                : "Élargis le brief (update_brief) ou search_catalog, ne invente pas de produits.",
          },
        },
      };
    }

    case "collect_contact": {
      const patch: ContactDraft = { ...state.contactDraft };
      if (typeof args.name === "string" && args.name.trim()) patch.name = args.name.trim();
      if (typeof args.phone === "string" && args.phone.trim()) patch.phone = args.phone.trim();
      if (typeof args.company === "string" && args.company.trim()) {
        patch.company = args.company.trim();
      }
      if (typeof args.email === "string") {
        const email = args.email.trim();
        if (!isValidEmail(email)) {
          return {
            state,
            outcome: {
              status: "blocked",
              gate: "invalid_email",
              result: {
                message: "Email invalide. Demande une adresse correcte avant handoff_quote.",
              },
            },
          };
        }
        patch.email = email;
      }
      state = { ...state, contactDraft: patch };
      return {
        state,
        outcome: {
          status: "ok",
          result: {
            contact: {
              name: patch.name ?? null,
              email: patch.email ?? null,
              phone: patch.phone ?? null,
              company: patch.company ?? null,
            },
            next: patch.email
              ? "Tu peux appeler handoff_quote si le brief et la config sont prêts."
              : "Demande l'email pour envoyer la configuration.",
          },
        },
      };
    }

    case "present_configurations": {
      if (args.ready !== true) {
        return {
          state,
          outcome: {
            status: "blocked",
            gate: "not_ready",
            result: { message: "Passe ready=true seulement quand tu as des configs à montrer." },
          },
        };
      }
      const gate = canPresentConfigurations(state.provenance);
      if (!gate.ok) {
        return {
          state,
          outcome: {
            status: "blocked",
            gate: gate.gate,
            result: {
              message:
                "Appelle d'abord search_catalog ou match_configurations. Les configs viennent du catalogue, pas du modèle.",
            },
          },
        };
      }
      state = { ...state, goSuggestions: true };
      return {
        state,
        outcome: {
          status: "ok",
          result: {
            presented: true,
            suggestionCount: state.lastSuggestions.length,
            next: "Collecte prénom + email naturellement, puis handoff_quote.",
          },
        },
      };
    }

    case "handoff_quote": {
      if (args.ready !== true) {
        return {
          state,
          outcome: {
            status: "blocked",
            gate: "not_ready",
            result: { message: "Passe ready=true seulement pour passer à la soumission." },
          },
        };
      }
      const gate = canHandoffQuote(state.contactDraft.email);
      if (!gate.ok) {
        return {
          state,
          outcome: {
            status: "blocked",
            gate: gate.gate,
            result: {
              message:
                "Email manquant. Appelle collect_contact avec un email valide — Claude ne soumet pas le devis.",
            },
          },
        };
      }
      state = { ...state, goContact: true };
      return {
        state,
        outcome: {
          status: "ok",
          result: {
            handoff: true,
            message:
              "Étape contact ouverte côté hôte. Aucun paiement, aucune commande — brief devis uniquement.",
          },
        },
      };
    }

    default:
      return {
        state,
        outcome: {
          status: "error",
          result: { message: `Outil inconnu: ${name}` },
        },
      };
  }
}
