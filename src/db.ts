import { SQL } from "bun";
import type { NewRawEvent } from "./schema";

if (!process.env.DATABASE_URL)
  throw new Error("DATABASE_URL missing from .env");

export const pg = new SQL(process.env.DATABASE_URL);

/** Append-only. Returns null if this update was already stored (Telegram retry). */
export async function insertRawEvent(e: NewRawEvent): Promise<number | null> {
  const rows = await pg`
    insert into raw_event (source, update_id, chat_id, received_at, raw_text, payload)
    values (
      'telegram',
      ${e.updateId},
      ${e.chatId},
      ${e.receivedAt},
      ${e.rawText},
      ${JSON.stringify(e.payload)}::jsonb
    )
    on conflict (source, update_id) do nothing
    returning id
  `;
  return rows.length ? Number(rows[0].id) : null;
}
