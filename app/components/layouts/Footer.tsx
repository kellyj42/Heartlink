import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-slate-950 px-6 pt-24 text-white">
      {/* Glow Effects */}
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-red-600/20 blur-3xl" />

      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-red-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Top Section */}
        <div className="grid gap-14 border-b border-white/10 pb-16 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="HeartLink Logo"
                className="h-12 w-auto"
              />

              <h2 className="text-3xl font-bold">HeartLink</h2>
            </div>

            <p className="mt-6 leading-7 text-slate-400">
              A modern dating platform focused on meaningful relationships,
              compatibility, and real connections.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold">Navigation</h3>

            <div className="mt-6 flex flex-col gap-4 text-slate-400">
              <Link href="/" className="transition hover:text-white">
                Home
              </Link>

              <a href="#how-it-works" className="transition hover:text-white">
                How It Works
              </a>

              <a href="#features" className="transition hover:text-white">
                Features
              </a>

              <Link href="/signup" className="transition hover:text-white">
                Join Now
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold">Legal</h3>

            <div className="mt-6 flex flex-col gap-4 text-slate-400">
              <Link href="/privacy" className="transition hover:text-white">
                Privacy Policy
              </Link>

              <Link href="/terms" className="transition hover:text-white">
                Terms & Conditions
              </Link>

              <Link href="/safety" className="transition hover:text-white">
                Safety Tips
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold">Stay Connected</h3>

            <p className="mt-6 text-slate-400">
              Get updates and relationship tips from HeartLink.
            </p>

            <form className="mt-6 flex flex-col gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-red-500"
              />

              <button
                type="submit"
                className="rounded-2xl bg-red-600 px-5 py-4 font-semibold text-white transition hover:bg-red-700"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between gap-6 py-8 text-center md:flex-row">
          <p className="text-sm text-slate-500">
            © 2026 HeartLink. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-slate-400">
            <a href="#" className="transition hover:text-white">
              Instagram
            </a>

            <a href="#" className="transition hover:text-white">
              Twitter
            </a>

            <a href="#" className="transition hover:text-white">
              Facebook
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
