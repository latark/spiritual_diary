import { getLightBodyState } from '@/entities/light-body/server';
import { RecordEmotionScreen } from '@/views/record';

export default async function RecordPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  // Первая запись вообще (0 очков тела света) → на экране завершения один раз показываем,
  // что произошло и где это искать. Дальше эта строка не нужна.
  const lb = await getLightBodyState();
  const firstEver = (lb?.points ?? 0) === 0;
  return <RecordEmotionScreen targetDate={date} firstEver={firstEver} />;
}
