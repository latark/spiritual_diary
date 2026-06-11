'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

import { InsightLadder } from './InsightLadder';
import type { EmotionEntry } from '../model/types';

/**
 * Общий экран осмысления поверх любой страницы: оверлей с лестницей проработки (InsightLadder)
 * на конкретной записи. Открывается и из «Памяти» (по выбранной записи), и из курируемого
 * «Инсайта» — рефлексия живёт одним опытом, а не дублируется по вкладкам. «Память» при этом
 * остаётся хранилищем (read-only): она лишь открывает эту дверь, не держит логику осмысления.
 *
 * Мобайл — нижний лист, десктоп — центрированное окно. Закрытие: фон, Escape, «позже» внутри
 * лестницы. На время показа блокируем прокрутку фона.
 *
 * Рендерим порталом в body: панель «Памяти» с backdrop-blur создаёт containing block для
 * fixed-потомков — без портала оверлей заперло бы внутри панели, а не поверх всего экрана.
 */
export function ReflectionOverlay({
  entry,
  onSaved,
  onClose,
}: {
  entry: EmotionEntry;
  onSaved: (awareness: string) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  // Рендерится только по клику (клиентское состояние), при SSR его в дереве нет — гард на случай
  // любого серверного пути, без гидрационного рассинхрона.
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Осмыслить запись"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
    >
      <button
        type="button"
        aria-label="Закрыть"
        onClick={onClose}
        className="bg-canvas/70 absolute inset-0 backdrop-blur-sm"
      />
      <div className="animate-fade-up bg-surface ring-gold/12 shadow-glow-soft relative z-10 max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl p-5 ring-1 sm:rounded-3xl">
        <InsightLadder entry={entry} onSaved={onSaved} onCancel={onClose} />
      </div>
    </div>,
    document.body,
  );
}
