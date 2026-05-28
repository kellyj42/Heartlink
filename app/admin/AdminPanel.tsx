"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  FileText,
  Gauge,
  HeartHandshake,
  LayoutDashboard,
  MessageSquareWarning,
  Pencil,
  Plus,
  RefreshCw,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  UsersRound,
  X,
  Download,
} from "lucide-react";

type AdminView =
  | "overview"
  | "users"
  | "matches"
  | "reports"
  | "content"
  | "settings";
type UserRole = "user" | "moderator" | "admin";
type UserStatus = "active" | "paused" | "review" | "blocked";

type AdminUserRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole | null;
  status: UserStatus | null;
  matchmaking_answers: unknown | null;
  created_at: string | null;
};

type UserFormState = {
  id?: string;
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
};

const navItems: {
  id: AdminView;
  label: string;
  description: string;
  Icon: typeof LayoutDashboard;
}[] = [
  {
    id: "overview",
    label: "Overview",
    description: "Platform health",
    Icon: LayoutDashboard,
  },
  {
    id: "users",
    label: "Users",
    description: "Visible profiles",
    Icon: UsersRound,
  },
  {
    id: "matches",
    label: "Match Controls",
    description: "User experience",
    Icon: HeartHandshake,
  },
  {
    id: "reports",
    label: "Reports",
    description: "Safety queue",
    Icon: MessageSquareWarning,
  },
  {
    id: "content",
    label: "Content",
    description: "Text users see",
    Icon: FileText,
  },
  {
    id: "settings",
    label: "Settings",
    description: "Interface toggles",
    Icon: Settings,
  },
];

const stats = [
  { label: "Total Users", value: "1,284", note: "+18 this week" },
  { label: "Complete Profiles", value: "892", note: "69% completion" },
  { label: "Pending Reports", value: "7", note: "2 high priority" },
  { label: "Active Matches", value: "346", note: "Live suggestions" },
];

const reports = [
  {
    title: "Profile photo concern",
    user: "Brian K.",
    priority: "Medium",
    status: "Open",
  },
  {
    title: "Spam message report",
    user: "Unknown sender",
    priority: "High",
    status: "Open",
  },
  {
    title: "Incorrect profile details",
    user: "Claire M.",
    priority: "Low",
    status: "Queued",
  },
];

const reportOptions = [
  {
    id: "users",
    title: "User Report",
    description:
      "Download a CSV of all registered profiles and account metadata.",
  },
  {
    id: "matches",
    title: "Matches Report",
    description:
      "Download recent connection requests, accept/deny status, and matched user details.",
  },
  {
    id: "messages",
    title: "Chat Messages Report",
    description:
      "Download recent chat message activity for review and auditing.",
  },
  {
    id: "likes",
    title: "Photo Likes Report",
    description:
      "Download likes history for profile images and the users who liked them.",
  },
];

const contentItems = [
  {
    title: "Signup welcome message",
    copy: "Create your account and begin building a profile that fits the HeartLink experience.",
  },
  {
    title: "Questions helper text",
    copy: "Tell HeartLink who fits you best.",
  },
  {
    title: "Empty matches message",
    copy: "No perfect matches yet. Showing all other users from the database.",
  },
];

const interfaceToggles = [
  {
    label: "Show profile completion badge",
    enabled: true,
    area: "Dashboard",
  },
  {
    label: "Allow WhatsApp contact display",
    enabled: true,
    area: "Match details",
  },
  {
    label: "Require photo before matching",
    enabled: false,
    area: "Questions",
  },
  {
    label: "Show report action on profiles",
    enabled: true,
    area: "Safety",
  },
];

function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-red-100">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-gray-950">{value}</p>
      <p className="mt-2 text-sm text-gray-500">{note}</p>
    </div>
  );
}

