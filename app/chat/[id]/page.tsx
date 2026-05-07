import AppShell from "@/app/components/layouts/AppShell";
import ChatContent from "./ChatContent";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell>
      <ChatContent otherUserId={id} />
    </AppShell>
  );
}
