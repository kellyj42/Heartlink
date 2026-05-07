"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  MapPin,
  MessageCircle,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";
import { getCurrentUser, StoredUser } from "../lib/localUsers";

function getAgeFromDateOfBirth(dateOfBirth: string) {
  if (!dateOfBirth) {
    return "Not set";
  }

  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return `${age} years`;
}

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
    <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-red-100">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-2 text-sm leading-6 text-gray-500">{note}</p>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-gray-100">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function TagList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-red-100">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function DashboardContent() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();

        if (isMounted) {
          setUser(currentUser);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <section className="mx-auto max-w-xl px-6 py-16">
        <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto max-w-xl px-6 py-16">
        <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
          <h1 className="text-2xl font-bold text-gray-950">Client Dashboard</h1>
          <p className="mt-3 text-gray-600">
            Please login first to view your dashboard.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-2xl bg-red-600 px-5 py-3 font-medium text-white"
          >
            Go to Login
          </Link>
        </div>
      </section>
    );
  }

  const answers = user.matchmakingAnswers;

  return (
    <div className="px-6 py-8 lg:px-10">
      <header className="overflow-hidden rounded-[2rem] bg-red-50 shadow-sm">
        <div className="grid gap-8 px-7 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600">
              Dashboard
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
              Your HeartLink profile
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
              Review your dating preferences, update your profile details, and
              keep your matchmaking answers current.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/questions"
                className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Update Answers
              </Link>
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-white p-5 ring-1 ring-red-100">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">
              Profile Snapshot
            </p>

            <div className="mt-5 flex items-center gap-4">
              {answers?.photo ? (
                <Image
                  src={answers.photo}
                  alt={`${user.name} profile photo`}
                  width={88}
                  height={88}
                  unoptimized
                  className="h-[88px] w-[88px] rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-[88px] w-[88px] items-center justify-center rounded-2xl bg-red-50 text-red-400">
                  <UserRound className="h-9 w-9" />
                </div>
              )}

              <div>
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <p className="mt-1 text-sm text-gray-500">{user.email}</p>
                <p className="mt-2 text-sm text-gray-600">
                  {answers
                    ? `${answers.location} • ${answers.gender}`
                    : "Profile pending"}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-red-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
                  Goal
                </p>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  {user.datingGoal}
                </p>
              </div>
              <div className="rounded-2xl bg-red-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
                  Status
                </p>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  {answers ? "Profile complete" : "Waiting for answers"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section
        id="overview"
        className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          label="Account Status"
          value="Active"
          note="Connected through Supabase Auth"
        />
        <StatCard
          label="Questionnaire"
          value={answers ? "Completed" : "Pending"}
          note="Four-step relationship profile"
        />
        <StatCard
          label="Dating Style"
          value={answers ? answers.idealFirstDate : "Not set"}
          note="Based on your preferred first date"
        />
        <StatCard
          label="Core Value"
          value={answers ? answers.coreValue : "Not set"}
          note="One of the strongest profile signals"
        />
      </section>

      {answers ? (
        <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section id="profile" className="space-y-6">
            <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-red-100">
              <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-600">
                    Profile Overview
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-gray-900">
                    Your relationship identity
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    These details are now loaded from your Supabase profile
                    record and shape how the app understands you.
                  </p>
                </div>

                <span className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Saved
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoTile
                  label="Date of Birth"
                  value={answers.dateOfBirth || "Not set"}
                />
                <InfoTile
                  label="Age"
                  value={getAgeFromDateOfBirth(answers.dateOfBirth)}
                />
                <InfoTile label="Location" value={answers.location} />
                <InfoTile label="WhatsApp" value={answers.contact} />
                <InfoTile label="Gender" value={answers.gender} />
                <InfoTile label="Interested In" value={answers.interestedIn} />
                <InfoTile label="Personality" value={answers.personality} />
                <InfoTile label="Humor Style" value={answers.humorStyle} />
                <InfoTile label="Social Energy" value={answers.socialEnergy} />
                <InfoTile label="Weekend Vibe" value={answers.weekendStyle} />
                <InfoTile label="Core Value" value={answers.coreValue} />
                <InfoTile label="Green Flag" value={answers.greenFlag} />
                <InfoTile
                  label="Distance Preference"
                  value={answers.distancePreference}
                />
                <InfoTile
                  label="Communication"
                  value={answers.communicationStyle}
                />
                <InfoTile
                  label="Relationship Pace"
                  value={answers.relationshipPace}
                />
                <InfoTile
                  label="Ideal First Date"
                  value={answers.idealFirstDate}
                />
              </div>

              <div className="mt-6 rounded-3xl bg-red-50 p-5">
                <p className="text-sm font-semibold text-gray-900">Brief Bio</p>
                <p className="mt-3 text-sm leading-7 text-gray-700">
                  {answers.shortBio || "No short bio added yet."}
                </p>
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              <TagList title="Love Languages" items={answers.loveLanguages} />
              <TagList title="Interests" items={answers.interests} />
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-red-100">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <UserRound className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
                    Profile Insight
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-gray-900">
                    Your dating profile direction
                  </h2>
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-gray-600">
                Your profile presents you as someone who values{" "}
                {answers.coreValue.toLowerCase()}, enjoys{" "}
                {answers.idealFirstDate.toLowerCase()} dates, appreciates{" "}
                {answers.loveLanguages[0]?.toLowerCase()}, and feels most
                comfortable in a {answers.relationshipPace.toLowerCase()}
                relationship.
              </p>

              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl bg-red-50 p-4 text-sm text-gray-700">
                  Best energy mix: {answers.personality} + {answers.humorStyle}
                </div>
                <div className="rounded-2xl bg-red-50 p-4 text-sm text-gray-700">
                  Best starting point: {answers.idealFirstDate} and{" "}
                  {answers.communicationStyle.toLowerCase()}
                </div>
              </div>

              <Link
                href="/questions"
                className="mt-6 inline-flex rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                Refine Profile
              </Link>
            </section>

            <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-red-100">
              <h3 className="text-lg font-bold text-gray-900">Quick Summary</h3>
              <div className="mt-5 space-y-4 text-sm">
                <p className="flex gap-3 text-gray-700">
                  <MapPin className="mt-0.5 h-4 w-4 text-red-600" />
                  Based near {answers.location}
                </p>
                <p className="flex gap-3 text-gray-700">
                  <Target className="mt-0.5 h-4 w-4 text-red-600" />
                  Looking for: {user.datingGoal}
                </p>
                <p className="flex gap-3 text-gray-700">
                  <MessageCircle className="mt-0.5 h-4 w-4 text-red-600" />
                  Preferred contact: {answers.communicationStyle}
                </p>
                <p className="flex gap-3 text-gray-700">
                  <Sparkles className="mt-0.5 h-4 w-4 text-red-600" />
                  Best green flag: {answers.greenFlag}
                </p>
              </div>
            </section>

            <section className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6">
              <p className="flex items-center gap-2 font-semibold text-emerald-800">
                <CheckCircle2 className="h-5 w-5" />
                Saved in database
              </p>
              <p className="mt-2 text-sm leading-6 text-emerald-700">
                Your questionnaire answers are now being read from your Supabase
                profile record instead of browser localStorage.
              </p>
            </section>
          </aside>
        </div>
      ) : (
        <section className="mt-8 rounded-[2rem] bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
          <h2 className="text-xl font-bold text-gray-950">
            No Questions Answered Yet
          </h2>
          <p className="mt-3 text-gray-600">
            Please answer the matchmaking questions before viewing your saved
            profile details.
          </p>
          <Link
            href="/questions"
            className="mt-6 inline-flex rounded-2xl bg-red-600 px-5 py-3 font-medium text-white"
          >
            Answer Questions
          </Link>
        </section>
      )}
    </div>
  );
}
