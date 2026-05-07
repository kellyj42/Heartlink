"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  HeartCrack,
  MessageCircle,
  Phone,
  SmilePlus,
  Sparkles,
  Video,
} from "lucide-react";
import {
  ConnectionRequestWithProfiles,
  getMyConnectionRequests,
  respondToConnectionRequest,
} from "@/app/lib/connectionRequests";

function ProfileAvatar({
  name,
  photo,
}: {
  name: string;
  photo?: string;
}) {
  return (
    <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-red-50">
      {photo ? (
        <Image src={photo} alt={name} fill unoptimized className="object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center text-red-400">
          <Sparkles className="h-7 w-7" />
        </div>
      )}
    </div>
  );
}

function ChatPreview({
  contact,
  userId,
}: {
  contact?: string;
  userId: string;
}) {
  return (
    <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/chat/${userId}`}
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
        >
          <MessageCircle className="h-4 w-4" />
          Send hi
        </Link>
        <Link
          href={`/video-call/${userId}`}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200"
        >
          <Video className="h-4 w-4" />
          Video call
        </Link>
        {contact ? (
          <a
            href={`https://wa.me/${contact}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200"
          >
            <Phone className="h-4 w-4" />
            WhatsApp
          </a>
        ) : null}
      </div>
      <div className="mt-4 rounded-2xl bg-white p-4">
        <p className="text-xs font-semibold uppercase text-emerald-600">
          Message box preview
        </p>
        <div className="mt-3 space-y-2 text-sm">
          <p className="w-fit rounded-2xl bg-red-50 px-4 py-2 text-gray-700">
            Hi, nice to connect with you.
          </p>
          <p className="ml-auto w-fit rounded-2xl bg-emerald-600 px-4 py-2 text-white">
            Hi, thank you for the request.
          </p>
        </div>
      </div>
    </div>
  );
}

function RequestCard({
  request,
  currentUserId,
  onRespond,
}: {
  request: ConnectionRequestWithProfiles;
  currentUserId: string;
  onRespond: (requestId: string, status: "accepted" | "denied") => void;
}) {
  const isIncoming = request.receiverId === currentUserId;
  const otherUser = isIncoming ? request.sender : request.receiver;
  const answers = otherUser?.matchmakingAnswers;

  if (!otherUser) {
    return null;
  }

  return (
    <article className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-red-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <ProfileAvatar name={otherUser.name} photo={answers?.photo} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">
              {isIncoming ? "Incoming request" : "Request sent"}
            </p>
            <h3 className="mt-2 text-xl font-bold text-gray-900">
              {otherUser.name}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {answers?.location || "Location not set"} · {otherUser.datingGoal}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-4 py-2 text-sm font-bold ${
            request.status === "accepted"
              ? "bg-emerald-50 text-emerald-700"
              : request.status === "denied"
                ? "bg-red-50 text-red-700"
                : "bg-amber-50 text-amber-700"
          }`}
        >
          {request.status}
        </span>
      </div>

      {request.status === "pending" && isIncoming ? (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => onRespond(request.id, "accepted")}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700"
          >
            <SmilePlus className="h-4 w-4" />
            Accept
          </button>
          <button
            onClick={() => onRespond(request.id, "denied")}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-red-200 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-50"
          >
            <HeartCrack className="h-4 w-4" />
            Deny
          </button>
        </div>
      ) : null}

      {request.status === "pending" && !isIncoming ? (
        <p className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          Waiting for {otherUser.name} to accept or deny your request.
        </p>
      ) : null}

      {request.status === "accepted" && !isIncoming ? (
        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <SmilePlus className="h-5 w-5 animate-pulse" />
            Happy reaction: your request was accepted.
          </div>
          <ChatPreview contact={answers?.contact} userId={otherUser.id} />
        </div>
      ) : null}

      {request.status === "accepted" && isIncoming ? (
        <div className="mt-5 space-y-4">
          <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            You accepted this request.
          </p>
          <ChatPreview contact={answers?.contact} userId={otherUser.id} />
        </div>
      ) : null}

      {request.status === "denied" && !isIncoming ? (
        <div className="mt-5 rounded-3xl bg-red-50 p-5 text-center text-red-700">
          <HeartCrack className="mx-auto h-10 w-10 animate-bounce" />
          <p className="mt-2 text-lg font-bold">Your request was denied</p>
          <p className="mt-1 text-3xl">:(</p>
        </div>
      ) : null}

      {request.status === "denied" && isIncoming ? (
        <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          You denied this request.
        </p>
      ) : null}

      <Link
        href={`/matches/${otherUser.id}`}
        className="mt-5 inline-flex rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
      >
        View profile
      </Link>
    </article>
  );
}

export default function RequestsContent() {
  const [requests, setRequests] = useState<ConnectionRequestWithProfiles[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadRequests() {
    try {
      const data = await getMyConnectionRequests();
      setCurrentUserId(data.currentUserId);
      setRequests(data.requests);
      setMessage("");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load requests.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadRequests();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function handleRespond(
    requestId: string,
    status: "accepted" | "denied",
  ) {
    await respondToConnectionRequest(requestId, status);
    await loadRequests();
  }

  const incomingRequests = useMemo(
    () => requests.filter((request) => request.receiverId === currentUserId),
    [currentUserId, requests],
  );
  const sentRequests = useMemo(
    () => requests.filter((request) => request.senderId === currentUserId),
    [currentUserId, requests],
  );

  if (isLoading) {
    return (
      <div className="px-6 py-8 lg:px-10">
        <div className="rounded-[2rem] bg-white p-8 text-center ring-1 ring-red-100">
          Loading requests...
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-[2rem] bg-red-50 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600">
            Requests
          </p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">
            Connection requests
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">
            Accept a request to unlock the message preview, fake video call,
            WhatsApp action, and send-hi button. Denied requests show the sender
            a sad reaction.
          </p>
        </header>

        {message ? (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {message}
          </p>
        ) : null}

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Received requests
          </h2>
          {incomingRequests.length ? (
            <div className="grid gap-4">
              {incomingRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  currentUserId={currentUserId}
                  onRespond={handleRespond}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-white p-5 text-gray-600 ring-1 ring-red-100">
              No received requests yet.
            </p>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Sent requests</h2>
          {sentRequests.length ? (
            <div className="grid gap-4">
              {sentRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  currentUserId={currentUserId}
                  onRespond={handleRespond}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-white p-5 text-gray-600 ring-1 ring-red-100">
              You have not sent any requests yet.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
