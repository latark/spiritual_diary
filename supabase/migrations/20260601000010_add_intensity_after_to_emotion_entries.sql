-- Сила эмоции ПОСЛЕ дыхательной практики — переоценка облегчения («петля облегчения»).
-- Записывается тем же insert'ом, что и сама запись (шаг идёт до сохранения), поэтому
-- отдельной таблицы и политик не нужно — insert-own/update-own RLS уже покрывают колонку.
-- Сдвиг intensity → intensity_after показываем метафорой света (не процентом) и копим как
-- будущий «тренд облегчения» для еженедельного анализа. null = переоценку пропустили.
alter table public.emotion_entries
  add column intensity_after smallint check (intensity_after between 1 and 5);

comment on column public.emotion_entries.intensity_after is 'Сила эмоции после дыхания (переоценка облегчения, 1..5). null = не переоценивали.';
