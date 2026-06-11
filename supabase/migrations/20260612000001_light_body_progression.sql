-- Прогрессия тела света: драйвер фазы — активные дни (день с ≥1 записью по profiles.timezone),
-- а не сырые points. Фаза необратима и «присваивается» церемонией (acknowledged_stage): кнопка
-- перехода появляется, когда заработанная фаза обгоняет подтверждённую. points сохраняем для
-- статистики, но он больше не драйвер.

alter table public.light_body_state
  add column active_days integer not null default 0 check (active_days >= 0),
  add column last_active_date date,
  add column acknowledged_stage integer not null default 1 check (acknowledged_stage between 1 and 13);

comment on column public.light_body_state.active_days is
  'Накопленные активные дни (день с ≥1 записью). Драйвер фазы. Анти-гринд: несколько записей в день не двигают.';
comment on column public.light_body_state.last_active_date is
  'Локальная дата последней записи (по profiles.timezone). Для витальности и анти-гринда.';
comment on column public.light_body_state.acknowledged_stage is
  'Фаза, подтверждённая пользователем через кнопку перехода (1..13). Отстаёт от заработанной, пока не нажал.';

-- Регистрация активности: +1 point всегда, +1 active_day только в НОВЫЙ локальный день.
-- Локальную дату считает сама функция по profiles.timezone (единый источник tz с localDate в JS).
create or replace function public.register_light_activity()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_tz text;
  v_today date;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select timezone into v_tz from public.profiles where id = v_uid;
  v_today := (now() at time zone coalesce(v_tz, 'UTC'))::date;

  insert into public.light_body_state as lbs (user_id, points, active_days, last_active_date, acknowledged_stage)
    values (v_uid, 1, 1, v_today, 1)
  on conflict (user_id) do update set
    points = lbs.points + 1,
    active_days = lbs.active_days
      + (case when lbs.last_active_date is null or v_today > lbs.last_active_date then 1 else 0 end),
    last_active_date = greatest(coalesce(lbs.last_active_date, v_today), v_today),
    updated_at = now();
end;
$$;

revoke execute on function public.register_light_activity() from public, anon;
grant execute on function public.register_light_activity() to authenticated;

-- Подтверждение фазы (церемония перехода). Клампим в [1..13], не понижаем.
create or replace function public.claim_light_stage(p_stage integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  update public.light_body_state
    set acknowledged_stage = least(13, greatest(acknowledged_stage, p_stage)),
        updated_at = now()
    where user_id = v_uid;
end;
$$;

revoke execute on function public.claim_light_stage(integer) from public, anon;
grant execute on function public.claim_light_stage(integer) to authenticated;

-- Совместимость на время выката: старый деплой зовёт add_light_point() — делегируем на новую
-- логику, чтобы запись эмоции не падала в окно между миграцией и деплоем. Дроп — миграцией позже.
create or replace function public.add_light_point()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_points integer;
begin
  perform public.register_light_activity();
  select points into v_points from public.light_body_state where user_id = auth.uid();
  return coalesce(v_points, 0);
end;
$$;
