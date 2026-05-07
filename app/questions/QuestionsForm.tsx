"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Camera,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  getCurrentUser,
  getDefaultMatchmakingAnswers,
  MatchmakingAnswers,
  saveMatchmakingAnswers,
  StoredUser,
} from "../lib/localUsers";

const totalSteps = 4;
const loveLanguageOptions = [
  "Words",
  "Touch",
  "Gifts",
  "Acts",
  "Time",
  "Humor",
];
const interestOptions = [
  "Music",
  "Travel",
  "Reading",
  "Sports",
  "Gaming",
  "Movies",
  "Cooking",
  "Prayer",
];
const firstDateOptions = [
  "Coffee",
  "Picnic",
  "Movies",
  "Museum",
  "Arcade",
  "Roadtrip",
];
const humorStyleOptions = ["Witty", "Dry", "Playful", "Silly", "Bold"];
const socialEnergyOptions = ["Introvert", "Ambivert", "Extrovert"];
const weekendStyleOptions = [
  "Cozy",
  "Active",
  "Social",
  "Quiet",
  "Spontaneous",
];
const coreValueOptions = ["Honesty", "Faith", "Loyalty", "Ambition", "Peace"];
const greenFlagOptions = [
  "Consistency",
  "Kindness",
  "Humor",
  "Maturity",
  "Effort",
];
const distancePreferenceOptions = ["Same city", "Nearby town", "Any distance"];

const stepDetails = [
  {
    number: 1,
    title: "Basic profile",
    description: "Add your photo, date of birth, contact, and a short intro.",
    icon: UserRound,
  },
  {
    number: 2,
    title: "Vibe and interests",
    description: "Show your energy, love style, and what you genuinely enjoy.",
    icon: Sparkles,
  },
  {
    number: 3,
    title: "Dating preferences",
    description: "Choose the kind of connection and experience that fits you.",
    icon: Sparkles,
  },
  {
    number: 4,
    title: "Values and lifestyle",
    description: "Add the deeper details that make a match feel more real.",
    icon: ShieldCheck,
  },
];

function fieldClassName() {
  return "mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20";
}

