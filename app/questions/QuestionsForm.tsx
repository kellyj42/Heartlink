"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, Save, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import {
  getCurrentUser,
  getDefaultMatchmakingAnswers,
  MatchmakingAnswers,
  saveMatchmakingAnswers,
  StoredUser,
} from "../lib/localUsers";

const loveLanguageOptions = ["Words", "Touch", "Gifts", "Acts", "Time", "Humor"];
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
const firstDateOptions = ["Coffee", "Picnic", "Movies", "Museum", "Arcade", "Roadtrip"];
const humorStyleOptions = ["Witty", "Dry", "Playful", "Silly", "Bold"];
const socialEnergyOptions = ["Introvert", "Ambivert", "Extrovert"];
const weekendStyleOptions = ["Cozy", "Active", "Social", "Quiet", "Spontaneous"];
const coreValueOptions = ["Honesty", "Faith", "Loyalty", "Ambition", "Peace"];
const greenFlagOptions = ["Consistency", "Kindness", "Humor", "Maturity", "Effort"];
const distancePreferenceOptions = ["Same city", "Nearby town", "Any distance"];

function fieldClassName() {
  return "mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20";
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof UserRound;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={fieldClassName()}
        placeholder={placeholder}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={fieldClassName()}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function ChipSelector({
  label,
  options,
  selected,
  limit,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  limit: number;
  onChange: (values: string[]) => void;
}) {
  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
      return;
    }

    if (selected.length < limit) {
      onChange([...selected, value]);
    }
  }

  return (
    <div>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <div className="mt-3 flex flex-wrap gap-3">
        {options.map((option) => {
          const isSelected = selected.includes(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
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
    </div>
  );
}

async function fileToImageDataUrl(file: File) {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read this image."));
    reader.readAsDataURL(file);
  });

  return await new Promise<string>((resolve) => {
    const image = new window.Image();

    image.onload = () => {
      const maxSize = 900;
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");

      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.78));
    };

    image.onerror = () => resolve(dataUrl);
    image.src = dataUrl;
  });
}

