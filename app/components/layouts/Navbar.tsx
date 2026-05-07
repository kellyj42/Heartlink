import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/20 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-2 py-1">
        {/* Logo */}
        <Link href="/" className="flex flex-col">
          <img src="/logo.png" alt="HeartLink Logo" className="w-[70]" />

          <span className="text-md font-bold text-white">HeartLink</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-6 text-sm font-medium">
          <a
            href="#how-it-works"
            className="hidden text-white/80 transition hover:text-white md:inline"
          >
            How It Works
          </a>

          <a
            href="#features"
            className="hidden text-white/80 transition hover:text-white md:inline"
          >
            Features
          </a>

          <Link
            href="/login"
            className="text-white/90 transition hover:text-white"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="rounded-full bg-red-600 px-5 py-2.5 text-white transition hover:bg-red-700"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}
