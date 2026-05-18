-- Run this in your Supabase SQL Editor to create the favorites table

create table if not exists favorites (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('meal','cocktail','brewery')),
  item_id     text not null,
  item_name   text not null,
  item_image  text,
  created_at  timestamptz default now()
);

-- Optional: prevent duplicate saves of the same item
create unique index if not exists favorites_type_item_id_idx on favorites(type, item_id);

-- Enable Row Level Security (keep data public for this project)
alter table favorites enable row level security;

create policy "Allow all" on favorites for all using (true) with check (true);
