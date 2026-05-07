"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Sparkles, Video } from "lucide-react";
import {
  ConnectionRequestWithProfiles,
  getMyConnectionRequests,
} from "@/app/lib/connectionRequests";

export default function MessagesContent() {
  const [currentUserId, setCurrentUserId] = useState("");
  const [requests, setRequests] = useState<ConnectionRequestWithProfiles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        const data = await getMyConnectionRequests();
        setCurrentUserId(data.currentUserId);
        setRequests(data.requests);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not load messages.",
        );
      } finally {
        setIsLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const acceptedChats = useMemo(
    () => requests.filter((request) => request.status === "accepted"),
    [requests],
  );

  if (isLoading) {
    return (
      <div className="px-6 py-8 lg:px-10">
        <div className="rounded-[2rem] bg-white p-8 text-center ring-1 ring-red-100">
          Loading messages...
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-[2rem] bg-red-50 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600">
            Messages
          </p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">
            Accepted chats
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">
            Chats appear here after a request has been accepted.
          </p>
        </header>

        {message ? (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {message}
          </p>
        ) : null}

        {acceptedChats.length ? (
          <div className="grid gap-4">
            {acceptedChats.map((request) => {
              const otherUser =
                request.senderId === currentUserId
                  ? request.receiver
                  : request.sender;
              const photo = otherUser?.matchmakingAnswers?.photo;

              if (!otherUser) {
                return null;
              }

              return (
                <article
                  key={request.id}
                  className="flex flex-col gap-4 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-red-100 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-red-50">
                      {photo ? (
                        <Image
                          src={photo}
                          alt={`${otherUser.name} profile photo`}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-red-400">
                          <Sparkles className="h-7 w-7" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {otherUser.name}
                      </h2>
                      <p className="mt-1 text-sm text-gray-600">
                        {otherUser.matchmakingAnswers?.location ||
                          "Location not set"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Link
                      href={`/chat/${otherUser.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Open chat
                    </Link>
                    <Link
                      href={`/video-call/${otherUser.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <Video className="h-4 w-4" />
                      Video
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[2rem] bg-white p-8 text-center ring-1 ring-red-100">
            <MessageCircle className="mx-auto h-12 w-12 text-red-400" />
            <p className="mt-4 text-gray-600">
              No accepted chats yet. Accept or receive a request first.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
