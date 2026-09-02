import type { Condition, RuleConditions } from "@/lib/wizard/types";
import type { Json } from "@/lib/db/database.types";

export function parseConditions(form: FormData): RuleConditions {
  const keys = form.getAll("cond_key").map(String);
  const ops = form.getAll("cond_op").map(String);
  const values = form.getAll("cond_value").map(String);
  const all: Condition[] = [];
  keys.forEach((key, i) => {
    if (!key.trim()) return;
    const op = (ops[i] || "eq") as Condition["op"];
    const raw = values[i] ?? "";
    let value: Json = raw;
    if (op === "gte" || op === "lte") {
      const n = Number(raw.replace(",", "."));
      value = Number.isFinite(n) ? n : raw;
    }
    if (op === "in") {
      value = raw.split(",").map((v) => v.trim()).filter(Boolean);
    }
    all.push({ key: key.trim(), op, value });
  });
  return { all };
}
