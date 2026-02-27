import { SeasonDetailPage } from "@/components/leagues/seasons/SeasonDetailPage";
import { SEED_LEAGUE_IDS, SEED_SEASON_IDS } from "@/lib/leagues/seed";

export function generateStaticParams() {
  return SEED_LEAGUE_IDS.flatMap((leagueId) =>
    (SEED_SEASON_IDS[leagueId] ?? []).map((seasonId) => ({ leagueId, seasonId }))
  );
}

interface Props {
  params: Promise<{ leagueId: string; seasonId: string }>;
}

export default async function SeasonDetailRoute({ params }: Props) {
  const { leagueId, seasonId } = await params;
  return <SeasonDetailPage leagueId={leagueId} seasonId={seasonId} />;
}
