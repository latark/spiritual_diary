'use client';

import { useState } from 'react';

import type { ChakraProfile, EnergyEntry } from '@/shared/content/chakras';

import { resetChakraProfileAction, saveChakraProfileAction } from '../model/save-chakra-action';
import { ChakraTest } from './ChakraTest';
import { EnergyMap } from './EnergyMap';

/**
 * Грань «Тело и энергии». Пока тест не пройден — приглашение (карта скрыта). Прошла тест —
 * результат сразу виден на карте чакр (точки встают на свои уровни). Дальше карта оживает от
 * записей дневника: точки двигаются по шкале «слабее → ярче».
 */
export function EnergyPanel({
  initialProfile,
  entries,
}: {
  initialProfile: ChakraProfile | null;
  entries: EnergyEntry[];
}) {
  const [profile, setProfile] = useState<ChakraProfile | null>(initialProfile);
  const [testing, setTesting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function save(p: ChakraProfile) {
    setSaveError(null);
    const res = await saveChakraProfileAction(p);
    if ('error' in res) setSaveError(res.error);
  }

  function handleComplete(p: ChakraProfile) {
    setProfile(p); // мгновенный показ результата — отправная точка
    setTesting(false);
    void save(p);
  }

  // TODO(temp/dev): сброс для перетестирования — убрать перед бетой вместе с action.
  async function devReset() {
    const res = await resetChakraProfileAction();
    if ('error' in res) {
      setSaveError(res.error);
      return;
    }
    setSaveError(null);
    setProfile(null);
  }

  if (testing) {
    return <ChakraTest onComplete={handleComplete} onCancel={() => setTesting(false)} />;
  }

  if (!profile) {
    return (
      <section className="bg-surface/40 animate-fade-up flex flex-col items-center gap-5 rounded-2xl px-6 py-10 text-center">
        <span className="bg-gold-soft animate-breathe shadow-glow-soft size-3 rounded-full" />
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-ink text-2xl">Карта твоих чакр</h2>
          <p className="text-ink-muted mx-auto max-w-sm text-sm leading-relaxed">
            Семь центров — семь граней тебя. Пройди тест, и увидишь, где сейчас больше света, а где
            меньше. Это станет отправной точкой — дальше карта оживёт вместе с твоими записями.
          </p>
        </div>
        <button type="button" onClick={() => setTesting(true)} className="btn-gold h-12 px-6">
          Пройти тест
        </button>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {saveError && (
        <p className="text-danger text-sm">
          {saveError}{' '}
          <button
            type="button"
            onClick={() => void save(profile)}
            className="underline underline-offset-4 transition-opacity duration-200 hover:opacity-80"
          >
            повторить
          </button>
        </p>
      )}
      <EnergyMap initial={profile} entries={entries} />

      {/* TODO(temp/dev): сброс теста для перетестирования — убрать перед бетой. */}
      <button
        type="button"
        onClick={() => void devReset()}
        className="text-ink-muted/60 hover:text-gold self-center text-xs underline underline-offset-4 transition-colors duration-200"
      >
        сбросить тест (temp)
      </button>
    </div>
  );
}
