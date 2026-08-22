// Unused for now

import { z } from "zod";
export const TelegramUpdate = z.object({});
export type TelegramUpdate = z.infer<typeof TelegramUpdate>;

// interface message_raw_props {
//   update_id: Number;
//   message: {
//     message_id: Number;
//     from: {
//       id: Number;
//       is_bot: Boolean;
//       first_name: String;
//       language_code: String;
//     };
//     chat: {
//       id: Number;
//       first_name: String;
//       type: String;
//     };
//     date: Number;
//     text: String;
//   };
// }

export type NewRawEvent = {
  updateId: number;
  chatId: number;
  receivedAt: Date;
  rawText: string | null;
  payload: unknown;
};

export const MealItem = z.object({
  name: z.string().min(1),
  quantity: z.number().positive().nullable(),
  unit: z.string().min(1).nullable(),
  grams: z.number().positive().max(5000).nullable(),
  kcal: z.number().nonnegative().max(5000).nullable(),
  protein_g: z.number().nonnegative().max(500).nullable(),
  carbs_g: z.number().nonnegative().max(1000).nullable(),
  fat_g: z.number().nonnegative().max(500).nullable(),
  confidence: z.enum(["low", "medium", "high"]),
});

export const Meal = z.object({ items: z.array(MealItem).min(1).max(30) });
export type Meal = z.infer<typeof Meal>;
