'use client';

import { useState } from 'react';

import {
  ALTERNATIVE_PROMPTS,
  ANCHOR_BELIEF_PROMPTS,
  CARRY_PROMPTS,
  CORE_BELIEF_PROMPTS,
  EXAMINE_PROMPTS,
  FACT_PROMPTS,
  POSITIVE_MEANING_PROMPTS,
  REENTER_PROMPTS,
  SELF_PROMPTS,
  SOURCE_PROMPTS,
  promptForDistortion,
} from '@/shared/content/awareness-prompts';
import { detectCrisis } from '@/shared/safety';
import { familyValence } from '@/shared/content/valence';
import { CrisisSupport } from '@/shared/ui/CrisisSupport';

import { thoughtDistortion, thoughtIsCore, thoughtLabel, thoughtReframe } from '../lib/labels';
import { addAwarenessAction } from '../model/add-awareness-action';
import { checkAwarenessCrisisAction } from '../model/check-awareness-crisis-action';
import type { EmotionEntry } from '../model/types';

interface LadderProps {
  entry: EmotionEntry;
  onSaved: (awareness: string) => void;
  onCancel: () => void;
}

/**
 * Лестница осмысления. Ветвится по валентности эмоции: тёмная — дуга реструктуризации
 * (NegativeLadder), светлая — дуга savoring (PositiveLadder). Светлое НЕ препарируем —
 * иначе инструмент сам подавляет радость (см. emotion-domain / reflection-method).
 */
export function InsightLadder(props: LadderProps) {
  const positive = familyValence(props.entry.familyId) === 'positive';
  return positive ? <PositiveLadder {...props} /> : <NegativeLadder {...props} />;
}

type Rung = 'ground' | 'facts' | 'examine' | 'self' | 'alternative' | 'gift';

/**
 * Лестница проработки «Путь → Инсайт». Первичный контекст (ситуация, эмоция, мысль) уже
 * собран при записи — здесь только УГЛУБЛЕНИЕ по дуге thought-record: вернуться (ground) →
 * отделить факт от интерпретации (facts) → разобраться в ситуации (examine; для убеждения-
 * схемы `core` — расшатать) → понять себя (self) → своя бережная версия (alternative) →
 * каталожная переустановка как опора (gift). Вопросы опираются на собранное, поэтому не гадают.
 * Источник содержания вопросов — скилл reflection-method; тон — spiritual-voice.
 *
 * Безопасность (§6): каждый свободный ввод проходит клиентский keyword-слой на «дальше»
 * (мгновенный экран + флаг куратору через checkAwarenessCrisisAction), итоговый текст —
 * авторитетную серверную проверку в addAwarenessAction. Острое состояние в дневник не пишем
 * и чистим введённое (enterCrisis) — инвариант держится внутри компонента, не только снаружи.
 */
