import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden mt-20">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/love.png')",
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center px-6">
        <div className="mx-auto w-full max-w-7xl">
          <div className="max-w-3xl">
            {/* Small Badge */}
            

            {/* Main Heading */}
            <h1 className="mt-8 text-5xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl">
              We are not different
              <span className="block text-red-500">
                because we are straight
              </span>
            </h1>

            {/* Paragraph */}
            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-200">
              HeartLink helps you discover meaningful relationships through
              compatibility, shared interests, and genuine connections.
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-2xl bg-red-600 px-8 py-4 text-center font-semibold text-white shadow-2xl shadow-red-900/40 transition hover:bg-red-700"
              >
                Get Started
              </Link>

              <Link
                href="/login"
                className="rounded-2xl border border-white/20 bg-white/10 px-8 py-4 text-center font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
              >
                Login
              </Link>
            </div>

            {/* Premium Stats */}
            <div className="mt-16 flex flex-wrap gap-10">
              <div>
                <h3 className="text-3xl font-bold text-white">10K+</h3>

                <p className="mt-2 text-slate-300">Active Members</p>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-white">95%</h3>

                <p className="mt-2 text-slate-300">Compatibility Rate</p>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-white">24/7</h3>

                <p className="mt-2 text-slate-300">Safe Platform</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    
    </section>
  );
}
