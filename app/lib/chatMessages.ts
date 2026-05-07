import { supabase } from "@/app/lib/supabase";
import { getRequestWithUser } from "@/app/lib/connectionRequests";
import { getUserProfileById, StoredUser } from "@/app/lib/localUsers";

export type ChatMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

type ChatMessageRow = {
  id: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

function mapChatMessage(row: ChatMessageRow): ChatMessage {
  return {
    id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    body: row.body,
    createdAt: row.created_at,
    readAt: row.read_at,
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return fallback;
}

export async function getCurrentAuthUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Please login first.");
  }

  return user.id;
}

export async function getAcceptedChatAccess(otherUserId: string) {
  const currentUserId = await getCurrentAuthUserId();
  const request = await getRequestWithUser(otherUserId);

  if (!request || request.status !== "accepted") {
    return {
      currentUserId,
      otherUser: null as StoredUser | null,
      canChat: false,
    };
  }

  return {
    currentUserId,
    otherUser: await getUserProfileById(otherUserId),
    canChat: true,
  };
}

export async function getChatMessages(otherUserId: string) {
  const currentUserId = await getCurrentAuthUserId();

  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .or(
      `and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`,
    )
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(getErrorMessage(error, "Could not load messages."));
  }

  return (data ?? []).map((message) =>
    mapChatMessage(message as ChatMessageRow),
  );
}

export async function sendChatMessage(otherUserId: string, body: string) {
  const senderId = await getCurrentAuthUserId();

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      sender_id: senderId,
      receiver_id: otherUserId,
      body: body.trim(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(getErrorMessage(error, "Could not send message."));
  }

  return mapChatMessage(data as ChatMessageRow);
}

export async function getReceivedMessageCount() {
  const currentUserId = await getCurrentAuthUserId();

  const { data, error } = await supabase
    .from("chat_messages")
    .select("id")
    .eq("receiver_id", currentUserId)
    .is("read_at", null);

  if (error) {
    throw new Error(getErrorMessage(error, "Could not load messages."));
  }

  return data?.length ?? 0;
}

export async function markChatMessagesRead(otherUserId: string) {
  const currentUserId = await getCurrentAuthUserId();

  const { error } = await supabase
    .from("chat_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("sender_id", otherUserId)
    .eq("receiver_id", currentUserId)
    .is("read_at", null);

  if (error) {
    throw new Error(getErrorMessage(error, "Could not mark messages as read."));
  }
}
