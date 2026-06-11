-- Осознание (awareness) — текст, который пользователь дописывает к записи позже,
-- на «Пути»/в «Инсайте», когда возвращается к прожитой эмоции. Это часть записи,
-- поэтому живёт прямо в emotion_entries (не отдельной таблицей): по дню видно в «Памяти»,
-- собранными — лентой «Твой свет». null = к записи ещё не возвращались (очередь на осмысление).
-- Свободный текст → проходит crisis-фильтр перед записью (§6), как cause_custom/thought_custom.
alter table public.emotion_entries
  add column awareness text;

comment on column public.emotion_entries.awareness is 'Осознание к записи (свободный текст, дописывается позже, после crisis-фильтра).';

-- Свободный текст осознания — новый источник для crisis-детектора.
alter table public.crisis_flags
  drop constraint crisis_flags_source_check;

alter table public.crisis_flags
  add constraint crisis_flags_source_check check (
    source in ('record_cause', 'record_thought', 'record_awareness')
  );
