"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  Home,
  LogIn,
  MessageCircle,
  Sparkles,
  UserRound,
} from "lucide-react";
import { getMyConnectionRequests } from "@/app/lib/connectionRequests";
import { getReceivedMessageCount } from "@/app/lib/chatMessages";

const navLinks = [
  { label: "Matches", href: "/matches", Icon: Sparkles },
  { label: "Requests", href: "/requests", Icon: Bell },
  { label: "Messages", href: "/messages", Icon: MessageCircle },
  { label: "Profile", href: "/dashboard", Icon: UserRound },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadPendingRequestCount() {
      try {
        const [data, receivedMessages] = await Promise.all([
          getMyConnectionRequests(),
          getReceivedMessageCount(),
        ]);
        const count = data.requests.filter(
          (request) =>
            request.receiverId === data.currentUserId &&
            request.status === "pending",
        ).length;

        if (isMounted) {
          setPendingRequestCount(count);
          setMessageCount(receivedMessages);
        }
      } catch {
        if (isMounted) {
          setPendingRequestCount(0);
          setMessageCount(0);
        }
      }
    }

    const timer = window.setTimeout(() => {
      void loadPendingRequestCount();
    }, 0);

    return () => {
      isMounted = false;
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#fffaf8] text-slate-950">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-r border-red-100 bg-white px-5 py-6 text-slate-950 lg:fixed lg:inset-y-0 lg:left-0 lg:w-72">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-red-50">
              <Image
                src="/logo.png"
                alt="HeartLink Logo"
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
              />
            </span>
            <span className="text-2xl font-bold">HeartLink</span>
          </Link>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Client matchmaking dashboard
          </p>

          <nav className="mt-8 grid gap-2 text-sm font-medium">
            {navLinks.map(({ label, href, Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-gray-600 transition hover:bg-red-50 hover:text-red-600"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="flex-1">{label}</span>
                {href === "/requests" && pendingRequestCount > 0 ? (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-2 text-xs font-bold text-white">
                    {pendingRequestCount}
                  </span>
                ) : null}
                {href === "/messages" && messageCount > 0 ? (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-2 text-xs font-bold text-white">
                    {messageCount}
                  </span>
                ) : null}
              </Link>
            ))}
            <Link
              href="/"
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-gray-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Home
            </Link>

            <Link
              href="/login"
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-gray-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Logout
            </Link>
          </nav>
        </aside>

        <section className="flex-1 lg:ml-72">{children}</section>
      </div>
    </main>
  );
}
