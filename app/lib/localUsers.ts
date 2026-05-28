import { supabase } from "@/app/lib/supabase";

const profilePhotosBucket = "profile-photos";

export type MatchmakingAnswers = {
  photo: string;
  moreImages?: string[];
  contact: string;
  occupation?: string;
  education?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    x?: string;
    linkedin?: string;
    website?: string;
  };
  dateOfBirth: string;
  shortBio: string;
  location: string;
  gender: string;
  interestedIn: string;
  personality: string;
  loveLanguages: string[];
  interests: string[];
  idealFirstDate: string;
  humorStyle: string;
  socialEnergy: string;
  weekendStyle: string;
  coreValue: string;
  greenFlag: string;
  distancePreference: string;
  communicationStyle: string;
  relationshipPace: string;
  partnerPreference: string;
};

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  gender: "Male" | "Female";
  datingGoal: string;
  matchmakingAnswers?: MatchmakingAnswers;
  createdAt: string;
};

export type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  gender: "Male" | "Female" | null;
  dating_goal: string | null;
  matchmaking_answers: MatchmakingAnswers | null;
  created_at: string | null;
};

export function getDefaultMatchmakingAnswers(
  gender: "Male" | "Female" = "Male",
): MatchmakingAnswers {
  return {
    photo: "",
    moreImages: [],
    contact: "",
    occupation: "",
    education: "",
    socialLinks: {},
    dateOfBirth: "",
    shortBio: "",
    location: "Nairobi",
    gender,
    interestedIn: gender === "Male" ? "Female" : "Male",
    personality: "Calm",
    loveLanguages: ["Words", "Humor"],
    interests: ["Music", "Travel", "Reading"],
    idealFirstDate: "Coffee",
    humorStyle: "Witty",
    socialEnergy: "Ambivert",
    weekendStyle: "Cozy",
    coreValue: "",
    greenFlag: "",
    distancePreference: "Same city",
    communicationStyle: "Texting",
    relationshipPace: "Take things slowly",
    partnerPreference: "Kind, honest, and respectful",
  };
}

function isDataUrl(value: string) {
  return value.startsWith("data:");
}

function getDataUrlExtension(dataUrl: string) {
  const match = dataUrl.match(/^data:image\/([a-zA-Z0-9.+-]+);base64,/);
  const extension = match?.[1]?.toLowerCase();

  if (!extension) {
    return "jpg";
  }

  return extension === "jpeg" ? "jpg" : extension;
}

async function uploadProfileImage({
  userId,
  dataUrl,
  name,
}: {
  userId: string;
  dataUrl: string;
  name: string;
}) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const extension = getDataUrlExtension(dataUrl);
  const filePath = `${userId}/${name}-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from(profilePhotosBucket)
    .upload(filePath, blob, {
      cacheControl: "3600",
      contentType: blob.type || `image/${extension}`,
      upsert: true,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from(profilePhotosBucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

async function uploadAnswerImages(
  userId: string,
  answers: MatchmakingAnswers,
): Promise<MatchmakingAnswers> {
  const photo = isDataUrl(answers.photo)
    ? await uploadProfileImage({
        userId,
        dataUrl: answers.photo,
        name: "profile",
      }).catch(() => answers.photo)
    : answers.photo;

  const moreImages = await Promise.all(
    (answers.moreImages ?? []).map((image, index) =>
      isDataUrl(image)
        ? uploadProfileImage({
            userId,
            dataUrl: image,
            name: `gallery-${index + 1}`,
          }).catch(() => image)
        : image,
    ),
  );

  return {
    ...answers,
    photo,
    moreImages,
  };
}

function normalizeMatchmakingAnswers(
  answers: Partial<MatchmakingAnswers> | null | undefined,
  gender: "Male" | "Female",
): MatchmakingAnswers {
  const defaults = getDefaultMatchmakingAnswers(gender);

  return {
    ...defaults,
    ...answers,
    gender: answers?.gender ?? gender,
    interestedIn:
      answers?.interestedIn ??
      ((answers?.gender ?? gender) === "Male" ? "Female" : "Male"),
    loveLanguages: Array.isArray(answers?.loveLanguages)
      ? answers.loveLanguages
      : defaults.loveLanguages,
    interests: Array.isArray(answers?.interests)
      ? answers.interests
      : defaults.interests,
  };
}

export function mapProfileRow(profile: ProfileRow): StoredUser {
  const gender = profile.gender ?? "Male";

  return {
    id: profile.id,
    name: profile.full_name ?? "HeartLink User",
    email: profile.email ?? "",
    gender,
    datingGoal: profile.dating_goal ?? "Long-term relationship",
    matchmakingAnswers: profile.matchmaking_answers
      ? normalizeMatchmakingAnswers(profile.matchmaking_answers, gender)
      : undefined,
    createdAt: profile.created_at ?? new Date().toISOString(),
  };
}

export async function upsertUserProfile({
  id,
  name,
  email,
  gender,
  datingGoal,
  matchmakingAnswers,
}: {
  id: string;
  name: string;
  email: string;
  gender: "Male" | "Female";
  datingGoal: string;
  matchmakingAnswers?: MatchmakingAnswers;
}) {
  const normalizedAnswers = matchmakingAnswers
    ? normalizeMatchmakingAnswers(matchmakingAnswers, gender)
    : undefined;
  const profilePayload: {
    id: string;
    full_name: string;
    email: string;
    gender: "Male" | "Female";
    dating_goal: string;
    matchmaking_answers?: MatchmakingAnswers | null;
  } = {
    id,
    full_name: name.trim(),
    email: email.trim().toLowerCase(),
    gender,
    dating_goal: datingGoal,
  };

  if (matchmakingAnswers !== undefined) {
    profilePayload.matchmaking_answers = normalizedAnswers ?? null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert(profilePayload, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapProfileRow(data as ProfileRow);
}

export async function getCurrentUser() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return await upsertUserProfile({
      id: user.id,
      name:
        typeof user.user_metadata.full_name === "string" &&
        user.user_metadata.full_name
          ? user.user_metadata.full_name
          : user.email?.split("@")[0] ?? "HeartLink User",
      email: user.email ?? "",
      gender: user.user_metadata.gender === "Female" ? "Female" : "Male",
      datingGoal:
        typeof user.user_metadata.dating_goal === "string" &&
        user.user_metadata.dating_goal
          ? user.user_metadata.dating_goal
          : "Long-term relationship",
    });
  }

  return mapProfileRow(data as ProfileRow);
}

export async function getUserProfileById(id: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapProfileRow(data as ProfileRow) : null;
}

export async function saveMatchmakingAnswers(answers: MatchmakingAnswers) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { ok: false, message: "Please login before answering questions." };
    }

    const answersWithUploadedImages = await uploadAnswerImages(
      currentUser.id,
      answers,
    );

    await upsertUserProfile({
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      gender: answersWithUploadedImages.gender as "Male" | "Female",
      datingGoal: currentUser.datingGoal,
      matchmakingAnswers: answersWithUploadedImages,
    });

    return { ok: true, message: "Your matchmaking answers have been saved." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Could not save your answers right now.",
    };
  }
}
