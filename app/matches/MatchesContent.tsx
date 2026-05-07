"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Search, Sparkles } from "lucide-react";
import { getCurrentUser, StoredUser } from "../lib/localUsers";
import { getMatches, getAllPotentialMatches, Match } from "../lib/matchmaking";
import RequestButton from "../components/RequestButton";

function CompatibilityBadge({ score }: { score: number }) {
  let bgColor = "bg-red-50";
  let textColor = "text-red-600";

  if (score >= 80) {
    bgColor = "bg-green-50";
    textColor = "text-green-600";
  } else if (score >= 65) {
    bgColor = "bg-blue-50";
    textColor = "text-blue-600";
  }

  return (
    <div className={`rounded-full ${bgColor} px-4 py-2`}>
      <p className={`text-sm font-bold ${textColor}`}>{score}% match</p>
    </div>
  );
}

function MatchCard({ match }: { match: Match }) {
  const photo = match.matchmakingAnswers?.photo;
  const age = match.matchmakingAnswers?.dateOfBirth
    ? new Date().getFullYear() -
      new Date(match.matchmakingAnswers.dateOfBirth).getFullYear()
    : "N/A";

  return (
    <div className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm transition hover:shadow-lg">
      <div className="relative h-64 w-full bg-gradient-to-br from-red-100 to-pink-100">
        {photo ? (
          <Image
            src={photo}
            alt={match.name}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="rounded-full bg-red-100 p-8">
              <Sparkles className="h-12 w-12 text-red-400" />
            </div>
          </div>
        )}
        <div className="absolute right-4 top-4">
          <CompatibilityBadge score={match.compatibilityScore} />
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{match.name}</h3>
          <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            {match.matchmakingAnswers?.location || "Location not set"}
          </p>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 rounded-2xl bg-red-50 p-3 text-center">
            <p className="text-xs font-semibold uppercase text-red-600">Age</p>
            <p className="mt-1 text-lg font-bold text-gray-900">{age}</p>
          </div>
          <div className="flex-1 rounded-2xl bg-blue-50 p-3 text-center">
            <p className="text-xs font-semibold uppercase text-blue-600">
              Goal
            </p>
            <p className="mt-1 text-xs font-bold text-gray-900 line-clamp-1">
              {match.datingGoal}
            </p>
          </div>
        </div>

        <p className="text-sm leading-6 text-gray-600">
          {match.matchmakingAnswers?.shortBio || "No bio provided"}
        </p>

        {match.matchmakingAnswers?.interests && (
          <div className="flex flex-wrap gap-2">
            {match.matchmakingAnswers.interests.slice(0, 3).map((interest) => (
              <span
                key={interest}
                className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-600"
              >
                {interest}
              </span>
            ))}
          </div>
        )}

        <Link
          href={`/matches/${match.id}`}
          className="flex w-full items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
        >
          See more details
        </Link>

        <div className="flex gap-3 pt-2">
          <button className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700">
            <Image
              src="/logo.png"
              alt=""
              width={18}
              height={18}
              className="h-5 w-5 object-contain"
            />
            Like
          </button>
          <div className="flex-1">
            <RequestButton
              userId={match.id}
              contact={match.matchmakingAnswers?.contact}
              compact
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MatchesContent() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showAllMatches, setShowAllMatches] = useState(false);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isNewlySignedUpUser, setIsNewlySignedUpUser] = useState(false);

  const visibleMatches = showAllMatches ? allMatches : matches;

  useEffect(() => {
    let isMounted = true;

    async function loadMatches() {
      try {
        const user = await getCurrentUser();

        if (!isMounted) return;

        if (!user) {
          setMessage("Please login to see matches.");
          setMatches([]);
          setIsLoading(false);
          return;
        }

        setUser(user);
        setUserId(user.id);
        setIsNewlySignedUpUser(
          window.sessionStorage.getItem("heartlink_new_user") === "true",
        );

        if (!user.matchmakingAnswers) {
          setMessage(
            "Please complete your questionnaire to see perfect matches. Showing all other users now.",
          );

          const allPotentialMatches = await getAllPotentialMatches(user.id);

          if (!isMounted) return;

          setAllMatches(allPotentialMatches);
          setShowAllMatches(true);
          setIsLoading(false);
          return;
        }

        const matchedUsers = await getMatches(user.id);

        if (!isMounted) return;

        if (matchedUsers.length === 0) {
          const allPotentialMatches = await getAllPotentialMatches(user.id);

          if (!isMounted) return;

          setAllMatches(allPotentialMatches);
          setShowAllMatches(true);
          setMessage(
            "No perfect matches yet. Showing all other users from the database.",
          );
        } else {
          setMessage("");
          setMatches(matchedUsers);
        }
      } catch (error) {
        if (!isMounted) return;

        setMessage(
          error instanceof Error
            ? error.message
            : "Could not load matches right now.",
        );
        setMatches([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadMatches();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleFindMatch() {
    if (!userId) return;

    setIsLoading(true);
    try {
      const allPotentialMatches = await getAllPotentialMatches(userId);
      setAllMatches(allPotentialMatches);
      setShowAllMatches(true);
      setMessage(
        allPotentialMatches.length === 0
          ? "No other user profiles are visible from the database yet."
          : "",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load users.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-red-100 bg-white p-8 text-center text-gray-600">
        Loading your matches...
      </div>
    );
  }

  if (message && matches.length === 0 && !showAllMatches) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-red-100 bg-white p-8 text-center">
          <Sparkles className="mx-auto h-12 w-12 text-red-400" />
          <p className="mt-4 text-gray-700">{message}</p>
          <button
            onClick={handleFindMatch}
            disabled={isLoading}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
            {isLoading ? "Loading..." : "Find a Match"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-red-50 p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600">
              Matches
            </p>
            <h1 className="mt-3 text-3xl font-bold text-gray-900">
              {isNewlySignedUpUser
                ? `You are welcome${user?.name ? `, ${user.name}` : ""}`
                : `Welcome back${user?.name ? `, ${user.name}` : ""}`}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">
              {!isNewlySignedUpUser && user?.matchmakingAnswers
                ? "Here are the best match suggestions from other users in the database."
                : "You are welcome here as a newly signed-up user. Complete your questionnaire for better matches or explore all users."}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleFindMatch}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
              Find a Match
            </button>
            <Link
              href="/questions"
              className="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Update Answers
            </Link>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {showAllMatches ? "Explore All Users" : "Your Matches"}
          </h2>
          <p className="mt-2 text-gray-600">
            {showAllMatches
              ? `${allMatches.length} user${allMatches.length !== 1 ? "s" : ""} available`
              : `${matches.length} compatible match${matches.length !== 1 ? "es" : ""} found`}
          </p>
        </div>
        {showAllMatches && matches.length > 0 && (
          <button
            onClick={() => setShowAllMatches(false)}
            className="rounded-2xl bg-gray-100 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-200"
          >
            ← Back to Matches
          </button>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleMatches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>

      {visibleMatches.length === 0 ? (
        <div className="rounded-3xl border border-red-100 bg-white p-8 text-center">
          <Sparkles className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-4 text-xl font-bold text-gray-900">
            No other profiles found
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-gray-600">
            {message ||
              "The database query worked, but it did not return any profiles besides yours. Make sure the other users have profile rows and that authenticated users can view profiles."}
          </p>
        </div>
      ) : null}
    </div>
  );
}

