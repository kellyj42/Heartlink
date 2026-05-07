import Link from "next/link";

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-red-600 px-6 py-28">
      {/* Background Glow */}
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-red-400/30 blur-3xl" />

      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      {/* Content */}
      <div className="relative mx-auto max-w-4xl text-center">
        <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md">
          Join HeartLink Today
        </span>

        <h2 className="mt-8 text-4xl font-bold leading-tight text-white md:text-6xl">
          Ready To Meet
          <span className="block">Someone Special?</span>
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-red-100">
          Start your journey toward meaningful relationships and genuine
          connections with HeartLink.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-2xl bg-white px-8 py-4 font-semibold text-red-600 transition hover:bg-red-100"
          >
            Create Account
          </Link>

          <Link
            href="/login"
            className="rounded-2xl border border-white/30 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
          >
            Login
          </Link>
        </div>
      </div>
    </section>
  );
}
