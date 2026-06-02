-- Световое тело: накопленные «точки света» пользователя (по +1 за каждую запись эмоции).
-- Денормализованный счётчик для быстрой отрисовки без скана всех записей.
create table public.light_body_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  points integer not null default 0 check (points >= 0),
  updated_at timestamptz not null default now()
);

comment on table public.light_body_state is 'Накопленные точки света пользователя (+1 за каждую запись эмоции).';

-- RLS: пользователь читает только своё состояние. Прямой записи нет —
-- инкремент идёт только через SECURITY DEFINER функцию add_light_point().
alter table public.light_body_state enable row level security;

create policy "light_body_state_select_own"
  on public.light_body_state for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Атомарный инкремент точки света для текущего пользователя. Возвращает новый итог.
create or replace function public.add_light_point()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_points integer;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  insert into public.light_body_state as lbs (user_id, points)
    values (v_uid, 1)
  on conflict (user_id) do update
    set points = lbs.points + 1, updated_at = now()
  returning lbs.points into v_points;

  return v_points;
end;
$$;

-- Доступна только аутентифицированным (анону незачем).
revoke execute on function public.add_light_point() from public, anon;
grant execute on function public.add_light_point() to authenticated;
