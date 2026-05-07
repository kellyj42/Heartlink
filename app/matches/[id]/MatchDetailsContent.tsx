"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Calendar,
  ExternalLink,
  GraduationCap,
  Images,
  Link as LinkIcon,
  MapPin,
  MessageCircle,
  Sparkles,
  UserRound,
} from "lucide-react";
import { getUserProfileById, StoredUser } from "@/app/lib/localUsers";
import RequestButton from "@/app/components/RequestButton";
import {
  getPhotoLikeSummaries,
  likePhoto,
  PhotoLikeSummary,
  unlikePhoto,
} from "@/app/lib/photoLikes";

function getAge(dateOfBirth?: string) {
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

function DetailTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-red-100">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-gray-500">
            {label}
          </p>
          <p className="mt-1 text-sm font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function TagGroup({ title, items }: { title: string; items?: string[] }) {
  return (
    <section className="rounded-[1.75rem] bg-white p-6 ring-1 ring-red-100">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      {items?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-gray-600">Not added yet.</p>
      )}
    </section>
  );
}

export default function MatchDetailsContent({
  profileId,
}: {
  profileId: string;
}) {
  const [profile, setProfile] = useState<StoredUser | null>(null);
  const [photoLikes, setPhotoLikes] = useState<
    Map<string, PhotoLikeSummary>
  >(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const loadedProfile = await getUserProfileById(profileId);

        if (!isMounted) {
          return;
        }

        if (!loadedProfile) {
          setMessage("This user profile could not be found.");
        }

        setProfile(loadedProfile);

        const gallery = [
          loadedProfile?.matchmakingAnswers?.photo,
          ...(loadedProfile?.matchmakingAnswers?.moreImages ?? []),
        ].filter(Boolean) as string[];

        if (loadedProfile && gallery.length > 0) {
          setPhotoLikes(await getPhotoLikeSummaries(loadedProfile.id, gallery));
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setMessage(
          error instanceof Error
            ? error.message
            : "Could not load this user right now.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [profileId]);

  if (isLoading) {
    return (
      <div className="px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 text-center ring-1 ring-red-100">
          <p className="text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 text-center ring-1 ring-red-100">
          <Sparkles className="mx-auto h-12 w-12 text-red-400" />
          <p className="mt-4 text-gray-700">
            {message || "This user profile could not be found."}
          </p>
          <Link
            href="/matches"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to matches
          </Link>
        </div>
      </div>
    );
  }

  const answers = profile.matchmakingAnswers;
  const profilePhoto = answers?.photo;
  const gallery = [answers?.photo, ...(answers?.moreImages ?? [])].filter(
    Boolean,
  ) as string[];
  const socialLinks = answers?.socialLinks
    ? Object.entries(answers.socialLinks).filter(([, url]) => Boolean(url))
    : [];

  async function handleTogglePhotoLike(imageUrl: string) {
    if (!profile) {
      return;
    }

    const summary = photoLikes.get(imageUrl);
    const wasLiked = Boolean(summary?.likedByCurrentUser);

    try {
      if (wasLiked) {
        await unlikePhoto(profile.id, imageUrl);
      } else {
        await likePhoto(profile.id, imageUrl);
      }

      setPhotoLikes((currentLikes) => {
        const nextLikes = new Map(currentLikes);
        const currentSummary = nextLikes.get(imageUrl) ?? {
          imageUrl,
          count: 0,
          likedByCurrentUser: false,
        };

        nextLikes.set(imageUrl, {
          imageUrl,
          count: Math.max(
            0,
            currentSummary.count + (currentSummary.likedByCurrentUser ? -1 : 1),
          ),
          likedByCurrentUser: !currentSummary.likedByCurrentUser,
        });

        return nextLikes;
      });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not update photo like.",
      );
    }
  }

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <Link
          href="/matches"
          className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to matches
        </Link>

        <section className="overflow-hidden rounded-[2rem] bg-red-50 shadow-sm">
          <div className="grid gap-8 p-6 lg:grid-cols-[0.75fr_1.25fr] lg:p-8">
            <div className="relative min-h-[340px] overflow-hidden rounded-[1.75rem] bg-white">
              {profilePhoto ? (
                <Image
                  src={profilePhoto}
                  alt={`${profile.name} profile photo`}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[340px] items-center justify-center text-red-400">
                  <UserRound className="h-20 w-20" />
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600">
                Profile details
              </p>
              <h1 className="mt-4 text-4xl font-bold text-gray-900">
                {profile.name}
              </h1>
              <p className="mt-3 flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4 text-red-500" />
                {answers?.location || "Location not set"}
              </p>
              <p className="mt-5 max-w-2xl text-base leading-8 text-gray-700">
                {answers?.shortBio || "No bio has been added yet."}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <div className="sm:min-w-64">
                  <RequestButton userId={profile.id} contact={answers?.contact} />
                </div>
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50">
                  <Image
                    src="/logo.png"
                    alt=""
                    width={18}
                    height={18}
                    className="h-5 w-5 object-contain"
                  />
                  Like
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DetailTile
            label="Age"
            value={getAge(answers?.dateOfBirth)}
            icon={Calendar}
          />
          <DetailTile
            label="Gender"
            value={answers?.gender || profile.gender}
            icon={UserRound}
          />
          <DetailTile
            label="Dating Goal"
            value={profile.datingGoal}
            icon={Sparkles}
          />
          <DetailTile
            label="Interested In"
            value={answers?.interestedIn || "Not set"}
            icon={Sparkles}
          />
          <DetailTile
            label="Occupation"
            value={answers?.occupation || "Not added yet"}
            icon={BriefcaseBusiness}
          />
          <DetailTile
            label="Education"
            value={answers?.education || "Not added yet"}
            icon={GraduationCap}
          />
          <DetailTile
            label="Contact"
            value={answers?.contact || "Not added yet"}
            icon={MessageCircle}
          />
          <DetailTile
            label="Photos"
            value={`${gallery.length} image${gallery.length === 1 ? "" : "s"}`}
            icon={Images}
          />
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section className="space-y-6">
            <section className="rounded-[1.75rem] bg-white p-6 ring-1 ring-red-100">
              <h2 className="text-lg font-bold text-gray-900">
                Relationship Details
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <DetailTile
                  label="Personality"
                  value={answers?.personality || "Not set"}
                  icon={Sparkles}
                />
                <DetailTile
                  label="Humor Style"
                  value={answers?.humorStyle || "Not set"}
                  icon={MessageCircle}
                />
                <DetailTile
                  label="Social Energy"
                  value={answers?.socialEnergy || "Not set"}
                  icon={UserRound}
                />
                <DetailTile
                  label="Weekend Style"
                  value={answers?.weekendStyle || "Not set"}
                  icon={Calendar}
                />
                <DetailTile
                  label="Core Value"
                  value={answers?.coreValue || "Not set"}
                  icon={Sparkles}
                />
                <DetailTile
                  label="Green Flag"
                  value={answers?.greenFlag || "Not set"}
                  icon={Sparkles}
                />
                <DetailTile
                  label="Communication"
                  value={answers?.communicationStyle || "Not set"}
                  icon={MessageCircle}
                />
                <DetailTile
                  label="Relationship Pace"
                  value={answers?.relationshipPace || "Not set"}
                  icon={Sparkles}
                />
                <DetailTile
                  label="First Date"
                  value={answers?.idealFirstDate || "Not set"}
                  icon={Calendar}
                />
                <DetailTile
                  label="Distance"
                  value={answers?.distancePreference || "Not set"}
                  icon={MapPin}
                />
              </div>
            </section>

            <TagGroup title="Interests" items={answers?.interests} />
            <TagGroup title="Love Languages" items={answers?.loveLanguages} />
          </section>

          <aside className="space-y-6">
            <section className="rounded-[1.75rem] bg-white p-6 ring-1 ring-red-100">
              <h2 className="text-lg font-bold text-gray-900">
                Photo Gallery
              </h2>
              {gallery.length ? (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {gallery.map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="overflow-hidden rounded-2xl bg-red-50"
                    >
                      <a
                        href={image}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open ${profile.name} photo ${index + 1}`}
                        className="relative block aspect-square overflow-hidden"
                      >
                        <Image
                          src={image}
                          alt={`${profile.name} photo ${index + 1}`}
                          fill
                          unoptimized
                          className="object-cover transition hover:scale-105"
                        />
                      </a>
                      <button
                        type="button"
                        onClick={() => void handleTogglePhotoLike(image)}
                        className={`flex w-full items-center justify-center gap-2 px-3 py-2 text-sm font-semibold transition ${
                          photoLikes.get(image)?.likedByCurrentUser
                            ? "bg-red-600 text-white"
                            : "bg-white text-red-600 hover:bg-red-50"
                        }`}
                      >
                        <Image
                          src="/logo.png"
                          alt=""
                          width={18}
                          height={18}
                          className="h-5 w-5 object-contain"
                        />
                        {photoLikes.get(image)?.likedByCurrentUser
                          ? "Liked"
                          : "Like"}
                        <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">
                          {photoLikes.get(image)?.count ?? 0}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-gray-600">
                  No extra images added yet.
                </p>
              )}
            </section>

            <section className="rounded-[1.75rem] bg-white p-6 ring-1 ring-red-100">
              <h2 className="text-lg font-bold text-gray-900">Social Links</h2>
              {socialLinks.length ? (
                <div className="mt-4 space-y-3">
                  {socialLinks.map(([label, url]) => (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      <span className="inline-flex items-center gap-2 capitalize">
                        <LinkIcon className="h-4 w-4" />
                        {label}
                      </span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-gray-600">
                  No social links added yet.
                </p>
              )}
            </section>

            <section className="rounded-[1.75rem] bg-white p-6 ring-1 ring-red-100">
              <h2 className="text-lg font-bold text-gray-900">
                Partner Preference
              </h2>
              <p className="mt-3 text-sm leading-7 text-gray-700">
                {answers?.partnerPreference || "Not added yet."}
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
