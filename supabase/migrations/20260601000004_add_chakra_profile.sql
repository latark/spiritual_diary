-- Стартовая карта чакр из онбординга (диагностика 21 вопроса).
-- Формат: { "root": 0..100, "sacral": ..., "solar": ..., "heart": ...,
--           "throat": ..., "third_eye": ..., "crown": ... }
alter table public.profiles add column chakra_profile jsonb;

comment on column public.profiles.chakra_profile is 'Стартовая карта чакр (0..100 на чакру) из диагностики онбординга.';
