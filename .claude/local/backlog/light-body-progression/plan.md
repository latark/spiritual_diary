## Task

Подключить реальную прокачку светового тела на главной «Синтез»: 13 фаз, драйвер прогресса — **активные дни** (а не сырой `points`), три слоя свечения (базовый уровень фазы + витальность по `last_active_date` + вызревание back-loaded на финишной прямой). Фаза необратима; витальность обратима. Без прогресс-баров и чисел (§4 п.6). Динамический `stage` в `page.tsx` вместо `initialStage={1} preview`.

## Решения по дизайну (зафиксированы с Артёмом)

- **Драйвер** = активные дни (день с ≥1 записью, по `profiles.timezone`). Несколько записей в день прогресс не двигают (анти-гринд). `points` (всего записей) сохраняем — для статистики/энергокарты, но он больше не driver.
- **Кривая 13 фаз** (накопительные активные дни для входа): `[0, 1, 3, 5, 8, 12, 18, 26, 38, 54, 76, 110, 160]` (индексы фаз 1..13). Первые фазы быстро, дальше зазор растёт.
- **Витальность** — обратимое свечение по `last_active_date`: полное «сегодня/вчера», плавно тускнеет к «покою» (floor ≈0.35, не в ноль) за ~14 дней. Вспыхивает при первой записи после паузы.
- **Вызревание (ripeness)** — back-loaded: внутри текущего гэпа `ripeness = clamp01((gapProgress − 0.7) / 0.3)`. Первые ~70% дистанции ровно (никакой «горы впереди»), последние ~30% свет сгущается → «что-то назревает».
- **Церемония перехода** сохраняется: фаза, которую видит пользователь = `acknowledged_stage`; когда `computeStage(active_days) > acknowledged_stage`, вместо ripeness-мерцания показываем кнопку-арт «Совершить переход» (праздник-сюрприз). Клик → claim → кросс-фейд на новую фазу.

## Affected Files

- `src/features/emotion-record/model/save-action.ts` — заменить `supabase.rpc('add_light_point')` на `supabase.rpc('register_light_activity')` (без аргументов; дату считает функция по `profiles.timezone`).
- `src/features/light-body/ui/LightBody.tsx` — перевести с `MAX_UNLOCKED`/хардкода на props `stage`/`readyStage`/`vitality`/`ripeness`; вынести `STAGE_COUNT` в entity; маппинг витальности/вызревания в свечение; `advance` вызывает `claimLightStageAction`. `preview`-режим (свободный просмотр арта) оставить без изменений.
- `src/app/(main)/page.tsx` — грузить состояние тела (`getLightBodyState`), считать `today = localDate(timezone)`, вычислять `stage/readyStage/vitality/ripeness`, передавать в `LightBody` вместо `initialStage={1} preview`.
- `src/shared/api/supabase/database.types.ts` — обновить тип `light_body_state` (новые колонки) + `Functions` (`register_light_activity`, `claim_light_stage`; убрать `add_light_point`). Регенерировать через Supabase MCP.

## New Files

**Миграция:**
- `supabase/migrations/20260604000001_light_body_progression.sql` — `alter table light_body_state` (+ `active_days`, `last_active_date`, `acknowledged_stage`); функции `register_light_activity()` и `claim_light_stage(p_stage int)`; `drop function add_light_point()`.

**Новый слайс `entities/light-body`** (домен светового тела; UI остаётся в `features/light-body` — feature импортирует entity, слой соблюдён). Зеркалит сплит `entities/emotion-entry` (client-safe `index.ts` + server-only `server.ts`):
- `src/entities/light-body/model/types.ts` — `LightBodyState { points; activeDays; lastActiveDate: string | null; acknowledgedStage }`. (client-safe)
- `src/entities/light-body/model/progression.ts` — `STAGE_COUNT = 13`, `STAGE_THRESHOLDS`, `computeStage(activeDays)`, `gapProgress(activeDays, stage)`, `ripeness(activeDays, stage)`. Чистые, client-safe.
- `src/entities/light-body/model/vitality.ts` — `vitality(lastActiveDate, today): number` (использует `dayNumber` из `shared/lib/local-date`). client-safe.
- `src/entities/light-body/api/queries.ts` — `getLightBodyState(): Promise<LightBodyState>` (`server-only`, дефолты если строки нет).
- `src/entities/light-body/index.ts` — public API: типы + чистые функции (client-safe).
- `src/entities/light-body/server.ts` — `export { getLightBodyState }`.

**Server action:**
- `src/features/light-body/model/claim-stage-action.ts` — `'use server'`. auth → читает `active_days` → `earned = computeStage(activeDays)` (пороги единым источником в TS) → `supabase.rpc('claim_light_stage', { p_stage: earned })` → `revalidatePath('/')`. Возвращает tagged-union `Result` (skill `server-action`).
- `src/features/light-body/index.ts` — дополнить экспортом `claimLightStageAction`.

## Steps

