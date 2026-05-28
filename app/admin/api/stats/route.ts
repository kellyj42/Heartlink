import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env.local to enable admin stats.",
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function GET() {
  try {
    const supabase = getAdminClient();

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // total users
    const { count: totalUsersCount, error: totalUsersError } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });

    if (totalUsersError) throw totalUsersError;

    // new users in last 7 days
    const { count: newUsersCount, error: newUsersError } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo);

    if (newUsersError) throw newUsersError;

    // complete profiles (matchmaking_answers not null)
    const { count: completeProfilesCount, error: completeError } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .not("matchmaking_answers", "is", null);

    if (completeError) throw completeError;

    // connection requests: matches (accepted) and pending
    const { count: totalMatchesCount, error: totalMatchesError } = await supabase
      .from("connection_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "accepted");

    if (totalMatchesError) throw totalMatchesError;

    const { count: newMatchesCount, error: newMatchesError } = await supabase
      .from("connection_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "accepted")
      .gte("responded_at", sevenDaysAgo);

    if (newMatchesError) throw newMatchesError;

    const { count: pendingRequestsCount, error: pendingError } = await supabase
      .from("connection_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");

    if (pendingError) throw pendingError;

    // recent activities: recent signups and recent connection request events
    const { data: recentProfilesData } = await supabase
      .from("profiles")
      .select("id, full_name, email, created_at")
      .order("created_at", { ascending: false })
      .limit(8);

    const { data: recentRequestsData } = await supabase
      .from("connection_requests")
      .select("id, sender_id, receiver_id, status, created_at, responded_at")
      .order("created_at", { ascending: false })
      .limit(12);

    const recentProfiles = (recentProfilesData ?? []).map((p: any) => ({
      type: "signup",
      text: `New user: ${p.full_name ?? "Unnamed"} ${p.email ? `(${p.email})` : ""}`,
      time: p.created_at,
    }));

    const recentRequests = (recentRequestsData ?? []).map((r: any) => {
      const when = r.responded_at ?? r.created_at;
      const verb = r.status === "accepted" ? "accepted a match" : r.status === "denied" ? "denied a request" : "sent a request";
      return {
        type: "request",
        text: `${r.sender_id} ${verb} with ${r.receiver_id}`,
        time: when,
      };
    });

    const combined = [...recentProfiles, ...recentRequests].sort((a, b) => {
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });

    const recentActivities = combined.slice(0, 6);

    return NextResponse.json({
      totalUsers: totalUsersCount ?? 0,
      newUsersLast7Days: newUsersCount ?? 0,
      completeProfiles: completeProfilesCount ?? 0,
      totalMatches: totalMatchesCount ?? 0,
      newMatchesLast7Days: newMatchesCount ?? 0,
      pendingRequests: pendingRequestsCount ?? 0,
      recentActivities,
    });
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Could not load stats.") },
      { status: 500 },
    );
  }
}
