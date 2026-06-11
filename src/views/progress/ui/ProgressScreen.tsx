import { getEnergyEntries, getReturnCandidates } from '@/entities/emotion-entry/server';
import { EnergyPanel } from '@/features/energy-map';
import { selectReturnMoments, WeeklyReturn } from '@/features/weekly-return';

import { createSupabaseServerClient } from '@/shared/api/supabase';
import type { ChakraProfile } from '@/shared/content/chakras';
import { PageHeader } from '@/shared/ui/PageHeader';

import { PathTabs } from './PathTabs';

export async function ProgressScreen() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [candidates, energyEntries, profileRow] = await Promise.all([
    getReturnCandidates(),
    getEnergyEntries(),
    user
      ? supabase.from('profiles').select('chakra_profile').eq('id', user.id).single()
      : Promise.resolve({ data: null }),
  ]);

  const moments = selectReturnMoments(candidates);
  const chakraProfile = (profileRow.data?.chakra_profile ?? null) as ChakraProfile | null;

  return (
    <div className="flex flex-col gap-8 pt-6">
      <PageHeader
        title="Путь"
        subtitle="Здесь виден твой путь. Всё, что ты прожила, остаётся в тебе светом."
      />

      {/* Две природы «Пути» — телесно-энергетическая (чакры) и смысловая (инсайт). Лента
          осознаний («Твой свет») переехала в «Память» как часть архива смысла. */}
      <PathTabs
        energy={<EnergyPanel initialProfile={chakraProfile} entries={energyEntries} />}
        awareness={<WeeklyReturn moments={moments} />}
      />
    </div>
  );
}