1. **[Create]** `supabase/migrations/20260604000001_light_body_progression.sql`:
   - `alter table public.light_body_state add column active_days integer not null default 0 check (active_days >= 0), add column last_active_date date, add column acknowledged_stage integer not null default 1 check (acknowledged_stage between 1 and 13);`
   - `register_light_activity()` (`security definer`, `set search_path = ''`): `v_uid := auth.uid()` (raise если null); `select timezone into v_tz from public.profiles where id = v_uid;` `v_today := (now() at time zone coalesce(v_tz,'UTC'))::date;` `insert ... values (v_uid, 1, 1, v_today, 1) on conflict (user_id) do update set points = lbs.points+1, active_days = lbs.active_days + (case when lbs.last_active_date is null or v_today > lbs.last_active_date then 1 else 0 end), last_active_date = greatest(coalesce(lbs.last_active_date, v_today), v_today), updated_at = now();` `revoke ... from public, anon; grant execute ... to authenticated;`
   - `claim_light_stage(p_stage int)` (`security definer`, `search_path=''`): `update public.light_body_state set acknowledged_stage = least(13, greatest(acknowledged_stage, p_stage)) where user_id = auth.uid();` grants как выше.
   - `drop function if exists public.add_light_point();`
2. **[Apply]** миграцию к remote (Supabase MCP `apply_migration`), затем `get_advisors` (security) — убедиться, что новые функции чисты (`search_path`).
3. **[Modify]** `database.types.ts` — регенерировать (MCP `generate_typescript_types`) и заменить блоки `light_body_state` + `Functions`.
4. **[Create]** `entities/light-body/model/{types,progression,vitality}.ts` — типы + чистые функции (пороги, `computeStage`, `gapProgress`, `ripeness`, `vitality`).
5. **[Create]** `entities/light-body/api/queries.ts` + `index.ts` + `server.ts` — чтение состояния (server-only) и public API (client-safe).
6. **[Modify]** `features/emotion-record/model/save-action.ts` — `rpc('add_light_point')` → `rpc('register_light_activity')`.
7. **[Create]** `features/light-body/model/claim-stage-action.ts` — claim-экшен; экспортировать из `features/light-body/index.ts`.
8. **[Modify]** `features/light-body/ui/LightBody.tsx`:
   - импорт `STAGE_COUNT` из `@/entities/light-body`; удалить локальные `STAGE_COUNT`/`MAX_UNLOCKED`.
   - props: `{ stage; readyStage; vitality; ripeness; preview? }` (preview оставляет старое поведение свободного листания).
   - real-режим: `canAdvance = readyStage > stage`; `advance` = `await claimLightStageAction()` → `setFromStage(stage); setStage(readyStage)` (кросс-фейд существующий).
   - свечение: `vitality` → opacity ауры/тела + интенсивность `boxShadow`; `ripeness` (когда `readyStage === stage`) → усиление золота в ауре/тени + ускорение пульса (inline `animationDuration`). Точные величины — на реализации, в рамках токенов §4.
9. **[Modify]** `app/(main)/page.tsx`:
   - убрать temp-`preview` для тела; `const lb = user ? await getLightBodyState() : null;`
   - `const today = localDate(timezone);` `stage = lb?.acknowledgedStage ?? 1; readyStage = computeStage(lb?.activeDays ?? 0); vit = vitality(lb?.lastActiveDate ?? null, today); rip = lb && readyStage === stage ? ripeness(lb.activeDays, stage) : 0;`
   - `<LightBody stage={stage} readyStage={readyStage} vitality={vit} ripeness={rip} />`.

## Verification

- [ ] Types pass (`npm run typecheck`)
- [ ] Build works (`npm run build`)
- [ ] Manual: новый пользователь без записей → тело тусклое (floor), без кнопки. Первая запись → `active_days=1` → `readyStage=2` → на главной кнопка «Совершить переход», клик → кросс-фейд на фазу 2, `acknowledged_stage=2`.
- [ ] Manual: вторая запись в тот же день → `active_days` не растёт (SQL: `execute_sql` проверить строку).
- [ ] Manual: запись «вчерашним» состоянием невозможна — проверить, что повтор в новый локальный день инкрементит `active_days`.
- [ ] Manual: подмена `last_active_date` на −10 дней в БД → тело заметно тусклее (витальность к floor); новая запись → вспыхивает.
- [ ] Advisors (security) после миграции — без новых WARN по функциям.

## Risks

- **TZ-дата в SQL vs JS.** `register_light_activity` считает локальную дату в Postgres (`now() at time zone tz`), а `localDate()` — в JS (Intl). Обе по одной IANA-строке → результат идентичен; расхождение только если `profiles.timezone` пуст (обе падают в UTC). → Принять; единый источник tz — `profiles.timezone`.
- **Claim можно вызвать в обход с `p_stage=13`.** Эффект чисто косметический (какой арт показан), ничего не разблокирует (нет оплат/контента), и обманывает только собственную мотивацию. RPC клампит `[1..13]` и не понижает. → Принять, не дублировать пороги в SQL ради этого.
- **`acknowledged_stage` отстаёт от `readyStage`, если юзер не нажал кнопку.** Это и есть задуманная церемония (переход — действие пользователя). Ripeness не показывается, пока `readyStage > stage` (вместо него — кнопка). → Ожидаемо.
- **Скан активных дней.** Считаем инкрементально в `register_light_activity` (без скана `emotion_entries`), чтение — одна строка `light_body_state`. → Нет проблемы производительности.
- **Старые пользователи с `points>0`, но `active_days=0`.** После миграции `active_days` стартует с 0 (бэкафилла нет — на этом этапе реальных юзеров нет). → Если появятся до релиза, добавить разовый бэкафилл `active_days` из `count(distinct date)` отдельной миграцией.
