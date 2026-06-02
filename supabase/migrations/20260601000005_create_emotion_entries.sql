-- Записи эмоций — основная таблица дневника.
-- Каталог эмоций статический (src/shared/content/emotions.ts), поэтому храним
-- стабильные строковые id семьи/оттенка + снимок имени и цвета на момент записи.
-- Локализация в теле — анатомические зоны (не чакры), id вида 'hand_left', 'chest'.
create table public.emotion_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  family_id text not null,
  shade_id text not null,
  emotion_name text not null,
  emotion_color text not null,
  intensity smallint not null check (intensity between 1 and 5),
  cause_type text check (cause_type in ('external', 'internal')),
  body_zones text[] not null default '{}',
  created_at timestamptz not null default now()
);

comment on table public.emotion_entries is 'Запись эмоции: что почувствовала, насколько, причина, где в теле.';

create index emotion_entries_user_created_idx
  on public.emotion_entries (user_id, created_at desc);

-- RLS: пользователь видит и меняет только свои записи (полный CRUD над своими).
alter table public.emotion_entries enable row level security;

create policy "emotion_entries_select_own"
  on public.emotion_entries for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "emotion_entries_insert_own"
  on public.emotion_entries for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "emotion_entries_update_own"
  on public.emotion_entries for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "emotion_entries_delete_own"
  on public.emotion_entries for delete
  to authenticated
  using ((select auth.uid()) = user_id);
