create table if not exists meal (
  id             bigint      generated always as identity primary key,
  raw_event_id   bigint      not null references raw_event(id) on delete cascade,
  eaten_at       timestamptz not null,
  model          text        not null,
  prompt_version text        not null,
  created_at     timestamptz not null default now(),

  constraint meal_raw_event_uniq unique (raw_event_id)
);

create table if not exists meal_item (
  id         bigint  generated always as identity primary key,
  meal_id    bigint  not null references meal(id) on delete cascade,
  name       text    not null,
  quantity   numeric,
  unit       text,
  grams      numeric,
  kcal       numeric,
  protein_g  numeric,
  carbs_g    numeric,
  fat_g      numeric,
  confidence text    not null
);
create index if not exists meal_item_meal_idx on meal_item (meal_id);