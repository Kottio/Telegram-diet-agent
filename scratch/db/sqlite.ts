import { Database } from "bun:sqlite";

const db = new Database("scratch/data/dev.sqlite");

db.run(`
    create table if not exists raw_event (
    id          integer primary key autoincrement,
    source      text not null default 'telegram',
    update_id   integer not null,
    chat_id     integer not null,
    received_at text    not null default (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    raw_text    text,
    unique (source, update_id))
  `);

const stmt = db.query(`
  insert or ignore into raw_event (update_id, chat_id, raw_text)
  values ($updateId, $chatId, $rawText)
  returning id
  `);

export function insertRawMessage(
  updateId: number,
  chatId: number,
  rawText: string,
) {
  return stmt.get({
    $updateId: updateId,
    $chatId: chatId,
    $rawText: rawText,
  });
}
