"use client";

import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    rating: 5,
    text: "HeartLink made dating feel genuine again. I met someone who truly fits my personality and values.",
    name: "Sandra",
    location: "Kampala, Uganda",
    initials: "S",
  },
  {
    rating: 5,
    text: "The compatibility matching is amazing. Conversations feel natural and meaningful from the start.",
    name: "Michael",
    location: "Entebbe, Uganda",
    initials: "M",
  },
  {
    rating: 5,
    text: "Simple, beautiful, and easy to use. HeartLink feels different from every other dating platform.",
    name: "Vanessa",
    location: "Jinja, Uganda",
    initials: "V",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-white px-6 py-28">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-600">
            Testimonials
          </span>

          <h2 className="mt-6 text-4xl font-bold text-slate-900 md:text-5xl">
            People Are Finding
            <span className="text-red-600"> Real Connections</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Hear what people are saying about their HeartLink experience.
          </p>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="rounded-[2rem] border border-red-100 bg-[#fff7f8] p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-1 text-red-500">
                  {Array.from({ length: item.rating }).map((_, index) => (
                    <Star
                      key={`${item.name}-star-${index}`}
                      className="h-5 w-5 fill-current"
                    />
                  ))}
                </div>

                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                  <Quote className="h-5 w-5" />
                </span>
              </div>

              <p className="mt-6 leading-8 text-slate-600">{item.text}</p>

              <div className="mt-8 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-200 font-bold text-red-700">
                  {item.initials}
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">{item.name}</h3>
                  <p className="text-sm text-slate-500">{item.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
