import { ReturnMomentCard } from './ReturnMomentCard';
import type { ReturnMoment } from '../model/types';

/**
 * «Инсайт» — самые сильные чувства недельной давности, к которым можно вернуться и записать
 * осознание уже с дистанции. Презентационный компонент: моменты приходят сверху
 * (сейчас — моки, позже — серверный запрос).
 */
export function WeeklyReturn({ moments }: { moments: ReturnMoment[] }) {
  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2 className="font-display text-ink text-2xl">Инсайт</h2>
        <p className="text-ink-muted text-sm leading-relaxed">
          Неделю назад эти чувства звучали в тебе. Что ты понимаешь об этом теперь?
        </p>
      </header>

      {moments.length === 0 ? (
        <p className="text-ink-muted/80 text-sm leading-relaxed">
          Здесь пока тихо. Записи этой недели сами вернутся к тебе через семь дней.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {moments.map((moment) => (
            <ReturnMomentCard key={moment.id} moment={moment} />
          ))}
        </div>
      )}
    </section>
  );
}
