---
name: server-action
description: >-
  Паттерн серверных мутаций (Server Actions) проекта «Духовный дневник»: единый
  контур Zod→auth→DB→tagged-union Result. Подключай ВСЕГДА, когда пишешь или правишь
  серверную операцию записи/изменения данных: сохранение записи, отклика, профиля,
  онбординга, действий авторизации — любой файл model/*-action.ts с 'use server',
  любой обработчик формы через useActionState, любая запись в Supabase с клиента
  через сервер. Нужен, даже если пользователь просто просит «сделай сохранение/
  отправку формы» и не упоминает server action, иначе легко вернуть голый throw,
  null вместо Result, пропустить auth-check или crisis-фильтр свободного текста, или
  написать техническую ошибку вместо тёплой. Триггеры: server action, 'use server',
  мутация, сохранить/записать в БД, useActionState, обработка формы, supabase insert/
  update, валидация ввода.
---

# Паттерн Server Action

В проекте у всех мутаций один контур. Новую server action делай по эталону
`features/emotion-record/model/save-action.ts`, не изобретай свой стиль.

## Контур (4 уровня, всегда в этом порядке)

```typescript
'use server';

import { createSupabaseServerClient } from '@/shared/api/supabase';
import { detectCrisis } from '@/shared/safety';
import { thingSchema, type ThingInput } from './thing-schema';

// 1. Result — tagged union, НЕ null и НЕ throw наружу.
export type SaveThingResult = { ok: true; id: string } | { error: string };

export async function saveThingAction(input: ThingInput): Promise<SaveThingResult> {
  // 2. Валидация входа через Zod safeParse.
  const parsed = thingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Проверь поля' };
  }
  const d = parsed.data;

  // 3. Аутентификация. Без user — мягкий выход, не throw.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Сессия истекла — войди заново' };
  }

  // 3a. Свободный текст? → crisis-фильтр ДО записи (см. ниже, не ослаблять).
  // 4. Операция в БД. Маппинг camelCase (вход) → snake_case (колонки). user_id из user.id.
  const { data, error } = await supabase
    .from('things')
    .insert({ user_id: user.id, some_field: d.someField, optional_field: d.optional || null })
    .select('id')
    .single();

  if (error || !data) {
    return { error: 'Не удалось сохранить. Попробуем ещё раз?' };
  }

  // 5. Некритичный сайд-эффект — лучшее усилие, НЕ валит основную операцию.
  await supabase.rpc('add_light_point');

  return { ok: true, id: data.id };
}
```

## Правила, которые держат контур

- **Result делай tagged union** `{ ok: true; … } | { error: string }`. Не бросай
  ошибку наружу и не возвращай `null`, иначе вызывающему UI придётся ловить её через
  try/catch, чтобы показать `error`. Имя типа — `Save<Thing>Result`.
- **Валидация — серверный `safeParse`.** Клиенту не доверяй. Первое сообщение бери из
  `parsed.error.issues[0]?.message`. Сами сообщения пишутся в Zod-схеме (`model/*-schema.ts`).
- **Auth через `getUser()`**, не `getSession()` (getUser проверяет токен на сервере).
  `user_id` бери из `user.id`, **никогда из входных данных**, иначе можно подменить чужой id.
- **RLS не заменяет проверку в коде, это второй контур.** Политики (`(select auth.uid()) =
  user_id`) уже на таблице (см. скилл `supabase-migration`), но auth-check в action
  оставляем: он даёт тёплую ошибку вместо отказа БД.
- **Маппинг camelCase→snake_case** на границе: вход слайса в camelCase, колонки в
  snake_case. Пустые опциональные строки переводи в `|| null`, а не в пустую строку.
- **Сайд-эффекты не блокируют.** `add_light_point` и подобное вызывай после основной
  записи, по принципу «лучшее усилие». Если сайд-эффект упал, успех это не отменяет.
- **Ошибки пиши тёплые.** Текст для пользователя — через скилл `spiritual-voice`. Не
  «Ошибка валидации» и не «Unauthorized», а «Проверь поля», «Сессия истекла — войди заново».

## Свободный текст → crisis-фильтр (нельзя пропускать)

Если action принимает свободный пользовательский текст (мысль, причина, отклик,
осознание, транскрипция), он **обязан** пройти `detectCrisis()` из `@/shared/safety`
до записи (CLAUDE.md §6). При срабатывании запись не публикуется в обычном потоке:
сохраняем флаг и отдаём результат, ведущий на экран поддержки. Этот слой нельзя
ослаблять даже для тестов. Полный pipeline (LLM-слой, `crisis_flags`, алерт куратору)
описан в скилле `crisis-safety`. Как минимум keyword-слой `detectCrisis` обязателен уже сейчас.

## Подключение к форме

Форма вызывает action через `useActionState`, а pending берёт из `useFormStatus` на
кнопке (эталон `features/auth/ui/LoginForm.tsx`). Для actions, читающих `FormData`
напрямую (как auth), сигнатура `(_prev, formData) => Promise<State>`, где `State`
несёт `error` для рендера. Технические ошибки провайдера в тёплые маппит отдельная
функция (`mapAuthError`), а не сама action.

## Самопроверка

- Возвращаю tagged-union Result, не throw и не null?
- `safeParse` до всего; `getUser()` есть; `user_id` из `user.id`, не из входа?
- Свободный текст прошёл `detectCrisis`?
- camelCase→snake_case смаплен; опциональные пустые → null?
- Сайд-эффекты не валят основную запись?
- Тексты ошибок — тёплые (через `spiritual-voice`), не технические?
