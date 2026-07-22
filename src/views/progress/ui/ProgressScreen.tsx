import { getEnergyEntries, getReturnCandidates } from '@/entities/emotion-entry/server';
import { EnergyPanel } from '@/features/energy-map';
import { selectReturnMoments, WeeklyReturn } from '@/features/weekly-return';
import { WeeklyDevTrigger, WeeklyMessageCard } from '@/features/weekly-analysis';
import { getLatestWeeklyAnalysis } from '@/features/weekly-analysis/server';

import type { ChakraProfile } from '@/shared/content/chakras';
import { getProfile } from '@/shared/lib/auth';
import { PageHeader } from '@/shared/ui/PageHeader';

import { PathTabs } from './PathTabs';

export async function ProgressScreen() {
  const [candidates, energyEntries, weekly, profile] = await Promise.all([
    getReturnCandidates(),
    getEnergyEntries(),
    getLatestWeeklyAnalysis(),
    getProfile(),
  ]);

  const moments = selectReturnMoments(candidates);
  const chakraProfile = (profile?.chakra_profile ?? null) as ChakraProfile | null;

  return (
    <div className="flex flex-col gap-8 pt-6">
      <PageHeader
        title="Путь"
        subtitle="Здесь виден твой путь. Всё, что ты прожила, остаётся в тебе светом."
        hint="«Путь» — про общее движение: энергия тела и осмысление прожитого, послание проводника. А «Память» — архив дней, куда можно вернуться к любой записи."
      />

      {/* Послание проводника — герой «Пути» (еженедельный ИИ-синтез). */}
      <WeeklyMessageCard analysis={weekly} />
      <WeeklyDevTrigger />

      {/* Две природы «Пути» — телесно-энергетическая (чакры) и смысловая (инсайт). Лента
          осознаний («Твой свет») переехала в «Память» как часть архива смысла. */}
      <PathTabs
        energy={<EnergyPanel initialProfile={chakraProfile} entries={energyEntries} />}
        awareness={<WeeklyReturn moments={moments} />}
      />
    </div>
  );
}