export default function QuestionsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [answers, setAnswers] = useState<MatchmakingAnswers>(
    getDefaultMatchmakingAnswers("Male"),
  );

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
        if (isMounted) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Could not load your profile right now.",
          );
          setIsSuccess(false);
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
  }, [searchParams]);

  function updateAnswer(field: keyof MatchmakingAnswers, value: string | string[]) {
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

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setIsSuccess(false);
      setMessage("Please choose an image file.");
      return;
    }

    const photo = await fileToImageDataUrl(file);
    updateAnswer("photo", photo);
    setMessage("");
  }

  async function handleMoreImagesChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith("image/"),
    );

    const images = await Promise.all(files.slice(0, 4).map(fileToImageDataUrl));
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

  async function saveAnswers() {
    if (isSaving) {
      return;
    }

    const missingFields = [
      !answers.dateOfBirth ? "date of birth" : "",
      !answers.contact.trim() ? "WhatsApp" : "",
      !answers.shortBio.trim() ? "bio" : "",
      answers.loveLanguages.length === 0 ? "love language" : "",
      answers.interests.length < 3 ? "at least 3 interests" : "",
      !answers.coreValue ? "core value" : "",
      !answers.greenFlag ? "green flag" : "",
    ].filter(Boolean);

    if (missingFields.length > 0) {
      setIsSuccess(false);
      setMessage(`Please add: ${missingFields.join(", ")}.`);
      return;
    }

    setIsSaving(true);
    setIsSuccess(false);
    setMessage("Saving your answers...");

    const result = await saveMatchmakingAnswers(answers);

    setIsSuccess(result.ok);
    setMessage(result.message);
    setIsSaving(false);

    if (result.ok) {
      router.push("/dashboard");
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
    <div className="space-y-6">
      <Section title="Basic Profile" icon={UserRound}>
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[1.5rem] bg-red-50 p-5 text-center">
            {answers.photo ? (
              <Image
                src={answers.photo}
                alt="Selected profile preview"
                width={176}
                height={176}
                unoptimized
                className="mx-auto h-44 w-44 rounded-[1.75rem] border border-red-100 object-cover shadow-sm"
              />
            ) : (
              <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-[1.75rem] border border-dashed border-red-200 bg-white text-gray-500">
                <Camera className="h-8 w-8 text-red-400" />
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

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Date of Birth"
              type="date"
              value={answers.dateOfBirth}
              onChange={(value) => updateAnswer("dateOfBirth", value)}
            />
            <SelectField
              label="Gender"
              value={answers.gender}
              options={["Female", "Male"]}
              onChange={(value) => updateAnswer("gender", value)}
            />
            <SelectField
              label="Location"
              value={answers.location}
              options={["Nairobi", "Kampala", "Mombasa", "Kisumu", "Other"]}
              onChange={(value) => updateAnswer("location", value)}
            />
            <TextField
              label="WhatsApp Contact"
              type="tel"
              value={answers.contact}
              placeholder="254712345678"
              onChange={(value) => updateAnswer("contact", value)}
            />
            <TextField
              label="Occupation"
              value={answers.occupation ?? ""}
              onChange={(value) => updateAnswer("occupation", value)}
            />
            <TextField
              label="Education"
              value={answers.education ?? ""}
              onChange={(value) => updateAnswer("education", value)}
            />
            <label className="block text-sm font-medium text-gray-700 sm:col-span-2">
              More Photos
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleMoreImagesChange}
                className={fieldClassName()}
              />
            </label>
            <label className="block text-sm font-medium text-gray-700 sm:col-span-2">
              Brief Bio
              <textarea
                value={answers.shortBio}
                onChange={(event) => updateAnswer("shortBio", event.target.value)}
                rows={4}
                className={`${fieldClassName()} resize-none`}
                placeholder="Say a little about yourself."
              />
            </label>
          </div>
        </div>
      </Section>

      <Section title="Vibe And Interests" icon={Sparkles}>
        <div className="space-y-6">
          <div className="rounded-[1.5rem] bg-red-50 p-5">
            <p className="text-sm font-semibold text-gray-900">Interested In</p>
            <p className="mt-1 text-lg font-bold text-red-600">
              {answers.interestedIn}
            </p>
          </div>
          <ChipSelector
            label="Love Languages"
            options={loveLanguageOptions}
            selected={answers.loveLanguages}
            limit={3}
            onChange={(values) => updateAnswer("loveLanguages", values)}
          />
          <ChipSelector
            label="Interests"
            options={interestOptions}
            selected={answers.interests}
            limit={5}
            onChange={(values) => updateAnswer("interests", values)}
          />
          <div className="grid gap-5 sm:grid-cols-3">
            <SelectField
              label="Personality"
              value={answers.personality}
              options={["Calm", "Outgoing", "Funny", "Serious", "Adventurous"]}
              onChange={(value) => updateAnswer("personality", value)}
            />
            <SelectField
              label="Humor Style"
              value={answers.humorStyle}
              options={humorStyleOptions}
              onChange={(value) => updateAnswer("humorStyle", value)}
            />
            <SelectField
              label="Social Energy"
              value={answers.socialEnergy}
              options={socialEnergyOptions}
              onChange={(value) => updateAnswer("socialEnergy", value)}
            />
          </div>
        </div>
      </Section>

      <Section title="Dating Preferences" icon={ShieldCheck}>
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Ideal First Date"
            value={answers.idealFirstDate}
            options={firstDateOptions}
            onChange={(value) => updateAnswer("idealFirstDate", value)}
          />
          <SelectField
            label="Weekend Vibe"
            value={answers.weekendStyle}
            options={weekendStyleOptions}
            onChange={(value) => updateAnswer("weekendStyle", value)}
          />
          <SelectField
            label="Communication Style"
            value={answers.communicationStyle}
            options={["Texting", "Calls", "Video", "In-person"]}
            onChange={(value) => updateAnswer("communicationStyle", value)}
          />
          <SelectField
            label="Relationship Pace"
            value={answers.relationshipPace}
            options={[
              "Take things slowly",
              "Start as friends first",
              "Ready for a serious relationship",
            ]}
            onChange={(value) => updateAnswer("relationshipPace", value)}
          />
          <SelectField
            label="Preferred Partner"
            value={answers.partnerPreference}
            options={[
              "Kind, honest, and respectful",
              "Funny, social, and confident",
              "Calm, understanding, and patient",
              "Ambitious, hardworking, and focused",
            ]}
            onChange={(value) => updateAnswer("partnerPreference", value)}
          />
          <SelectField
            label="Core Value"
            value={answers.coreValue}
            options={["", ...coreValueOptions]}
            onChange={(value) => updateAnswer("coreValue", value)}
          />
          <SelectField
            label="Biggest Green Flag"
            value={answers.greenFlag}
            options={["", ...greenFlagOptions]}
            onChange={(value) => updateAnswer("greenFlag", value)}
          />
          <SelectField
            label="Distance Preference"
            value={answers.distancePreference}
            options={distancePreferenceOptions}
            onChange={(value) => updateAnswer("distancePreference", value)}
          />
        </div>
      </Section>

      <Section title="Social Links" icon={Sparkles}>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Instagram"
            type="url"
            value={answers.socialLinks?.instagram ?? ""}
            onChange={(value) => updateSocialLink("instagram", value)}
          />
          <TextField
            label="Facebook"
            type="url"
            value={answers.socialLinks?.facebook ?? ""}
            onChange={(value) => updateSocialLink("facebook", value)}
          />
          <TextField
            label="X / Twitter"
            type="url"
            value={answers.socialLinks?.x ?? ""}
            onChange={(value) => updateSocialLink("x", value)}
          />
          <TextField
            label="LinkedIn"
            type="url"
            value={answers.socialLinks?.linkedin ?? ""}
            onChange={(value) => updateSocialLink("linkedin", value)}
          />
          <TextField
            label="Website"
            type="url"
            value={answers.socialLinks?.website ?? ""}
            onChange={(value) => updateSocialLink("website", value)}
          />
        </div>
      </Section>

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

      <button
        type="button"
        onClick={saveAnswers}
        disabled={isSaving}
        className="relative z-20 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-4 font-semibold text-white shadow-lg shadow-red-900/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Save className="h-5 w-5" />
        {isSaving ? "Saving Answers..." : "Save Answers"}
      </button>
    </div>
  );
}
