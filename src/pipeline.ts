import { insertRawEvent } from "./db/raw_event";
import { parseMeal } from "./ai/parse";
import { insertMeal } from "./db/meal";
import { writeTelegram } from "./lib/write_telegram";
import { formatMeal } from "./lib/format";

export async function handleUpdate(update: any): Promise<number | null> {
  const msg = update?.message;
  if (!msg) return null; // edits, joins, channel posts

  const rawText: string | null = msg.text ?? msg.caption ?? null;
  const receivedAt = new Date(msg.date * 1000); // Telegram sends seconds

  const rawEventId = await insertRawEvent({
    updateId: update.update_id,
    chatId: msg.chat.id,
    receivedAt,
    rawText,
    payload: update, // keep everything
  });

  if (rawEventId === null) {
    console.log(`↺ update ${update.update_id} already stored`);
    return null;
  }

  console.log(`✓ raw_event ${rawEventId}: ${rawText}`);

  if (rawText) {
    console.log("Parsing With AI");
    const parsed = await parseMeal(rawText);
    console.log(parsed);

    if (parsed) {
      const mealId = await insertMeal({
        rawEventId,
        eatenAt: receivedAt,
        model: parsed.model,
        promptVersion: parsed.promptVersion,
        meal: parsed.raw,
      });
      console.log(mealId);

      const telegram = await writeTelegram(msg.chat.id, formatMeal(parsed.raw));
      console.log(telegram);
    }
  }
  return rawEventId;
}
