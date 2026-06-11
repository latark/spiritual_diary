-- Результаты еженедельного ИИ-анализа («Послание проводника»). Одна строка — один прогон за
-- окно недели. Храним структурированный текст послания, какую модель/версию промпта взяли, и
-- стоимость вызова (будущая боль unit-экономики). Записи иммутабельны: каждый прогон — новая
-- строка, перегенерация не правит старую (как принцип «навсегда» у дневника).
create table public.weekly_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Окно анализа в локальных датах пользователя (по profiles.timezone на стороне приложения).
  period_start date not null,
  period_end date not null,
  -- ready — послание сгенерировано и показывается; skipped_low_data — записей < порога, мягкое
  -- уведомление; safe_fallback — выходной фильтр §6 сработал, показан safe-template; error — сбой.
  status text not null check (status in ('ready', 'skipped_low_data', 'safe_fallback', 'error')),
  -- Структурированное послание (поля голоса тотема). null для skipped/error.
  content jsonb,
  model text,
  prompt_version text,
  -- Сколько записей вошло в окно (для порога low-data и аналитики).
  entries_count integer not null default 0 check (entries_count >= 0),
  -- Токены и стоимость вызова — трекинг с первого дня (§7).
  input_tokens integer,
  output_tokens integer,
  cost_usd numeric(10, 6),
  created_at timestamptz not null default now()
);

comment on table public.weekly_analyses is
  'Еженедельный ИИ-анализ («Послание проводника»): структурированное послание + метаданные модели и стоимость.';

-- Основной паттерн доступа: последнее послание пользователя.
create index weekly_analyses_user_created_idx on public.weekly_analyses (user_id, created_at desc);

alter table public.weekly_analyses enable row level security;

create policy "weekly_analyses_select_own" on public.weekly_analyses for select
  to authenticated using ((select auth.uid()) = user_id);

-- Insert-own — для генерации по запросу самим пользователем (MVP). Плановый прогон (cron) пишет
-- через service role в обход RLS. Update/delete не даём: анализы иммутабельны.
create policy "weekly_analyses_insert_own" on public.weekly_analyses for insert
  to authenticated with check ((select auth.uid()) = user_id);
