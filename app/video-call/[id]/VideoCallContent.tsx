"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Camera, CameraOff, Mic, PhoneOff } from "lucide-react";
import { getAcceptedChatAccess } from "@/app/lib/chatMessages";

export default function VideoCallContent({
  otherUserId,
}: {
  otherUserId: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [name, setName] = useState("User");
  const [message, setMessage] = useState("Starting camera...");
  const [hasCamera, setHasCamera] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function startCamera() {
      try {
        const access = await getAcceptedChatAccess(otherUserId);

        if (!access.canChat || !access.otherUser) {
          setMessage("Video call unlocks only after a request is accepted.");
          return;
        }

        setName(access.otherUser.name);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setHasCamera(true);
        setMessage("Camera preview active. This call UI is for show.");
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Could not open camera on this device.",
        );
      }
    }

    void startCamera();

    return () => {
      isMounted = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [otherUserId]);

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          href={`/chat/${otherUserId}`}
          className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to chat
        </Link>

        <section className="overflow-hidden rounded-[2rem] bg-gray-950 text-white shadow-sm">
          <div className="relative flex min-h-[520px] items-center justify-center bg-black">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`h-full min-h-[520px] w-full object-cover ${
                hasCamera ? "block" : "hidden"
              }`}
            />

            {!hasCamera ? (
              <div className="text-center">
                <CameraOff className="mx-auto h-16 w-16 text-red-300" />
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/75">
                  {message}
                </p>
              </div>
            ) : null}

            <div className="absolute left-5 top-5 rounded-2xl bg-black/50 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                Calling
              </p>
              <h1 className="mt-1 text-xl font-bold">{name}</h1>
            </div>

            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-3 rounded-full bg-black/60 p-3 backdrop-blur">
              <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white">
                <Mic className="h-5 w-5" />
              </button>
              <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white">
                <Camera className="h-5 w-5" />
              </button>
              <Link
                href={`/chat/${otherUserId}`}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white"
              >
                <PhoneOff className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {message}
        </p>
      </div>
    </div>
  );
}
