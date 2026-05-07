"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HeartCrack, MessageCircle, SmilePlus, Video } from "lucide-react";
import {
  ConnectionRequest,
  getRequestWithUser,
  sendConnectionRequest,
} from "@/app/lib/connectionRequests";

type RequestButtonProps = {
  userId: string;
  contact?: string;
  compact?: boolean;
};

export default function RequestButton({
  userId,
  contact,
  compact = false,
}: RequestButtonProps) {
  const [request, setRequest] = useState<ConnectionRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadRequest() {
      try {
        const existingRequest = await getRequestWithUser(userId);

        if (isMounted) {
          setRequest(existingRequest);
        }
      } catch {
        if (isMounted) {
          setRequest(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadRequest();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  async function handleSendRequest() {
    setIsLoading(true);
    setMessage("");

    try {
      const nextRequest = await sendConnectionRequest(userId);
      setRequest(nextRequest);
      setMessage("Request sent.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not send request.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (request?.status === "accepted") {
    return (
      <div className={compact ? "space-y-2" : "space-y-3"}>
        <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
          <SmilePlus className="h-4 w-4" />
          Request accepted
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <Link
            href={`/chat/${userId}`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <MessageCircle className="h-4 w-4" />
            Send hi
          </Link>
          <Link
            href={`/video-call/${userId}`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
          >
            <Video className="h-4 w-4" />
            Video
          </Link>
          {contact ? (
            <a
              href={`https://wa.me/${contact}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              WhatsApp
            </a>
          ) : (
            <Link
              href={`/chat/${userId}`}
              className="inline-flex items-center justify-center rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              Open chat
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (request?.status === "denied") {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-700">
        <HeartCrack className="mx-auto h-5 w-5 animate-bounce" />
        <p className="mt-1">Request denied</p>
        <p className="mt-1 text-2xl">:(</p>
      </div>
    );
  }

  if (request?.status === "pending") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-700">
        Request pending
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleSendRequest}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 px-4 py-2 font-semibold text-gray-700 transition hover:bg-red-50 disabled:opacity-60"
      >
        <MessageCircle className="h-4 w-4" />
        {isLoading ? "Checking..." : "Send a request"}
      </button>
      {message ? <p className="text-center text-xs text-gray-500">{message}</p> : null}
    </div>
  );
}
