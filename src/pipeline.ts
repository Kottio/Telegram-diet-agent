import { insertRawEvent } from "./db";

export async function handleUpdate(update: any): Promise<number | null> {
  const msg = update?.message;
  if (!msg) return null; // edits, joins, channel posts

  const rawText: string | null = msg.text ?? msg.caption ?? null;
  const receivedAt = new Date(msg.date * 1000); // Telegram sends seconds

  const id = await insertRawEvent({
    updateId: update.update_id,
    chatId: msg.chat.id,
    receivedAt,
    rawText,
    payload: update, // keep everything
  });

  if (id === null) {
    console.log(`↺ update ${update.update_id} already stored`);
    return null;
  }

  console.log(`✓ raw_event ${id}: ${rawText}`);
  return id;
}
