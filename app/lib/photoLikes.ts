import { supabase } from "@/app/lib/supabase";

export type PhotoLikeSummary = {
  imageUrl: string;
  count: number;
  likedByCurrentUser: boolean;
};

type PhotoLikeRow = {
  image_url: string;
  liker_id: string;
};

function getErrorMessage(error: unknown, fallback: string) {
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

export async function getPhotoLikeSummaries(
  profileId: string,
  imageUrls: string[],
) {
  const currentUserId = await getCurrentAuthUserId();

  if (imageUrls.length === 0) {
    return new Map<string, PhotoLikeSummary>();
  }

  const { data, error } = await supabase
    .from("photo_likes")
    .select("image_url, liker_id")
    .eq("profile_id", profileId)
    .in("image_url", imageUrls);

  if (error) {
    throw new Error(getErrorMessage(error, "Could not load photo likes."));
  }

  const summaries = new Map(
    imageUrls.map((imageUrl) => [
      imageUrl,
      { imageUrl, count: 0, likedByCurrentUser: false },
    ]),
  );

  (data ?? []).forEach((like) => {
    const row = like as PhotoLikeRow;
    const summary = summaries.get(row.image_url);

    if (!summary) {
      return;
    }

    summary.count += 1;
    summary.likedByCurrentUser =
      summary.likedByCurrentUser || row.liker_id === currentUserId;
  });

  return summaries;
}

export async function likePhoto(profileId: string, imageUrl: string) {
  const likerId = await getCurrentAuthUserId();

  const { error } = await supabase.from("photo_likes").insert({
    profile_id: profileId,
    image_url: imageUrl,
    liker_id: likerId,
  });

  if (error) {
    throw new Error(getErrorMessage(error, "Could not like this photo."));
  }
}

export async function unlikePhoto(profileId: string, imageUrl: string) {
  const likerId = await getCurrentAuthUserId();

  const { error } = await supabase
    .from("photo_likes")
    .delete()
    .eq("profile_id", profileId)
    .eq("image_url", imageUrl)
    .eq("liker_id", likerId);

  if (error) {
    throw new Error(getErrorMessage(error, "Could not remove this like."));
  }
}
