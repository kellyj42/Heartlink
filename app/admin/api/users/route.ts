import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

type AdminUserPayload = {
  id?: string;
  fullName: string;
  email: string;
  password?: string;
  role: "user" | "moderator" | "admin";
  status: "active" | "paused" | "review" | "blocked";
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env.local to enable admin CRUD.",
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function normalizePayload(payload: AdminUserPayload) {
  return {
    fullName: payload.fullName.trim(),
    email: payload.email.trim().toLowerCase(),
    role: payload.role || "user",
    status: payload.status || "active",
  };
}

export async function GET() {
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, full_name, email, role, status, matchmaking_answers, created_at",
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ users: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Could not load users.") },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as AdminUserPayload;
    const normalized = normalizePayload(payload);

    if (!normalized.fullName || !normalized.email) {
      return NextResponse.json(
        { message: "Full name and email are required." },
        { status: 400 },
      );
    }

    const supabase = getAdminClient();
    const password = payload.password?.trim() || "Heartlink123!";

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: normalized.email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: normalized.fullName,
        },
      });

    if (authError) {
      throw authError;
    }

    const userId = authData.user?.id;

    if (!userId) {
      throw new Error("Supabase did not return a created user id.");
    }

    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          full_name: normalized.fullName,
          email: normalized.email,
          role: normalized.role,
          status: normalized.status,
        },
        { onConflict: "id" },
      )
      .select(
        "id, full_name, email, role, status, matchmaking_answers, created_at",
      )
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ user: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Could not create user.") },
      { status: 500 },
    );
  }
}
