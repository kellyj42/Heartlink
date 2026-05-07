import Link from "next/link";
import { Suspense } from "react";
import QuestionsForm from "./QuestionsForm";

export default function QuestionsPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-10 sm:px-8 lg:px-12">
      <div className="relative">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 transition hover:text-red-700"
          >
            HeartLink
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <section className="rounded-[2rem] bg-red-50 p-8 shadow-sm sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600">
                Matchmaking Setup
              </p>
              <h1 className="mt-5 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
                Tell HeartLink
                <span className="block text-red-600">who fits you best.</span>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-8 text-gray-600">
                This short profile flow helps the app suggest better connections by
                understanding your preferences, lifestyle, and relationship
                style.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
                    Step 1
                  </p>
                  <p className="mt-2 text-sm text-gray-700">
                    Profile details and photo
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
                    Step 2
                  </p>
                  <p className="mt-2 text-sm text-gray-700">
                    Interests and personality
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
                    Step 3
                  </p>
                  <p className="mt-2 text-sm text-gray-700">
                    Relationship preferences
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
                    Step 4
                  </p>
                  <p className="mt-2 text-sm text-gray-700">
                    Values and lifestyle
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-red-100 bg-white p-6 shadow-sm sm:p-8">
              <Suspense
                fallback={
                  <div className="rounded-[1.75rem] border border-red-100 bg-white p-8 text-center text-gray-600">
                    Loading your profile...
                  </div>
                }
              >
                <QuestionsForm />
              </Suspense>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
