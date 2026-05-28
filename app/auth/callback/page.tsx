"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Confirming your account...");

  useEffect(() => {
    let isMounted = true;

    async function confirmSession() {
      const code = searchParams.get("code");

      if (!code) {
        setMessage("This confirmation link is missing its login code.");
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!isMounted) {
        return;
      }

      if (error) {
        setMessage(error.message);
        return;
      }

      window.sessionStorage.setItem("heartlink_new_user", "true");
      router.replace("/questions?newUser=1");
    }

    void confirmSession();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-red-50 px-6">
      <section className="w-full max-w-md rounded-[1.75rem] border border-red-100 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">HeartLink</h1>
        <p className="mt-4 text-sm leading-6 text-gray-600">{message}</p>
        {message !== "Confirming your account..." ? (
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Back to login
          </Link>
        ) : null}
      </section>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-red-50 px-6">
          <section className="w-full max-w-md rounded-[1.75rem] border border-red-100 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">HeartLink</h1>
            <p className="mt-4 text-sm leading-6 text-gray-600">
              Confirming your account...
            </p>
          </section>
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
