"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { getCurrentUser, upsertUserProfile } from "@/app/lib/localUsers";

type AuthMode = "signin" | "signup";

type AuthProps = {
  initialMode?: AuthMode;
};

export default function Auth({ initialMode = "signin" }: AuthProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [datingGoal, setDatingGoal] = useState("Long-term relationship");
  const [rememberMe, setRememberMe] = useState(true);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!email.trim() || !password.trim()) {
      setIsSuccess(false);
      setMessage("Please enter your email and password.");
      return;
    }

    if (mode === "signup" && !fullName.trim()) {
      setIsSuccess(false);
      setMessage("Please enter your full name.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: fullName.trim(),
              gender,
              dating_goal: datingGoal,
            },
          },
        });

        if (error) {
          throw error;
        }

        setIsSuccess(true);

        if (data.session && data.user) {
          await upsertUserProfile({
            id: data.user.id,
            name: fullName.trim(),
            email,
            gender,
            datingGoal,
          });
          window.sessionStorage.setItem("heartlink_new_user", "true");
          setMessage("Account created successfully.");
          router.push("/questions");
        } else {
          setMessage(
            "Account created. Check your email to confirm your signup, then login.",
          );
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) {
          throw error;
        }

        const authUser = data.user;
        const metadata = authUser.user_metadata;

        await upsertUserProfile({
          id: authUser.id,
          name:
            typeof metadata.full_name === "string" && metadata.full_name
              ? metadata.full_name
              : (authUser.email?.split("@")[0] ?? "HeartLink User"),
          email: authUser.email ?? email,
          gender: metadata.gender === "Female" ? "Female" : "Male",
          datingGoal:
            typeof metadata.dating_goal === "string" && metadata.dating_goal
              ? metadata.dating_goal
              : "Long-term relationship",
        });

        await getCurrentUser();
        window.sessionStorage.removeItem("heartlink_new_user");

        setIsSuccess(true);
        setMessage("Signed in successfully.");
        router.push("/matches");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong.";

      setIsSuccess(false);
      setMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleMode() {
    setMode((currentMode) => (currentMode === "signin" ? "signup" : "signin"));
    setMessage("");
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/love.png')" }}
      />
      <div className="absolute inset-0 bg-black/65" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/55" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden px-10 py-16 lg:flex lg:items-center">
          <div className="mx-auto max-w-2xl text-white">
            <div className="mb-8 inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md">
              <Image
                src="/logo.png"
                alt="HeartLink Logo"
                width={80}
                height={80}
                className="h-20 w-20 object-contain"
              />
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-300">
              HeartLink
            </p>
            <h1 className="mt-6 text-5xl font-bold leading-tight sm:text-6xl">
              {mode === "signin"
                ? "Welcome back to something meaningful."
                : "Start your journey with a beautiful first step."}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-200">
              {mode === "signin"
                ? "Sign in and continue exploring thoughtful connections in a calm, modern experience."
                : "Create your account and begin building a profile that fits the tone of the HeartLink experience."}
            </p>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-slate-200 transition hover:text-white"
            >
              <Image
                src="/logo.png"
                alt="HeartLink Logo"
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />
              HeartLink
            </Link>

            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10">
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-300">
                  {mode === "signin" ? "Sign In" : "Sign Up"}
                </p>
                <h2 className="mt-3 text-3xl font-bold text-white">
                  {mode === "signin" ? "Welcome back" : "Create your account"}
                </h2>
                <p className="mt-2 text-sm text-slate-200/80">
                  {mode === "signin"
                    ? "Enter your details to continue."
                    : "Fill in a few details to get started."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === "signup" ? (
                  <label className="block text-sm font-medium text-slate-200">
                    Full name
                    <input
                      type="text"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Alex Johnson"
                      className="mt-2 w-full rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-white placeholder:text-slate-300/70 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    />
                  </label>
                ) : null}

                <label className="block text-sm font-medium text-slate-200">
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="mt-2 w-full rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-white placeholder:text-slate-300/70 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-200">
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={
                      mode === "signin"
                        ? "Enter your password"
                        : "Create a password"
                    }
                    className="mt-2 w-full rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-white placeholder:text-slate-300/70 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  />
                </label>

                {mode === "signup" ? (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block text-sm font-medium text-slate-200">
                      Gender
                      <select
                        value={gender}
                        onChange={(event) =>
                          setGender(event.target.value as "Male" | "Female")
                        }
                        className="mt-2 w-full rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      >
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                    </label>

                    <label className="block text-sm font-medium text-slate-200">
                      Dating goal
                      <select
                        value={datingGoal}
                        onChange={(event) => setDatingGoal(event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      >
                        <option>Long-term relationship</option>
                        <option>Meaningful connection</option>
                        <option>Still exploring</option>
                      </select>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4 text-sm text-slate-200/80">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(event) =>
                          setRememberMe(event.target.checked)
                        }
                        className="h-4 w-4 rounded border-white/20 bg-black/30 text-red-500 focus:ring-red-500"
                      />
                      Remember me
                    </label>
                    <span className="text-slate-300/70">Forgot password?</span>
                  </div>
                )}

                {message ? (
                  <p
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      isSuccess
                        ? "bg-emerald-500/15 text-emerald-100"
                        : "bg-red-500/15 text-red-100"
                    }`}
                  >
                    {message}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-900/30 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting
                    ? "Please wait..."
                    : mode === "signin"
                      ? "Sign in"
                      : "Create account"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-200/80">
                {mode === "signin"
                  ? "New to HeartLink?"
                  : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="font-semibold text-red-400 transition hover:text-red-300"
                >
                  {mode === "signin" ? "Create one" : "Sign in"}
                </button>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