function NegativeLadder({ entry, onSaved, onCancel }: LadderProps) {
  const [rung, setRung] = useState<Rung>('ground');
  const [factsText, setFactsText] = useState('');
  const [examineText, setExamineText] = useState('');
  const [selfText, setSelfText] = useState('');
  const [altText, setAltText] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [crisis, setCrisis] = useState(false);

  const reframe = thoughtReframe(entry);
  const core = thoughtIsCore(entry);

  // «Разобраться»: убеждение-схему о себе расшатываем регистром CORE_BELIEF; иначе —
  // прицельный по искажению вопрос первым, затем универсальный пул.
  const targeted = core ? null : promptForDistortion(thoughtDistortion(entry));
  const examinePrompts = core
    ? CORE_BELIEF_PROMPTS
    : targeted
      ? [targeted, ...EXAMINE_PROMPTS]
      : EXAMINE_PROMPTS;

  /** Острое состояние: чистим введённый текст (в дневник не пишем — инвариант §6) и к поддержке. */
  function enterCrisis(): void {
    setFactsText('');
    setExamineText('');
    setSelfText('');
    setAltText('');
    setStatus('idle');
    setCrisis(true);
  }

  /** Острый текст на «дальше»: keyword-слой даёт мгновенный экран, флаг куратору пишет server. */
  async function advance(text: string, next: Rung): Promise<void> {
    const trimmed = text.trim();
    if (trimmed && detectCrisis(trimmed).triggered) {
      await checkAwarenessCrisisAction(trimmed);
      enterCrisis();
      return;
    }
    setRung(next);
  }

  async function save(): Promise<void> {
    const awareness = [factsText, examineText, selfText, altText]
      .map((t) => t.trim())
      .filter(Boolean)
      .join('\n\n');
    if (!awareness) {
      onCancel();
      return;
    }

    // Сервер авторитетен (§6): classifyCrisis + запись/флаг внутри addAwarenessAction. При
    // срабатывании текст в дневник не пишется, ведём к поддержке.
    setStatus('saving');
    const result = await addAwarenessAction({ entryId: entry.id, text: awareness });
    if ('crisis' in result) {
      enterCrisis();
    } else if ('ok' in result) {
      onSaved(awareness);
    } else {
      setStatus('error');
    }
  }

  if (crisis) {
    return (
      <div className="bg-surface-raised rounded-xl p-4">
        <CrisisSupport
          onBack={() => {
            setCrisis(false);
            onCancel();
          }}
        />
      </div>
    );
  }

  const saving = status === 'saving';

  return (
    <div className="animate-fade-up space-y-3">
      {rung === 'ground' && (
        <div className="space-y-3">
          {entry.situation ? (
            <div className="space-y-1.5">
              <p className="font-display text-ink text-lg leading-snug">{REENTER_PROMPTS[0]}</p>
              <p className="text-ink/85 bg-canvas/50 rounded-lg px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line">
                {entry.situation}
              </p>
            </div>
          ) : (
            <p className="font-display text-ink text-lg leading-snug">
              Вернись к этому чувству на минуту.
            </p>
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="text-ink-muted hover:text-gold rounded-full px-3 py-1.5 text-sm transition-colors duration-200"
            >
              позже
            </button>
            <button
              type="button"
              onClick={() => setRung('facts')}
              className="bg-surface-raised text-ink ring-gold/40 hover:ring-gold hover:shadow-glow-soft mr-0 ml-auto h-10 rounded-lg px-5 text-sm ring-1 transition-all duration-300"
            >
              рассмотреть
            </button>
          </div>
        </div>
      )}

      {rung === 'facts' && (
        <RungInput
          prompts={FACT_PROMPTS}
          value={factsText}
          onChange={setFactsText}
          placeholder="что факт, а что — моя мысль…"
          saving={saving}
          error={status === 'error'}
          onBack={() => setRung('ground')}
          onLater={save}
          onNext={() => advance(factsText, 'examine')}
        />
      )}

      {rung === 'examine' && (
        <RungInput
          prompts={examinePrompts}
          value={examineText}
          onChange={setExamineText}
          placeholder="что я вижу теперь…"
          saving={saving}
          error={status === 'error'}
          onBack={() => setRung('facts')}
          onLater={save}
          onNext={() => advance(examineText, 'self')}
        />
      )}

      {rung === 'self' && (
        <RungInput
          prompts={SELF_PROMPTS}
          value={selfText}
          onChange={setSelfText}
          placeholder="что я узнала о себе…"
          saving={saving}
          error={status === 'error'}
          onBack={() => setRung('examine')}
          onLater={save}
          onNext={() => advance(selfText, 'alternative')}
        />
      )}

      {rung === 'alternative' && (
        <RungInput
          prompts={ALTERNATIVE_PROMPTS}
          value={altText}
          onChange={setAltText}
          placeholder="бережнее это звучит так…"
          saving={saving}
          error={status === 'error'}
          onBack={() => setRung('self')}
          onLater={save}
          onNext={() => advance(altText, 'gift')}
        />
      )}

      {rung === 'gift' && (
        <div className="space-y-3">
          {reframe ? (
            <div className="space-y-1.5">
              <p className="text-ink-muted/70 text-xs">и ещё один взгляд на это</p>
              <p className="font-display text-ink text-lg leading-snug">«{reframe}»</p>
            </div>
          ) : (
            <p className="font-display text-ink text-lg leading-snug">
              Побудь с тем, что ты увидела.
            </p>
          )}
          {status === 'error' && (
            <p className="text-danger text-sm">Связь прервалась… попробуй ещё раз</p>
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setRung('alternative')}
              className="text-ink-muted hover:text-gold rounded-full px-3 py-1.5 text-sm transition-colors duration-200"
            >
              ← назад
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="btn-gold mr-0 ml-auto h-10 px-5 text-sm disabled:opacity-50"
            >
              {saving ? '…' : 'Сохранить в свет'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type PositiveRung = 'ground' | 'source' | 'meaning' | 'carry' | 'bloom';

/**
 * Светлая дуга осмысления (savoring) — зеркало негативной. Светлое НЕ оспариваем: длим и
 * заякориваем. Вернуться к свету (ground) → что это питало/благодарность (source) → что это
 * говорит о тебе и что ценно (meaning; при положительном убеждении — ЗАЯКОРИТЬ его регистром
 * ANCHOR_BELIEF, а не расшатать) → что забрать (carry) → опора-благословение (bloom). Шаг «побыть
 * в теле/дыхании» намеренно опущен: дыхание и локализация в теле уже прожиты при записи.
 * Содержание — reflection-method (savoring/broaden-and-build), тон — spiritual-voice.
 *
 * Безопасность (§6) идентична негативной дуге: каждый свободный ввод — клиентский keyword-слой
 * на «дальше» (+ флаг куратору через checkAwarenessCrisisAction) и серверная проверка в
 * addAwarenessAction; острое состояние в дневник не пишем и чистим введённое (enterCrisis).
 */
function PositiveLadder({ entry, onSaved, onCancel }: LadderProps) {
  const [rung, setRung] = useState<PositiveRung>('ground');
  const [sourceText, setSourceText] = useState('');
  const [meaningText, setMeaningText] = useState('');
  const [carryText, setCarryText] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [crisis, setCrisis] = useState(false);

  // Светлое убеждение (переустановка из каталога) — есть что заякорить; иначе ведём в ценность.
  const affirmation = thoughtLabel(entry);
  const meaningPrompts = affirmation ? ANCHOR_BELIEF_PROMPTS : POSITIVE_MEANING_PROMPTS;

  function enterCrisis(): void {
    setSourceText('');
    setMeaningText('');
    setCarryText('');
    setStatus('idle');
    setCrisis(true);
  }

  async function advance(text: string, next: PositiveRung): Promise<void> {
    const trimmed = text.trim();
    if (trimmed && detectCrisis(trimmed).triggered) {
      await checkAwarenessCrisisAction(trimmed);
      enterCrisis();
      return;
    }
    setRung(next);
  }

  async function save(): Promise<void> {
    const awareness = [sourceText, meaningText, carryText]
      .map((t) => t.trim())
      .filter(Boolean)
      .join('\n\n');
    if (!awareness) {
      onCancel();
      return;
    }
    setStatus('saving');
    const result = await addAwarenessAction({ entryId: entry.id, text: awareness });
    if ('crisis' in result) {
      enterCrisis();
    } else if ('ok' in result) {
      onSaved(awareness);
    } else {
      setStatus('error');
    }
  }

  if (crisis) {
    return (
      <div className="bg-surface-raised rounded-xl p-4">
        <CrisisSupport
          onBack={() => {
            setCrisis(false);
            onCancel();
          }}
        />
      </div>
    );
  }

  const saving = status === 'saving';

  return (
    <div className="animate-fade-up space-y-3">
      {rung === 'ground' && (
        <div className="space-y-3">
          {entry.situation ? (
            <div className="space-y-1.5">
              <p className="font-display text-ink text-lg leading-snug">
                Вернись в этот светлый момент.
              </p>
              <p className="text-ink/85 bg-canvas/50 rounded-lg px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line">
                {entry.situation}
              </p>
            </div>
          ) : (
            <p className="font-display text-ink text-lg leading-snug">
              Вернись к этому светлому чувству.
            </p>
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="text-ink-muted hover:text-gold rounded-full px-3 py-1.5 text-sm transition-colors duration-200"
            >
              позже
            </button>
            <button
              type="button"
              onClick={() => setRung('source')}
              className="bg-surface-raised text-ink ring-gold/40 hover:ring-gold hover:shadow-glow-soft mr-0 ml-auto h-10 rounded-lg px-5 text-sm ring-1 transition-all duration-300"
            >
              дальше
            </button>
          </div>
        </div>
      )}

      {rung === 'source' && (
        <RungInput
          prompts={SOURCE_PROMPTS}
          value={sourceText}
          onChange={setSourceText}
          placeholder="что это вырастило…"
          saving={saving}
          error={status === 'error'}
          onBack={() => setRung('ground')}
          onLater={save}
          onNext={() => advance(sourceText, 'meaning')}
        />
      )}

      {rung === 'meaning' && (
        <RungInput
          prompts={meaningPrompts}
          value={meaningText}
          onChange={setMeaningText}
          placeholder="что мне в этом важно…"
          saving={saving}
          error={status === 'error'}
          onBack={() => setRung('source')}
          onLater={save}
          onNext={() => advance(meaningText, 'carry')}
        />
      )}

      {rung === 'carry' && (
        <RungInput
          prompts={CARRY_PROMPTS}
          value={carryText}
          onChange={setCarryText}
          placeholder="что забираю с собой…"
          saving={saving}
          error={status === 'error'}
          onBack={() => setRung('meaning')}
          onLater={save}
          onNext={() => advance(carryText, 'bloom')}
        />
      )}

      {rung === 'bloom' && (
        <div className="space-y-3">
          {affirmation ? (
            <div className="space-y-1.5">
              <p className="text-ink-muted/70 text-xs">пусть это останется с тобой</p>
              <p className="font-display text-ink text-lg leading-snug">«{affirmation}»</p>
            </div>
          ) : (
            <p className="font-display text-ink text-lg leading-snug">Побудь с этим светом.</p>
          )}
          {status === 'error' && (
            <p className="text-danger text-sm">Связь прервалась… попробуй ещё раз</p>
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setRung('carry')}
              className="text-ink-muted hover:text-gold rounded-full px-3 py-1.5 text-sm transition-colors duration-200"
            >
              ← назад
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="btn-gold mr-0 ml-auto h-10 px-5 text-sm disabled:opacity-50"
            >
              {saving ? '…' : 'Сохранить в свет'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Один шаг-ввод лестницы: вопрос-приглашение (с ротацией «другой вопрос»), поле, навигация.
 * Ротацию вопроса держит у себя — родителю незачем считать индексы по каждому рунгу.
 */
function RungInput({
  prompts,
  value,
  onChange,
  placeholder,
  saving,
  error,
  onBack,
  onLater,
  onNext,
}: {
  prompts: readonly string[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  saving: boolean;
  /** Сохранение через «позже» с этого рунга не удалось — показать тёплую ошибку прямо тут. */
  error?: boolean;
  onBack: () => void;
  onLater: () => void;
  onNext: () => void;
}) {
  const [index, setIndex] = useState(0);
  const prompt = prompts[index % prompts.length];

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <p className="font-display text-ink text-lg leading-snug">{prompt}</p>
        {prompts.length > 1 && (
          <button
            type="button"
            onClick={() => setIndex((i) => i + 1)}
            className="text-ink-muted hover:text-gold text-xs underline-offset-4 transition-colors duration-200"
          >
            другой вопрос
          </button>
        )}
      </div>

      <textarea
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={1000}
        rows={3}
        className="bg-canvas/60 text-ink placeholder:text-ink-muted/50 focus:ring-gold/40 w-full resize-none rounded-lg px-3.5 py-3 text-sm leading-relaxed focus:ring-1 focus:outline-none"
      />
      {error && <p className="text-danger text-sm">Связь прервалась… попробуй ещё раз</p>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-ink-muted hover:text-gold rounded-full px-3 py-1.5 text-sm transition-colors duration-200"
        >
          ← назад
        </button>
        <button
          type="button"
          onClick={onLater}
          disabled={saving}
          className="text-ink-muted hover:text-gold rounded-full px-3 py-1.5 text-sm transition-colors duration-200 disabled:opacity-50"
        >
          позже
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={saving}
          className="bg-surface-raised text-ink ring-gold/40 enabled:hover:ring-gold enabled:hover:shadow-glow-soft mr-0 ml-auto h-10 rounded-lg px-5 text-sm ring-1 transition-all duration-300 disabled:opacity-50"
        >
          {saving ? '…' : 'дальше'}
        </button>
      </div>
    </div>
  );
}
