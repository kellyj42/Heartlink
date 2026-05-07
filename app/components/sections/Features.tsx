"use client";

import Image from "next/image";
import { Lock, MessageCircle, MapPin, Zap, Globe } from "lucide-react";

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-[#fff7f8] px-6 py-28">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="text-center">
          <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-600">
            Features
          </span>

          <h2 className="mt-6 text-4xl font-bold text-slate-900 md:text-5xl">
            Everything You Need To
            <span className="text-red-600"> Find Real Connections</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            HeartLink combines compatibility, simplicity, and safety to help you
            build meaningful relationships.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Card */}
          <div className="rounded-[2rem] bg-white p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Image
                src="/logo.png"
                alt="HeartLink Logo"
                width={44}
                height={44}
                className="h-11 w-11 object-contain"
              />
            </div>

            <h3 className="mt-6 text-2xl font-bold text-slate-900">
              Compatibility Matching
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              Discover people who align with your personality, interests, and
              relationship goals.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-[2rem] bg-white p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Lock size={28} />
            </div>

            <h3 className="mt-6 text-2xl font-bold text-slate-900">
              Safe & Secure
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              Your privacy and safety are protected with secure authentication
              and profile controls.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-[2rem] bg-white p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <MessageCircle size={28} />
            </div>

            <h3 className="mt-6 text-2xl font-bold text-slate-900">
              Real Conversations
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              Build genuine connections through meaningful chats and shared
              interests.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-[2rem] bg-white p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <MapPin size={28} />
            </div>

            <h3 className="mt-6 text-2xl font-bold text-slate-900">
              Nearby Matches
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              Meet people close to your location and start connecting instantly.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-[2rem] bg-white p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Zap size={28} />
            </div>

            <h3 className="mt-6 text-2xl font-bold text-slate-900">
              Fast & Simple
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              Enjoy a clean, modern experience without clutter or complicated
              steps.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-[2rem] bg-white p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Globe size={28} />
            </div>

            <h3 className="mt-6 text-2xl font-bold text-slate-900">
              Meaningful Relationships
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              Designed for people seeking serious and authentic connections.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