function StatusPill({ value }: { value: string }) {
  const isGood = [
    "Visible",
    "Complete",
    "Low",
    "Enabled",
    "active",
    "admin",
  ].includes(value);
  const isWarning = [
    "Review",
    "Medium",
    "Queued",
    "review",
    "moderator",
    "paused",
  ].includes(value);

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        isGood
          ? "bg-emerald-50 text-emerald-700"
          : isWarning
            ? "bg-amber-50 text-amber-700"
            : "bg-red-50 text-red-700"
      }`}
    >
      {value}
    </span>
  );
}

function PanelHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-red-600">
        Admin Panel
      </p>
      <h1 className="mt-3 text-3xl font-bold text-gray-950">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
        {subtitle}
      </p>
    </div>
  );
}

const emptyUserForm: UserFormState = {
  fullName: "",
  email: "",
  password: "",
  role: "user",
  status: "active",
};

function getProfileCompletion(user: AdminUserRow) {
  if (!user.matchmaking_answers) {
    return "No answers";
  }

  return "Complete";
}

function getUserLocation(user: AdminUserRow) {
  if (
    user.matchmaking_answers &&
    typeof user.matchmaking_answers === "object" &&
    "location" in user.matchmaking_answers &&
    typeof user.matchmaking_answers.location === "string"
  ) {
    return user.matchmaking_answers.location;
  }

  return "Not set";
}

function formFromUser(user: AdminUserRow): UserFormState {
  return {
    id: user.id,
    fullName: user.full_name ?? "",
    email: user.email ?? "",
    password: "",
    role: user.role ?? "user",
    status: user.status ?? "active",
  };
}

function OverviewView() {
  const [liveStats, setLiveStats] = useState<null | {
    totalUsers: number;
    newUsersLast7Days: number;
    completeProfiles: number;
    totalMatches: number;
    newMatchesLast7Days: number;
    pendingRequests: number;
    recentActivities?: { type: string; text: string; time: string }[];
  }>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        const res = await fetch("/admin/api/stats");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Could not load stats.");
        }

        if (isMounted) setLiveStats(data);
      } catch (err) {
        // keep fallback to static data if stats fail
        console.error(err);
      }
    }

    void loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const renderedStats = liveStats
    ? [
        {
          label: "Total Users",
          value: (liveStats.totalUsers ?? 0).toLocaleString(),
          note: `${liveStats.newUsersLast7Days ?? 0} new this week`,
        },
        {
          label: "New Signups (7d)",
          value: `${liveStats.newUsersLast7Days ?? 0}`,
          note: `Compared to last week`,
        },
        {
          label: "Complete Profiles",
          value: (liveStats.completeProfiles ?? 0).toLocaleString(),
          note: liveStats.totalUsers
            ? `${Math.round(
                ((liveStats.completeProfiles ?? 0) / liveStats.totalUsers) *
                  100,
              )}% completion`
            : "",
        },
        {
          label: "New Matches (7d)",
          value: `${liveStats.newMatchesLast7Days ?? 0}`,
          note: `${liveStats.totalMatches ?? 0} total`,
        },
      ]
    : stats;

  return (
    <div className="space-y-6">
      <PanelHeader
        title="HeartLink Control Center"
        subtitle="Live admin metrics for monitoring users, safety, matching, and the interface people see inside the app."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {renderedStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[1.75rem] bg-white p-6 ring-1 ring-red-100">
          <h2 className="text-lg font-bold text-gray-950">Recent Activity</h2>
          <div className="mt-5 space-y-4">
            {(liveStats?.recentActivities && liveStats.recentActivities.length
              ? liveStats.recentActivities
              : [
                  { text: "Amina W. completed her questionnaire.", time: "" },
                  {
                    text: "Report opened for suspicious message behavior.",
                    time: "",
                  },
                  {
                    text: "Match controls changed to prioritize same-city suggestions.",
                    time: "",
                  },
                ]
            ).map((item: any, idx: number) => (
              <div
                key={`${item.text}-${idx}`}
                className="flex gap-3 rounded-2xl bg-red-50 p-4 text-sm text-gray-700"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <div className="flex w-full items-center justify-between">
                  <div>{item.text}</div>
                  {item.time ? (
                    <div className="ml-4 text-xs text-gray-400">
                      {new Date(item.time).toLocaleString()}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.75rem] bg-white p-6 ring-1 ring-red-100">
          <h2 className="text-lg font-bold text-gray-950">
            User Interface Controls
          </h2>
          <div className="mt-5 space-y-3">
            {interfaceToggles.map((toggle) => (
              <div
                key={toggle.label}
                className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {toggle.label}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{toggle.area}</p>
                </div>
                <StatusPill value={toggle.enabled ? "Enabled" : "Disabled"} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function UsersView() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [form, setForm] = useState<UserFormState>(emptyUserForm);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  async function loadUsers() {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/admin/api/users");
      const data = (await response.json()) as {
        users?: AdminUserRow[];
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message || "Could not load users.");
      }

      setUsers(data.users ?? []);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load users.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialUsers() {
      try {
        const response = await fetch("/admin/api/users");
        const data = (await response.json()) as {
          users?: AdminUserRow[];
          message?: string;
        };

        if (!response.ok) {
          throw new Error(data.message || "Could not load users.");
        }

        if (isMounted) {
          setUsers(data.users ?? []);
        }
      } catch (error) {
        if (isMounted) {
          setMessage(
            error instanceof Error ? error.message : "Could not load users.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  function updateForm<K extends keyof UserFormState>(
    field: K,
    value: UserFormState[K],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(emptyUserForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const isEditing = Boolean(form.id);
      const response = await fetch(
        isEditing ? `/admin/api/users/${form.id}` : "/admin/api/users",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        },
      );
      const data = (await response.json()) as {
        user?: AdminUserRow;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message || "Could not save this user.");
      }

      setMessage(isEditing ? "User updated." : "User created.");
      resetForm();
      await loadUsers();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not save this user.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteUser(user: AdminUserRow) {
    const confirmed = window.confirm(
      `Delete ${user.full_name || user.email || "this user"}? This removes their auth account and profile.`,
    );

    if (!confirmed) {
      return;
    }

    setMessage("");

    try {
      const response = await fetch(`/admin/api/users/${user.id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message || "Could not delete this user.");
      }

      setMessage("User deleted.");
      await loadUsers();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not delete this user.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <PanelHeader
        title="Users"
        subtitle="Create, edit, delete, and assign roles to Supabase users. This admin route is intentionally open for now."
      />

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-[1.75rem] bg-white p-6 ring-1 ring-red-100"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-950">
                {form.id ? "Edit User" : "Create User"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                New users are created in Supabase Auth and mirrored in profiles.
              </p>
            </div>
            {form.id ? (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <X className="h-4 w-4" />
                Cancel Edit
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                Close
              </button>
            )}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="block text-sm font-medium text-gray-700">
              Full Name
              <input
                value={form.fullName}
                onChange={(event) => updateForm("fullName", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                placeholder="Jane Doe"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateForm("email", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                placeholder="jane@example.com"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Password
              <input
                type="password"
                value={form.password}
                disabled={Boolean(form.id)}
                onChange={(event) => updateForm("password", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:bg-gray-100"
                placeholder={form.id ? "Unchanged" : "Default: Heartlink123!"}
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Role
              <select
                value={form.role}
                onChange={(event) =>
                  updateForm("role", event.target.value as UserRole)
                }
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              >
                <option value="user">user</option>
                <option value="moderator">moderator</option>
                <option value="admin">admin</option>
              </select>
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Status
              <select
                value={form.status}
                onChange={(event) =>
                  updateForm("status", event.target.value as UserStatus)
                }
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              >
                <option value="active">active</option>
                <option value="paused">paused</option>
                <option value="review">review</option>
                <option value="blocked">blocked</option>
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Plus className="h-4 w-4" />
                {isSaving
                  ? "Saving..."
                  : form.id
                    ? "Update User"
                    : "Create User"}
              </button>
            </div>
          </div>
        </form>
      )}

      {message ? (
        <p className="rounded-2xl border border-red-100 bg-white px-4 py-3 text-sm text-gray-700">
          {message}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-red-100">
        <div className="flex flex-col gap-3 bg-red-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-gray-950">Supabase Profiles</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadUsers}
              className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(true);
                setForm(emptyUserForm);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <Plus className="h-4 w-4" />
              Add users
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[980px]">
            <div className="grid grid-cols-[1.1fr_1.3fr_0.7fr_0.75fr_0.8fr_0.9fr_0.9fr] gap-4 bg-red-50 px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-red-700">
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Status</span>
              <span>Location</span>
              <span>Completion</span>
              <span>Actions</span>
            </div>

            {isLoading ? (
              <div className="px-5 py-8 text-center text-sm text-gray-500">
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-500">
                No users found.
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="grid grid-cols-[1.1fr_1.3fr_0.7fr_0.75fr_0.8fr_0.9fr_0.9fr] gap-4 border-t border-gray-100 px-5 py-4 text-sm"
                >
                  <span className="font-semibold text-gray-950">
                    {user.full_name || "Unnamed user"}
                  </span>
                  <span className="text-gray-600">
                    {user.email || "No email"}
                  </span>
                  <StatusPill value={user.role ?? "user"} />
                  <StatusPill value={user.status ?? "active"} />
                  <span className="text-gray-600">{getUserLocation(user)}</span>
                  <span className="text-gray-600">
                    {getProfileCompletion(user)}
                  </span>
                  <span className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setForm(formFromUser(user));
                        setShowForm(true);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 text-red-600 transition hover:bg-red-50"
                      aria-label={`Edit ${user.full_name || user.email || "user"}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteUser(user)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 text-red-600 transition hover:bg-red-50"
                      aria-label={`Delete ${user.full_name || user.email || "user"}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchesView() {
  return (
    <div className="space-y-6">
      <PanelHeader
        title="Match Controls"
        subtitle="Static controls that represent how an admin could influence what users see in match suggestions."
      />
      <div className="grid gap-5 lg:grid-cols-3">
        {[
          {
            title: "Priority Signal",
            value: "Shared values",
            Icon: ShieldCheck,
          },
          { title: "Distance Mode", value: "Same city first", Icon: Gauge },
          {
            title: "Profile Gate",
            value: "Answers required",
            Icon: SlidersHorizontal,
          },
        ].map(({ title, value, Icon }) => (
          <div
            key={title}
            className="rounded-[1.75rem] bg-white p-6 ring-1 ring-red-100"
          >
            <Icon className="h-6 w-6 text-red-600" />
            <p className="mt-5 text-sm font-medium text-gray-500">{title}</p>
            <p className="mt-2 text-xl font-bold text-gray-950">{value}</p>
          </div>
        ))}
      </div>
      <section className="rounded-[1.75rem] bg-white p-6 ring-1 ring-red-100">
        <h2 className="text-lg font-bold text-gray-950">Preview Rules</h2>
        <div className="mt-5 grid gap-3">
          {[
            "Show complete profiles before incomplete profiles.",
            "Prefer users with at least three shared interests.",
            "Hide profiles marked as paused or under review.",
            "Boost profiles with recent activity in the last 7 days.",
          ].map((rule) => (
            <div
              key={rule}
              className="rounded-2xl bg-red-50 p-4 text-sm text-gray-700"
            >
              {rule}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ReportsView() {
  return (
    <div className="space-y-6">
      <PanelHeader
        title="Reports"
        subtitle="Download project data exports for users, matches, messages, and more."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {reportOptions.map((report) => (
          <div
            key={report.id}
            className="rounded-[1.5rem] bg-white p-5 ring-1 ring-red-100"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-950">
                  {report.title}
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  {report.description}
                </p>
              </div>
              <a
                href={`/admin/api/reports?type=${report.id}&format=csv`}
                className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <Download className="h-4 w-4" />
                CSV
              </a>
            </div>
            <p className="rounded-2xl bg-red-50 p-4 text-sm text-gray-700">
              Downloads are generated from your Supabase data and include the
              latest available rows.
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-[1.5rem] bg-white p-5 ring-1 ring-red-100">
        <h2 className="text-lg font-bold text-gray-950">
          Moderation Queue (preview)
        </h2>
        <div className="mt-4 grid gap-4">
          {reports.map((report) => (
            <div
              key={report.title}
              className="grid gap-4 rounded-[1.5rem] bg-red-50 p-5 sm:grid-cols-[1fr_auto_auto] sm:items-center"
            >
              <div>
                <h3 className="font-bold text-gray-950">{report.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{report.user}</p>
              </div>
              <StatusPill value={report.priority} />
              <StatusPill value={report.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContentView() {
  return (
    <div className="space-y-6">
      <PanelHeader
        title="Content"
        subtitle="Static copy blocks representing the text admins could control across the user interface."
      />
      <div className="grid gap-5">
        {contentItems.map((item) => (
          <article
            key={item.title}
            className="rounded-[1.75rem] bg-white p-6 ring-1 ring-red-100"
          >
            <h2 className="text-lg font-bold text-gray-950">{item.title}</h2>
            <p className="mt-3 rounded-2xl bg-red-50 p-4 text-sm leading-6 text-gray-700">
              {item.copy}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="space-y-6">
      <PanelHeader
        title="Settings"
        subtitle="Static settings for the visible app experience."
      />
      <div className="grid gap-4">
        {interfaceToggles.map((toggle) => (
          <div
            key={toggle.label}
            className="flex flex-col gap-4 rounded-[1.5rem] bg-white p-5 ring-1 ring-red-100 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 className="font-bold text-gray-950">{toggle.label}</h2>
              <p className="mt-1 text-sm text-gray-500">{toggle.area}</p>
            </div>
            <button
              type="button"
              className={`relative h-8 w-14 rounded-full transition ${
                toggle.enabled ? "bg-red-600" : "bg-gray-300"
              }`}
              aria-label={toggle.label}
            >
              <span
                className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
                  toggle.enabled ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderView(view: AdminView) {
  switch (view) {
    case "users":
      return <UsersView />;
    case "matches":
      return <MatchesView />;
    case "reports":
      return <ReportsView />;
    case "content":
      return <ContentView />;
    case "settings":
      return <SettingsView />;
    default:
      return <OverviewView />;
  }
}

export default function AdminPanel() {
  const [activeView, setActiveView] = useState<AdminView>("overview");

  return (
    <main className="min-h-screen bg-[#fffaf8] text-gray-950">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-r border-red-100 bg-white px-5 py-6 lg:fixed lg:inset-y-0 lg:left-0 lg:w-80">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-xl font-bold">HeartLink Admin</span>
              <span className="text-sm text-gray-500">
                Static control panel
              </span>
            </span>
          </Link>

          <nav className="mt-8 grid gap-2">
            {navItems.map(({ id, label, description, Icon }) => {
              const isActive = activeView === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveView(id)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                    isActive
                      ? "bg-red-600 text-white shadow-lg shadow-red-900/15"
                      : "text-gray-600 hover:bg-red-50 hover:text-red-700"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">{label}</span>
                    <span
                      className={`block text-xs ${
                        isActive ? "text-red-100" : "text-gray-500"
                      }`}
                    >
                      {description}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="mt-8 rounded-[1.5rem] bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-red-600" />
              <p className="text-sm font-bold text-gray-950">Static Demo</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              These controls are mock data now. They can be wired to Supabase
              later.
            </p>
          </div>
        </aside>

        <section className="flex-1 px-5 py-8 sm:px-8 lg:ml-80 lg:px-10">
          {renderView(activeView)}
        </section>
      </div>
    </main>
  );
}
