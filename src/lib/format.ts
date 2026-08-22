// src/format.ts
import type { Meal } from "../schema";

const n = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

export function formatMeal(meal: Meal): string {
  const lines = meal.items.map((it) => {
    const qty =
      it.quantity != null
        ? `${n(it.quantity)}${it.unit ? ` ${it.unit}` : ""}`
        : null;
    const grams = it.grams != null ? `${Math.round(it.grams)} g` : null;
    const detail = [qty, grams].filter(Boolean).join(", ");
    const kcal = it.kcal != null ? `${Math.round(it.kcal)} kcal` : "? kcal";
    const flag = it.confidence === "low" ? " ❓" : "";
    return `• ${it.name}${detail ? ` (${detail})` : ""} — ${kcal}${flag}`;
  });

  const sum = (k: "kcal" | "protein_g" | "carbs_g" | "fat_g") =>
    meal.items.reduce((t, i) => t + (i[k] ?? 0), 0);

  const partial = meal.items.some((i) => i.kcal == null);
  const total = `${Math.round(sum("kcal"))}${partial ? "+" : ""} kcal`;
  const macros = `P ${Math.round(sum("protein_g"))} · G ${Math.round(sum("carbs_g"))} · L ${Math.round(sum("fat_g"))}`;

  return [...lines, "", `${total}  ·  ${macros}`].join("\n");
}
