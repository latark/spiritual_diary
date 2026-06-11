-- Флаги крайних состояний (CLAUDE.md §6). Срабатывают, когда свободный пользовательский
-- текст задевает crisis-детектор. Это инструмент СВОЕВРЕМЕННОЙ поддержки человеком
-- (куратор/психолог школы), а не контроля юзера — поэтому минимум данных и строгий RLS.
--
-- Сам триггернувший текст здесь НЕ хранится (приватность, минимизация ПДн): только факт,
-- категории и откуда пришло. Источник острого состояния важен живому человеку как сигнал
-- «нужно мягко связаться», а не как улика.
create table public.crisis_flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  categories text[] not null,
  source text not null check (
    source in ('record_cause', 'record_thought')
  ),
  detected_by text not null default 'keyword' check (
    detected_by in ('keyword', 'llm')
  ),
  created_at timestamptz not null default now()
);

comment on table public.crisis_flags is 'Флаги крайних состояний для куратора школы — своевременная поддержка человеком, не контроль.';
comment on column public.crisis_flags.categories is 'Категории сработавшего детектора: suicide / self_harm / hopelessness / harm_others.';
comment on column public.crisis_flags.source is 'Где сработало: свободный текст причины / фоновой мысли.';
comment on column public.crisis_flags.detected_by is 'Слой, поймавший состояние: keyword или llm.';

-- Куратор смотрит свежие флаги в хронологии.
create index crisis_flags_created_idx on public.crisis_flags (created_at desc);

-- RLS: особый случай. Пользователь МОЖЕТ создать свой флаг (его пишет server action от его
-- сессии), но НЕ может его читать, менять или удалять — «ты во флаге» юзеру не показываем.
-- Читает только service role (куратор через Studio/будущую страницу), он обходит RLS.
alter table public.crisis_flags enable row level security;

create policy "crisis_flags_insert_own"
  on public.crisis_flags for insert
  to authenticated
  with check ((select auth.uid()) = user_id);
