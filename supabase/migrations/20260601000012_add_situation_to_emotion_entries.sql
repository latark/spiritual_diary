-- Колонка 1 КПТ-записи (thought record): что случилось — факт своими словами. У нас её не
-- было (была только «сфера жизни» — абстрактная категория), из-за чего вопросы проработки
-- гадали о ситуации. Поле опциональное и свободное → подпадает под crisis-детектор (§6),
-- поэтому добавляем источник 'record_situation' для crisis_flags.
alter table public.emotion_entries
  add column situation text;

comment on column public.emotion_entries.situation is
  'Колонка 1 (CBT): что случилось, фактически, своими словами. Опционально. Свободный текст — под crisis-фильтром (§6).';

alter table public.crisis_flags
  drop constraint crisis_flags_source_check;

alter table public.crisis_flags
  add constraint crisis_flags_source_check check (
    source in (
      'record_cause',
      'record_thought',
      'record_awareness',
      'record_situation',
      'onboarding_intention'
    )
  );
