import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

type ReportType = "users" | "matches" | "messages" | "likes";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env.local to enable admin reports.",
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

function escapeCsvValue(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);
  const escaped = stringValue.replace(/"/g, '""');

  if (escaped.includes(",") || escaped.includes("\n") || escaped.includes("\r") || escaped.includes("\"")) {
    return `"${escaped}"`;
  }

  return escaped;
}

function buildCsv(headers: string[], rows: Record<string, unknown>[]) {
  const headerRow = headers.join(",");
  const bodyRows = rows.map((row) =>
    headers
      .map((header) => escapeCsvValue(row[header] ?? ""))
      .join(","),
  );

  return [headerRow, ...bodyRows].join("\r\n");
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const type = (url.searchParams.get("type") || "users") as ReportType;
    const format = (url.searchParams.get("format") || "csv").toLowerCase();
    const supabase = getAdminClient();

    let headers: string[] = [];
    let rows: Record<string, unknown>[] = [];

    switch (type) {
      case "users": {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            "id, full_name, email, role, status, gender, dating_goal, created_at, updated_at",
          )
          .order("created_at", { ascending: false });

        if (error) throw error;

        headers = [
          "id",
          "full_name",
          "email",
          "role",
          "status",
          "gender",
          "dating_goal",
          "created_at",
          "updated_at",
        ];
        rows = (data ?? []) as Record<string, unknown>[];
        break;
      }

      case "matches": {
        const { data, error } = await supabase
          .from("connection_requests")
          .select(
            "id, sender_id, receiver_id, status, created_at, responded_at, sender:sender_id(full_name,email), receiver:receiver_id(full_name,email)",
          )
          .order("created_at", { ascending: false });

        if (error) throw error;

        headers = [
          "id",
          "sender_id",
          "sender_name",
          "sender_email",
          "receiver_id",
          "receiver_name",
          "receiver_email",
          "status",
          "created_at",
          "responded_at",
        ];
        rows = (data ?? []).map((item: any) => ({
          id: item.id,
          sender_id: item.sender_id,
          sender_name: item.sender?.full_name ?? "",
          sender_email: item.sender?.email ?? "",
          receiver_id: item.receiver_id,
          receiver_name: item.receiver?.full_name ?? "",
          receiver_email: item.receiver?.email ?? "",
          status: item.status,
          created_at: item.created_at,
          responded_at: item.responded_at,
        }));
        break;
      }

      case "messages": {
        const { data, error } = await supabase
          .from("chat_messages")
          .select(
            "id, sender_id, receiver_id, body, created_at, read_at, sender:sender_id(full_name,email), receiver:receiver_id(full_name,email)",
          )
          .order("created_at", { ascending: false });

        if (error) throw error;

        headers = [
          "id",
          "sender_id",
          "sender_name",
          "sender_email",
          "receiver_id",
          "receiver_name",
          "receiver_email",
          "body",
          "created_at",
          "read_at",
        ];
        rows = (data ?? []).map((item: any) => ({
          id: item.id,
          sender_id: item.sender_id,
          sender_name: item.sender?.full_name ?? "",
          sender_email: item.sender?.email ?? "",
          receiver_id: item.receiver_id,
          receiver_name: item.receiver?.full_name ?? "",
          receiver_email: item.receiver?.email ?? "",
          body: item.body,
          created_at: item.created_at,
          read_at: item.read_at,
        }));
        break;
      }

      case "likes": {
        const { data, error } = await supabase
          .from("photo_likes")
          .select(
            "id, profile_id, image_url, liker_id, created_at, profile:profile_id(full_name,email), liker:liker_id(full_name,email)",
          )
          .order("created_at", { ascending: false });

        if (error) throw error;

        headers = [
          "id",
          "profile_id",
          "profile_name",
          "profile_email",
          "image_url",
          "liker_id",
          "liker_name",
          "liker_email",
          "created_at",
        ];
        rows = (data ?? []).map((item: any) => ({
          id: item.id,
          profile_id: item.profile_id,
          profile_name: item.profile?.full_name ?? "",
          profile_email: item.profile?.email ?? "",
          image_url: item.image_url,
          liker_id: item.liker_id,
          liker_name: item.liker?.full_name ?? "",
          liker_email: item.liker?.email ?? "",
          created_at: item.created_at,
        }));
        break;
      }

      default:
        return NextResponse.json(
          { message: "Unknown report type. Use users, matches, messages, or likes." },
          { status: 400 },
        );
    }

    if (format === "json") {
      return NextResponse.json({ data: rows });
    }

    const csv = buildCsv(headers, rows);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${type}-report.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: getErrorMessage(error, "Could not build report."),
      },
      { status: 500 },
    );
  }
}
