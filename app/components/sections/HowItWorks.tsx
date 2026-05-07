"use client";

import Image from "next/image";
import { UserPlus, MessageCircle } from "lucide-react";

export default function HowItWorks() {
  return (
    <section className="bg-white py-28 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center">
          <p className="text-red-600 font-semibold tracking-wide uppercase">
            How It Works
          </p>

          <h2 className="mt-4 text-4xl md:text-5xl font-bold text-gray-900">
            Simple Steps To Find
            <span className="text-red-600"> Real Connections</span>
          </h2>

          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 leading-8">
            HeartLink helps you meet compatible people through a smooth and
            meaningful dating experience.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-20 grid gap-8 md:grid-cols-3">
          {/* Card 1 */}
          <div className="group relative overflow-hidden rounded-[2rem] bg-red-50 p-10 transition hover:-translate-y-2 hover:shadow-2xl">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-red-600 text-white">
              <UserPlus size={36} />
            </div>

            <div className="mt-8">
              <span className="text-red-500 font-bold text-sm">STEP 01</span>

              <h3 className="mt-3 text-2xl font-bold text-gray-900">
                Create Your Profile
              </h3>

              <p className="mt-4 text-gray-600 leading-7">
                Sign up and tell us about yourself, your interests, and what you
                are looking for in a relationship.
              </p>
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 bg-red-200 rounded-full blur-3xl opacity-40" />
          </div>

          {/* Card 2 */}
          <div className="group relative overflow-hidden rounded-[2rem] bg-red-600 p-10 text-white transition hover:-translate-y-2 hover:shadow-2xl">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white text-red-600">
              <Image
                src="/logo.png"
                alt="HeartLink Logo"
                width={56}
                height={56}
                className="h-14 w-14 object-contain"
              />
            </div>

            <div className="mt-8">
              <span className="text-red-200 font-bold text-sm">STEP 02</span>

              <h3 className="mt-3 text-2xl font-bold">
                Match By Compatibility
              </h3>

              <p className="mt-4 text-red-100 leading-7">
                Our smart matching system connects you with people who share
                your personality, values, and goals.
              </p>
            </div>

            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/20 rounded-full blur-3xl" />
          </div>

          {/* Card 3 */}
          <div className="group relative overflow-hidden rounded-[2rem] bg-red-50 p-10 transition hover:-translate-y-2 hover:shadow-2xl">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-red-600 text-white">
              <MessageCircle size={36} />
            </div>

            <div className="mt-8">
              <span className="text-red-500 font-bold text-sm">STEP 03</span>

              <h3 className="mt-3 text-2xl font-bold text-gray-900">
                Start Connecting
              </h3>

              <p className="mt-4 text-gray-600 leading-7">
                Chat, connect, and build meaningful relationships in a safe and
                friendly environment.
              </p>
            </div>

            <div className="absolute top-0 left-0 w-32 h-32 bg-red-200 rounded-full blur-3xl opacity-40" />
          </div>
        </div>
      </div>
    </section>
  );
}
