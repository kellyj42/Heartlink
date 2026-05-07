import { supabase } from "@/app/lib/supabase";
import { mapProfileRow, ProfileRow, StoredUser } from "@/app/lib/localUsers";

export type Match = StoredUser & {
  compatibilityScore: number;
};

function getOppositeGender(gender: StoredUser["gender"]) {
  return gender === "Male" ? "Female" : "Male";
}

function calculateCompatibility(
  currentUser: StoredUser,
  otherUser: StoredUser,
): number {
  if (
    !currentUser.matchmakingAnswers ||
    !otherUser.matchmakingAnswers
  ) {
    return 0;
  }

  const current = currentUser.matchmakingAnswers;
  const other = otherUser.matchmakingAnswers;

  let score = 0;
  let criteriaCount = 0;

  // Gender compatibility (20 points)
  if (current.gender === other.gender) {
    // Same gender, check if interested in same gender
    if (current.interestedIn === other.interestedIn) {
      score += 20;
    }
  } else {
    // Opposite gender, check if interested in each other
    if (
      current.interestedIn === other.gender &&
      other.interestedIn === current.gender
    ) {
      score += 20;
    } else {
      return 0; // Not interested in each other
    }
  }
  criteriaCount += 1;

  // Dating goal compatibility (15 points)
  if (currentUser.datingGoal === otherUser.datingGoal) {
    score += 15;
  } else if (
    (currentUser.datingGoal === "Long-term relationship" &&
      otherUser.datingGoal === "Serious dating") ||
    (currentUser.datingGoal === "Serious dating" &&
      otherUser.datingGoal === "Long-term relationship")
  ) {
    score += 10;
  }
  criteriaCount += 1;

  // Personality type (10 points)
  if (current.personality === other.personality) {
    score += 10;
  } else {
    // Check if personalities complement each other
    const complementary = {
      "Calm": ["Playful", "Adventurous"],
      "Playful": ["Calm", "Thoughtful"],
      "Adventurous": ["Calm", "Thoughtful"],
      "Thoughtful": ["Playful", "Adventurous"],
    };
    if (
      complementary[current.personality as keyof typeof complementary]?.includes(
        other.personality,
      )
    ) {
      score += 5;
    }
  }
  criteriaCount += 1;

  // Love languages overlap (12 points)
  const loveLanguageOverlap = current.loveLanguages.filter((lang) =>
    other.loveLanguages.includes(lang),
  ).length;
  const loveLanguageScore =
    (loveLanguageOverlap / Math.max(current.loveLanguages.length, 1)) * 12;
  score += loveLanguageScore;
  criteriaCount += 1;

  // Interests overlap (12 points)
  const interestOverlap = current.interests.filter((interest) =>
    other.interests.includes(interest),
  ).length;
  const minInterests = Math.max(
    current.interests.length,
    other.interests.length,
  );
  const interestScore = (interestOverlap / minInterests) * 12;
  score += interestScore;
  criteriaCount += 1;

  // Ideal first date (10 points)
  if (current.idealFirstDate === other.idealFirstDate) {
    score += 10;
  }
  criteriaCount += 1;

  // Humor style (8 points)
  if (current.humorStyle === other.humorStyle) {
    score += 8;
  }
  criteriaCount += 1;

  // Social energy compatibility (8 points)
  if (current.socialEnergy === other.socialEnergy) {
    score += 8;
  } else {
    // Ambivert can match with anyone
    if (
      current.socialEnergy === "Ambivert" ||
      other.socialEnergy === "Ambivert"
    ) {
      score += 4;
    }
  }
  criteriaCount += 1;

  // Weekend style (5 points)
  if (current.weekendStyle === other.weekendStyle) {
    score += 5;
  }
  criteriaCount += 1;

  // Core values (5 points)
  if (current.coreValue === other.coreValue) {
    score += 5;
  }
  criteriaCount += 1;

  // Green flags (3 points)
  if (current.greenFlag === other.greenFlag) {
    score += 3;
  }
  criteriaCount += 1;

  // Communication style (3 points)
  if (current.communicationStyle === other.communicationStyle) {
    score += 3;
  }
  criteriaCount += 1;

  // Relationship pace (3 points)
  if (current.relationshipPace === other.relationshipPace) {
    score += 3;
  }
  criteriaCount += 1;

  const totalPossibleScore = 12 * criteriaCount;
  const compatibilityPercentage = (score / totalPossibleScore) * 100;

  return Math.round(compatibilityPercentage);
}

export async function getMatches(
  currentUserId: string,
  minCompatibility: number = 50,
): Promise<Match[]> {
  // Get current user
  const { data: currentUserData, error: currentUserError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", currentUserId)
    .single();

  if (currentUserError || !currentUserData) {
    throw new Error("Could not load your profile");
  }

  const currentUser = mapProfileRow(currentUserData as ProfileRow);
  const oppositeGender = getOppositeGender(currentUser.gender);

  // Get opposite-gender users only
  const { data: allUsers, error: allUsersError } = await supabase
    .from("profiles")
    .select("*")
    .neq("id", currentUserId)
    .eq("gender", oppositeGender);

  if (allUsersError) {
    throw new Error("Could not load other profiles");
  }

  const otherUsers = (allUsers || []).map((profile) =>
    mapProfileRow(profile as ProfileRow),
  );

  // Calculate compatibility for each user
  const matchesWithScores: Match[] = otherUsers
    .map((user) => ({
      ...user,
      compatibilityScore: calculateCompatibility(currentUser, user),
    }))
    .filter(
      (match) =>
        match.compatibilityScore >= minCompatibility &&
        match.matchmakingAnswers, // Only show users who completed questionnaire
    )
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  return matchesWithScores;
}

export async function getAllPotentialMatches(
  currentUserId: string,
): Promise<Match[]> {
  const { data: currentUserData, error: currentUserError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", currentUserId)
    .single();

  if (currentUserError || !currentUserData) {
    throw new Error("Could not load your profile");
  }

  const currentUser = mapProfileRow(currentUserData as ProfileRow);
  const oppositeGender = getOppositeGender(currentUser.gender);

  // Fallback mode: pull every visible opposite-gender profile except current user.
  const { data: allUsers, error: allUsersError } = await supabase
    .from("profiles")
    .select("*")
    .neq("id", currentUserId)
    .eq("gender", oppositeGender);

  if (allUsersError) {
    throw new Error("Could not load other profiles");
  }

  const otherUsers = (allUsers || []).map((profile) =>
    mapProfileRow(profile as ProfileRow),
  );

  return otherUsers.map((user) => ({
    ...user,
    compatibilityScore: 0,
  }));
}
