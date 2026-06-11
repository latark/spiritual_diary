-- Намерение на 30 дней в онбординге (profiles.intention_30d) — свободный пользовательский
-- текст, значит подпадает под crisis-детектор (§6). Добавляем источник для crisis_flags,
-- чтобы куратор видел, откуда пришёл сигнал.
alter table public.crisis_flags
  drop constraint crisis_flags_source_check;

alter table public.crisis_flags
  add constraint crisis_flags_source_check check (
    source in ('record_cause', 'record_thought', 'record_awareness', 'onboarding_intention')
  );
