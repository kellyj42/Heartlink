import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

type AdminUserUpdatePayload = {
  fullName: string;
  email: string;
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const payload = (await request.json()) as AdminUserUpdatePayload;
    const supabase = getAdminClient();
    const email = payload.email.trim().toLowerCase();
    const fullName = payload.fullName.trim();

    const { error: authError } = await supabase.auth.admin.updateUserById(id, {
      email,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (authError) {
      throw authError;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        email,
        role: payload.role,
        status: payload.status,
      })
      .eq("id", id)
      .select(
        "id, full_name, email, role, status, matchmaking_answers, created_at",
      )
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ user: data });
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Could not update user.") },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = getAdminClient();
    const { error } = await supabase.auth.admin.deleteUser(id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Could not delete user.") },
      { status: 500 },
    );
  }
}
