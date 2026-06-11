---
name: supabase-migration
description: >-
  Паттерн миграций Supabase/Postgres проекта «Духовный дневник»: таблица, RLS,
  hardening, 152-ФЗ. Подключай ВСЕГДА, когда создаёшь или правишь файл в
  supabase/migrations/, добавляешь таблицу/колонку/индекс, пишешь RLS-политики,
  функции (SECURITY DEFINER), триггеры или RPC. Нужен, даже если пользователь просто
  просит «добавь таблицу/поле» и не упоминает миграцию или RLS. Таблица без RLS,
  функция без search_path или хранение ПДн с hardcoded-URL это дыры, которые легко
  не заметить. На него опирается команда cmd_app_db-push. Триггеры: миграция, supabase
  migration, новая таблица/колонка, RLS, политика доступа, SECURITY DEFINER, search_path,
  pg_cron, RPC-функция, soft-delete, схема БД.
---

# Паттерн миграций

Каждая миграция повторяет форму тех, что уже лежат в `supabase/migrations/`. Перед
новой посмотри ближайший аналог (`create_emotion_entries`, `create_light_body_state`).
Миграции **иммутабельны**. Прод-схему правь только новой миграцией. Старую не редактируй
и руками в Studio ничего не меняй.

## Имя файла

`supabase/migrations/<timestamp>_<snake_case_name>.sql`. Timestamp монотонно растёт
(`20260601000008_add_streaks`). Имя описывает действие: `create_*`, `add_*`, `drop_*`.

## Таблица с пользовательскими данными: обязательный скелет

```sql
-- Комментарий-«зачем»: что хранит таблица и почему так смоделирована.
create table public.things (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- ... колонки; ограничения через check (intensity between 1 and 5)
  created_at timestamptz not null default now()
);

comment on table public.things is 'Человеческое описание сущности.';

-- Индекс под основной паттерн доступа (обычно свои записи по времени).
create index things_user_created_idx on public.things (user_id, created_at desc);

-- RLS обязателен на ЛЮБОЙ таблице с пользовательскими данными. Без исключений.
alter table public.things enable row level security;

create policy "things_select_own" on public.things for select
  to authenticated using ((select auth.uid()) = user_id);

create policy "things_insert_own" on public.things for insert
  to authenticated with check ((select auth.uid()) = user_id);

create policy "things_update_own" on public.things for update
  to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "things_delete_own" on public.things for delete
  to authenticated using ((select auth.uid()) = user_id);
```

### Правила RLS

- **`(select auth.uid())`**, а не голый `auth.uid()`. Обёртка в `select` даёт Postgres
  закэшировать значение на запрос (заметно на больших выборках). Так во всех миграциях.
- **`to authenticated`** на каждой политике, чтобы у анона не было доступа к пользовательским данным.
- **Справочники/каталоги** (статический контент): `select` для `authenticated`, а запись
  только через service role (без insert/update/delete политик для пользователей).
- **`user_id` всегда `references auth.users (id) on delete cascade`** для чистки при удалении.

### Soft-delete vs delete

У записей дневника принцип «навсегда»: пользователь **не удаляет** их из основного потока.
Где это так, `delete`-политику не давай вообще. Удаление аккаунта решается отдельным
soft-delete-флагом и отложенным hard-delete через pg_cron (см. backlog). `delete_own`
давай только там, где удаление осмысленно (черновики, отклики). Думай, прежде чем копировать.

## Функции и RPC: hardening обязателен

```sql
create or replace function public.do_thing()
returns integer
language plpgsql
security definer          -- выполняется с правами владельца → search_path критичен
set search_path = ''      -- защита от перехвата через схему; все имена пиши как public.x
as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  -- ... только public.<table>, никаких неполных имён
  return 0;
end;
$$;

-- Раздать execute точечно. Триггер-функции — отозвать у всех (вызываются только как триггер).
revoke execute on function public.do_thing() from public, anon;
grant execute on function public.do_thing() to authenticated;
```

- **`security definer` всегда вместе с `set search_path = ''`**, иначе возможна инъекция через
  подменённую схему. Внутри обращайся только по полному имени `public.<name>`.
- **Триггер-функции** (`set_updated_at`, `handle_new_user`): `revoke execute … from
  public, anon, authenticated`, их не вызывают как RPC.
- Атомарные счётчики делай через `insert … on conflict … do update` (см. `add_light_point`),
  а не read-modify-write в коде.

## 152-ФЗ и окружение

Хранение ПДн может переехать на РФ-инфраструктуру (Supabase EU ↔ self-hosted Yandex).
В SQL не пиши hardcoded URL, проектные id и секреты. Подключение и ключи только через
env на стороне приложения. Миграция должна применяться к любому окружению без правок.

## Перед применением (cmd_app_db-push)

```
□ RLS включён на новой таблице с пользовательскими данными, политики на CRUD
□ (select auth.uid()), to authenticated
□ security definer → set search_path = '', имена public.*
□ триггер-функции с revoke execute
□ delete-политика осознанно дана/не дана (принцип «навсегда»)
□ нет hardcoded URL/секретов
□ timestamp имени больше предыдущего; старые миграции не тронуты
```

После миграции перегенерируй типы (`supabase gen types`) в `shared/api/supabase/
database.types.ts`, иначе запросы будут нетипизированы. Security-advisors после пуша
должны быть чисты (`get_advisors`).
