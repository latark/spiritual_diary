import { RecordEmotionScreen } from '@/views/record';

export default async function RecordPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  return <RecordEmotionScreen targetDate={date} />;
}
