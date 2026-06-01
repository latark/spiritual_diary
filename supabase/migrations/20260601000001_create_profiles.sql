-- Профиль пользователя. 1:1 с auth.users.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  totem text check (totem in ('wolf', 'deer', 'phoenix', 'dolphin')),
  base_vibration integer check (base_vibration between 0 and 1000),
  intention_30d text,
  birth_date date,
  birth_time time,
  birth_location text,
  birth_lat numeric,
  birth_lng numeric,
  timezone text not null default 'Europe/Moscow',
  onboarding_completed boolean not null default false,
  consent_pdn_accepted_at timestamptz not null,
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Профиль ученицы: тотем, базовая вибрация, намерение, согласие на ПДн.';

-- Автообновление updated_at.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- Автосоздание профиля при регистрации. display_name и согласие приходят
-- в user metadata из формы регистрации; consent фиксируется моментом создания.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, marketing_consent, consent_pdn_accepted_at)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data ->> 'marketing_consent')::boolean, false),
    now()
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- RLS: пользователь видит и меняет только свой профиль; удаление запрещено.
alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
