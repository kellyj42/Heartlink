import AppShell from "@/app/components/layouts/AppShell";
import VideoCallContent from "./VideoCallContent";

export default async function VideoCallPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell>
      <VideoCallContent otherUserId={id} />
    </AppShell>
  );
}
