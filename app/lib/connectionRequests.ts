import { supabase } from "@/app/lib/supabase";
import { mapProfileRow, ProfileRow, StoredUser } from "@/app/lib/localUsers";

export type ConnectionRequestStatus = "pending" | "accepted" | "denied";

export type ConnectionRequest = {
  id: string;
  senderId: string;
  receiverId: string;
  status: ConnectionRequestStatus;
  createdAt: string;
  respondedAt: string | null;
};

export type ConnectionRequestWithProfiles = ConnectionRequest & {
  sender: StoredUser | null;
  receiver: StoredUser | null;
};

type ConnectionRequestRow = {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: ConnectionRequestStatus;
  created_at: string;
  responded_at: string | null;
};

function mapConnectionRequest(row: ConnectionRequestRow): ConnectionRequest {
  return {
    id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    status: row.status,
    createdAt: row.created_at,
    respondedAt: row.responded_at,
  };
}

function getSupabaseErrorMessage(error: unknown, fallback: string) {
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

function getSupabaseErrorCode(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return "";
}

async function getCurrentAuthUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Please login first.");
  }

  return user.id;
}

async function loadProfilesById(ids: string[]) {
  const uniqueIds = Array.from(new Set(ids));

  if (uniqueIds.length === 0) {
    return new Map<string, StoredUser>();
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("id", uniqueIds);

  if (error) {
    throw new Error(getSupabaseErrorMessage(error, "Could not load profiles."));
  }

  return new Map(
    (data ?? []).map((profile) => {
      const user = mapProfileRow(profile as ProfileRow);
      return [user.id, user];
    }),
  );
}

export async function getRequestWithUser(otherUserId: string) {
  const currentUserId = await getCurrentAuthUserId();

  const { data, error } = await supabase
    .from("connection_requests")
    .select("*")
    .or(
      `and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`,
    )
    .maybeSingle();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error, "Could not load request."));
  }

  return data ? mapConnectionRequest(data as ConnectionRequestRow) : null;
}

export async function sendConnectionRequest(receiverId: string) {
  const senderId = await getCurrentAuthUserId();

  const { data, error } = await supabase
    .from("connection_requests")
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    if (getSupabaseErrorCode(error) === "23505") {
      const existingRequest = await getRequestWithUser(receiverId);

      if (existingRequest) {
        return existingRequest;
      }
    }

    throw new Error(
      getSupabaseErrorMessage(error, "Could not send connection request."),
    );
  }

  return mapConnectionRequest(data as ConnectionRequestRow);
}

export async function respondToConnectionRequest(
  requestId: string,
  status: "accepted" | "denied",
) {
  const { data, error } = await supabase
    .from("connection_requests")
    .update({
      status,
      responded_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .select()
    .single();

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(error, "Could not respond to request."),
    );
  }

  return mapConnectionRequest(data as ConnectionRequestRow);
}

export async function getMyConnectionRequests() {
  const currentUserId = await getCurrentAuthUserId();

  const { data, error } = await supabase
    .from("connection_requests")
    .select("*")
    .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(getSupabaseErrorMessage(error, "Could not load requests."));
  }

  const requests = (data ?? []).map((row) =>
    mapConnectionRequest(row as ConnectionRequestRow),
  );
  const profiles = await loadProfilesById(
    requests.flatMap((request) => [request.senderId, request.receiverId]),
  );

  return {
    currentUserId,
    requests: requests.map((request) => ({
      ...request,
      sender: profiles.get(request.senderId) ?? null,
      receiver: profiles.get(request.receiverId) ?? null,
    })),
  };
}
