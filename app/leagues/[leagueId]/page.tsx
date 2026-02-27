import { LeagueDetailPage } from "@/components/leagues/detail/LeagueDetailPage";
import { SEED_LEAGUE_IDS } from "@/lib/leagues/seed";

export function generateStaticParams() {
  return SEED_LEAGUE_IDS.map((leagueId) => ({ leagueId }));
}

interface Props {
  params: Promise<{ leagueId: string }>;
}

export default async function LeagueDetailRoute({ params }: Props) {
  const { leagueId } = await params;
  return <LeagueDetailPage leagueId={leagueId} />;
}
