import { Suspense } from "react";
import { CreateSeasonWizard } from "@/components/leagues/seasons/CreateSeasonWizard";
import { SEED_LEAGUE_IDS } from "@/lib/leagues/seed";

export function generateStaticParams() {
  return SEED_LEAGUE_IDS.map((leagueId) => ({ leagueId }));
}

interface Props {
  params: Promise<{ leagueId: string }>;
}

// searchParams is read client-side in CreateSeasonWizard via useSearchParams
export default async function NewSeasonPage({ params }: Props) {
  const { leagueId } = await params;
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground text-sm">Loading…</div>}>
      <CreateSeasonWizard leagueId={leagueId} />
    </Suspense>
  );
}