function ChipSelector({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-3">
      {options.map((option) => {
        const isSelected = selected.includes(option);

        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              isSelected
                ? "border-red-600 bg-red-600 text-white"
                : "border-red-200 bg-white text-red-600 hover:bg-red-50"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

export default function QuestionsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<MatchmakingAnswers>(
    getDefaultMatchmakingAnswers("Male"),
  );
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (searchParams.get("newUser") === "1") {
      window.sessionStorage.setItem("heartlink_new_user", "true");
    }

    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();

        if (!isMounted) {
          return;
        }

        if (!currentUser) {
          setMessage("Please login before answering questions.");
          setIsSuccess(false);
          setIsLoading(false);
          return;
        }

        const defaults = getDefaultMatchmakingAnswers(currentUser.gender);

        setUser(currentUser);
        setAnswers({
          ...defaults,
          ...currentUser.matchmakingAnswers,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setMessage(
          error instanceof Error
            ? error.message
            : "Could not load your profile right now.",
        );
        setIsSuccess(false);
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
  }, [searchParams]);

  const progressWidth = `${(step / totalSteps) * 100}%`;

  function updateAnswer(
    field: keyof MatchmakingAnswers,
    value: string | string[],
  ) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [field]: value,
      ...(field === "gender"
        ? {
            interestedIn: value === "Male" ? "Female" : "Male",
          }
        : {}),
    }));
  }

  function toggleArrayAnswer(
    field: "loveLanguages" | "interests",
    value: string,
    limit: number,
  ) {
    setAnswers((currentAnswers) => {
      const currentValues = currentAnswers[field];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : currentValues.length < limit
          ? [...currentValues, value]
          : currentValues;

      return {
        ...currentAnswers,
        [field]: nextValues,
      };
    });
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setIsSuccess(false);
      setMessage("Please choose an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      updateAnswer("photo", String(reader.result));
      setMessage("");
    };

    reader.readAsDataURL(file);
  }

  async function handleMoreImagesChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (files.length === 0) {
      setIsSuccess(false);
      setMessage("Please choose image files.");
      return;
    }

    const images = await Promise.all(
      files.slice(0, 4).map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.readAsDataURL(file);
          }),
      ),
    );

    updateAnswer("moreImages", images);
    setMessage("");
  }

  function updateSocialLink(
    field: "instagram" | "facebook" | "x" | "linkedin" | "website",
    value: string,
  ) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      socialLinks: {
        ...currentAnswers.socialLinks,
        [field]: value,
      },
    }));
  }

  function goToNextStep() {
    setMessage("");
    setStep((currentStep) => Math.min(currentStep + 1, totalSteps));
  }

  function goToPreviousStep() {
    setMessage("");
    setStep((currentStep) => Math.max(currentStep - 1, 1));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !answers.photo ||
      !answers.contact.trim() ||
      !answers.dateOfBirth ||
      !answers.shortBio.trim() ||
      answers.loveLanguages.length === 0 ||
      answers.interests.length < 3 ||
      !answers.idealFirstDate ||
      !answers.coreValue ||
      !answers.greenFlag
    ) {
      setIsSuccess(false);
      setMessage("Please complete all required fields before saving.");
      return;
    }

    const result = await saveMatchmakingAnswers(answers);
    setIsSuccess(result.ok);
    setMessage(result.message);

    if (result.ok) {
      router.push("/matches");
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-[1.75rem] border border-red-100 bg-white p-8 text-center text-gray-600">
        Loading your profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-[1.75rem] border border-red-100 bg-white p-8 text-center">
        <p className="text-gray-700">{message || "Please login first."}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-[1.75rem] border border-red-100 bg-red-50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-600">
              Step {step} of {totalSteps}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              {stepDetails[step - 1].title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              {stepDetails[step - 1].description}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-3 shadow-sm">
            {(() => {
              const CurrentIcon = stepDetails[step - 1].icon;
              return <CurrentIcon className="h-6 w-6 text-red-400" />;
            })()}
          </div>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-red-100">
          <div
            className="h-full rounded-full bg-red-500 transition-all duration-300"
            style={{ width: progressWidth }}
          />
        </div>
      </div>

      {step === 1 ? (
        <div className="rounded-[1.75rem] border border-gray-100 bg-white p-6 sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-[1.5rem] bg-red-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
                Profile Photo
              </p>

              <div className="mt-5 flex flex-col items-center text-center">
                {answers.photo ? (
                  <Image
                    src={answers.photo}
                    alt="Selected profile preview"
                    width={176}
                    height={176}
                    unoptimized
                    className="h-44 w-44 rounded-[1.75rem] border border-red-100 object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-44 w-44 items-center justify-center rounded-[1.75rem] border border-dashed border-red-200 bg-white text-gray-500">
                    <div className="text-center">
                      <Camera className="mx-auto h-8 w-8 text-red-400" />
                      <p className="mt-3 text-sm">Upload a clear image</p>
                    </div>
                  </div>
                )}

                <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700">
                  <Camera className="h-4 w-4" />
                  Choose Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-gray-700">
                Date of Birth
                <input
                  type="date"
                  value={answers.dateOfBirth}
                  onChange={(event) =>
                    updateAnswer("dateOfBirth", event.target.value)
                  }
                  className={fieldClassName()}
                />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Gender
                <select
                  value={answers.gender}
                  onChange={(event) =>
                    updateAnswer("gender", event.target.value)
                  }
                  className={fieldClassName()}
                >
                  <option>Female</option>
                  <option>Male</option>
                </select>
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Location
                <select
                  value={answers.location}
                  onChange={(event) =>
                    updateAnswer("location", event.target.value)
                  }
                  className={fieldClassName()}
                >
                  <option>Nairobi</option>
                  <option>Kampala</option>
                  <option>Mombasa</option>
                  <option>Kisumu</option>
                  <option>Other</option>
                </select>
              </label>

              <label className="block text-sm font-medium text-gray-700">
                WhatsApp Contact
                <input
                  type="tel"
                  value={answers.contact}
                  onChange={(event) =>
                    updateAnswer("contact", event.target.value)
                  }
                  className={fieldClassName()}
                  placeholder="254712345678"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Use country code without the plus sign.
                </p>
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Occupation
                <input
                  type="text"
                  value={answers.occupation ?? ""}
                  onChange={(event) =>
                    updateAnswer("occupation", event.target.value)
                  }
                  className={fieldClassName()}
                  placeholder="Student, designer, entrepreneur..."
                />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Education
                <input
                  type="text"
                  value={answers.education ?? ""}
                  onChange={(event) =>
                    updateAnswer("education", event.target.value)
                  }
                  className={fieldClassName()}
                  placeholder="University, course, or school"
                />
              </label>

              <label className="block text-sm font-medium text-gray-700 sm:col-span-2">
                More Photos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMoreImagesChange}
                  className={fieldClassName()}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Add up to 4 extra images for your details page.
                </p>
              </label>

              <label className="block text-sm font-medium text-gray-700 sm:col-span-2">
                Brief Bio
                <textarea
                  value={answers.shortBio}
                  onChange={(event) =>
                    updateAnswer("shortBio", event.target.value)
                  }
                  rows={4}
                  placeholder="Say a little about yourself in a warm, simple way."
                  className={`${fieldClassName()} resize-none`}
                />
              </label>
            </div>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-5 rounded-[1.75rem] border border-gray-100 bg-white p-6 sm:p-7">
          <div className="rounded-[1.5rem] bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/15 text-red-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Interested In
                </p>
                <p className="mt-1 text-lg font-bold text-red-500">
                  {answers.interestedIn}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  This is set automatically from the selected gender.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Love Language
            </label>
            <p className="mt-2 text-sm text-gray-500">
              Pick up to 3 that fit you best.
            </p>
            <ChipSelector
              options={loveLanguageOptions}
              selected={answers.loveLanguages}
              onToggle={(value) => toggleArrayAnswer("loveLanguages", value, 3)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Interests
            </label>
            <p className="mt-2 text-sm text-gray-500">
              Pick 3 to 5 interests that describe your world.
            </p>
            <ChipSelector
              options={interestOptions}
              selected={answers.interests}
              onToggle={(value) => toggleArrayAnswer("interests", value, 5)}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <label className="block text-sm font-medium text-gray-700">
              Personality
              <select
                value={answers.personality}
                onChange={(event) =>
                  updateAnswer("personality", event.target.value)
                }
                className={fieldClassName()}
              >
                <option>Calm</option>
                <option>Outgoing</option>
                <option>Funny</option>
                <option>Serious</option>
                <option>Adventurous</option>
              </select>
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Humor Style
              <select
                value={answers.humorStyle}
                onChange={(event) =>
                  updateAnswer("humorStyle", event.target.value)
                }
                className={fieldClassName()}
              >
                {humorStyleOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Social Energy
              <select
                value={answers.socialEnergy}
                onChange={(event) =>
                  updateAnswer("socialEnergy", event.target.value)
                }
                className={fieldClassName()}
              >
                {socialEnergyOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-5 rounded-[1.75rem] border border-gray-100 bg-white p-6 sm:p-7">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              Ideal First Date
              <select
                value={answers.idealFirstDate}
                onChange={(event) =>
                  updateAnswer("idealFirstDate", event.target.value)
                }
                className={fieldClassName()}
              >
                {firstDateOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Weekend Vibe
              <select
                value={answers.weekendStyle}
                onChange={(event) =>
                  updateAnswer("weekendStyle", event.target.value)
                }
                className={fieldClassName()}
              >
                {weekendStyleOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Communication Style
              <select
                value={answers.communicationStyle}
                onChange={(event) =>
                  updateAnswer("communicationStyle", event.target.value)
                }
                className={fieldClassName()}
              >
                <option>Texting</option>
                <option>Calls</option>
                <option>Video</option>
                <option>In-person</option>
              </select>
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Relationship Pace
              <select
                value={answers.relationshipPace}
                onChange={(event) =>
                  updateAnswer("relationshipPace", event.target.value)
                }
                className={fieldClassName()}
              >
                <option>Take things slowly</option>
                <option>Start as friends first</option>
                <option>Ready for a serious relationship</option>
              </select>
            </label>
          </div>

          <label className="block text-sm font-medium text-gray-700">
            Preferred Partner
            <select
              value={answers.partnerPreference}
              onChange={(event) =>
                updateAnswer("partnerPreference", event.target.value)
              }
              className={fieldClassName()}
            >
              <option>Kind, honest, and respectful</option>
              <option>Funny, social, and confident</option>
              <option>Calm, understanding, and patient</option>
              <option>Ambitious, hardworking, and focused</option>
            </select>
          </label>

          <div className="rounded-[1.5rem] bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/15 text-red-300">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Creative matching prompts
                </p>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  These little choices help the app understand whether you are
                  more cozy or adventurous, more witty or playful, and what kind
                  of first impression feels natural to you.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-5 rounded-[1.75rem] border border-gray-100 bg-white p-6 sm:p-7">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              Core Value
              <select
                value={answers.coreValue}
                onChange={(event) =>
                  updateAnswer("coreValue", event.target.value)
                }
                className={fieldClassName()}
              >
                {coreValueOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Biggest Green Flag
              <select
                value={answers.greenFlag}
                onChange={(event) =>
                  updateAnswer("greenFlag", event.target.value)
                }
                className={fieldClassName()}
              >
                {greenFlagOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-gray-700 sm:col-span-2">
              Distance Preference
              <select
                value={answers.distancePreference}
                onChange={(event) =>
                  updateAnswer("distancePreference", event.target.value)
                }
                className={fieldClassName()}
              >
                {distancePreferenceOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              Instagram
              <input
                type="url"
                value={answers.socialLinks?.instagram ?? ""}
                onChange={(event) =>
                  updateSocialLink("instagram", event.target.value)
                }
                className={fieldClassName()}
                placeholder="https://instagram.com/username"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Facebook
              <input
                type="url"
                value={answers.socialLinks?.facebook ?? ""}
                onChange={(event) =>
                  updateSocialLink("facebook", event.target.value)
                }
                className={fieldClassName()}
                placeholder="https://facebook.com/username"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              X / Twitter
              <input
                type="url"
                value={answers.socialLinks?.x ?? ""}
                onChange={(event) => updateSocialLink("x", event.target.value)}
                className={fieldClassName()}
                placeholder="https://x.com/username"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              LinkedIn
              <input
                type="url"
                value={answers.socialLinks?.linkedin ?? ""}
                onChange={(event) =>
                  updateSocialLink("linkedin", event.target.value)
                }
                className={fieldClassName()}
                placeholder="https://linkedin.com/in/username"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Website
              <input
                type="url"
                value={answers.socialLinks?.website ?? ""}
                onChange={(event) =>
                  updateSocialLink("website", event.target.value)
                }
                className={fieldClassName()}
                placeholder="https://example.com"
              />
            </label>
          </div>

          <div className="rounded-[1.5rem] bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/15 text-red-300">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Why this step helps
                </p>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Two people can like the same music and still want completely
                  different relationships. Values, effort, and distance comfort
                  usually make the biggest difference after the first hello.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {message ? (
        <p
          className={`rounded-2xl border px-4 py-3 text-sm ${
            isSuccess
              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-700"
              : "border-red-400/30 bg-red-500/10 text-red-700"
          }`}
        >
          {message}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        {step > 1 ? (
          <button
            type="button"
            onClick={goToPreviousStep}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50"
          >
            Back
          </button>
        ) : (
          <div className="hidden w-full sm:block" />
        )}

        {step < totalSteps ? (
          <button
            type="button"
            onClick={goToNextStep}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white shadow-lg shadow-red-900/20 transition hover:bg-red-700"
          >
            Next Step
            <Sparkles className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white shadow-lg shadow-red-900/20 transition hover:bg-red-700"
          >
            Save Answers
            <Image
              src="/logo.png"
              alt=""
              width={18}
              height={18}
              className="h-5 w-5 object-contain"
            />
          </button>
        )}
      </div>
    </form>
  );
}
