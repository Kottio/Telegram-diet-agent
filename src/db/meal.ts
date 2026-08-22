import { pg } from "./raw_event";
import type { Meal } from "../schema";

export async function insertMeal(a: {
  rawEventId: number;
  eatenAt: Date;
  model: string;
  promptVersion: string;
  meal: Meal;
}): Promise<number | null> {
  const rows = await pg`
    insert into meal (raw_event_id, eaten_at, model, prompt_version)
      values (${a.rawEventId}, ${a.eatenAt}, ${a.model}, ${a.promptVersion})
      on conflict (raw_event_id) do nothing
      returning id
  `;

  if (!rows.length) return null; // already derived for this event
  const mealId = Number(rows[0].id);

  for (let it of a.meal.items) {
    await pg`
      insert into meal_item
          (meal_id, name, quantity, unit, grams, kcal, protein_g, carbs_g, fat_g, confidence)
        values
          (${mealId},${it.name}, ${it.quantity}, ${it.unit}, ${it.grams},
           ${it.kcal}, ${it.protein_g}, ${it.carbs_g}, ${it.fat_g}, ${it.confidence})
    `;
  }

  return mealId;
}
