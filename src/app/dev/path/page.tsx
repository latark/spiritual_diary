import { ProgressScreen } from '@/views/progress';

// Стенд для проверки вкладки «Путь» (инсайт + диаграмма энергий) без логина. На моках.
export default function DevPathPage() {
  return (
    <div className="mx-auto max-w-5xl px-5">
      <ProgressScreen />
    </div>
  );
}
