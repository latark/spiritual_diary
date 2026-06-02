-- Причина эмоции теперь = сфера жизни (одна из 7 «Ревизии» = id чакры), а не external/internal.
-- Плюс фоновая мысль из каталога и свободные «свои» варианты (проходят crisis-фильтр перед записью).
alter table public.emotion_entries
  drop column cause_type;

alter table public.emotion_entries
  add column cause_sphere text check (
    cause_sphere in ('root', 'sacral', 'solar', 'heart', 'throat', 'third_eye', 'crown')
  ),
  add column cause_custom text,
  add column background_thought_id smallint check (background_thought_id between 1 and 200),
  add column background_thought_custom text;

comment on column public.emotion_entries.cause_sphere is 'Сфера жизни (= id чакры) как причина эмоции.';
comment on column public.emotion_entries.cause_custom is 'Своя причина (свободный текст, после crisis-фильтра).';
comment on column public.emotion_entries.background_thought_id is 'id фоновой установки из каталога background-thoughts.';
comment on column public.emotion_entries.background_thought_custom is 'Своя фоновая мысль (свободный текст, после crisis-фильтра).';
