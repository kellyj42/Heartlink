import MatchDetailsContent from "./MatchDetailsContent";

export default async function MatchDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <MatchDetailsContent profileId={id} />;
}
