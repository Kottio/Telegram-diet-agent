
-- migrations/001_create_raw_event.sql
-- Source of truth. Append-only: never updated, never deleted.
-- Everything downstream is derived from this table.

create table if not exists raw_event (
  id          bigint      generated always as identity primary key,
  source      text        not null default 'telegram',
  update_id   bigint      not null,
  chat_id     bigint      not null,
  user_id     text        not null default 'tom',
  received_at timestamptz not null default now(),
  raw_text    text,                                    -- null for photo-only messages
  payload     jsonb       not null,                    -- the complete Telegram update

  constraint raw_event_source_update_uniq unique (source, update_id)
);

create index if not exists raw_event_received_at_idx
  on raw_event (received_at desc);