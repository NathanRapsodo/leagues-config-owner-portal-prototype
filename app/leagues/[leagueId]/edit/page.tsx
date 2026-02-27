import { CreateLeagueForm } from "@/components/leagues/CreateLeagueForm";
import { SEED_LEAGUE_IDS } from "@/lib/leagues/seed";

export function generateStaticParams() {
  return SEED_LEAGUE_IDS.map((leagueId) => ({ leagueId }));
}

interface Props {
  params: Promise<{ leagueId: string }>;
}

export default async function EditLeaguePage({ params }: Props) {
  const { leagueId } = await params;
  return <CreateLeagueForm leagueId={leagueId} />;
}
