"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Send, Video } from "lucide-react";
import {
  ChatMessage,
  getAcceptedChatAccess,
  getChatMessages,
  markChatMessagesRead,
  sendChatMessage,
} from "@/app/lib/chatMessages";
import { StoredUser } from "@/app/lib/localUsers";

export default function ChatContent({ otherUserId }: { otherUserId: string }) {
  const [currentUserId, setCurrentUserId] = useState("");
  const [otherUser, setOtherUser] = useState<StoredUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const loadChat = useCallback(async () => {
    try {
      const access = await getAcceptedChatAccess(otherUserId);
      setCurrentUserId(access.currentUserId);

      if (!access.canChat || !access.otherUser) {
        setNotice("Chat unlocks only after a request is accepted.");
        setOtherUser(access.otherUser);
        setMessages([]);
        return;
      }

      setOtherUser(access.otherUser);
      const loadedMessages = await getChatMessages(otherUserId);
      setMessages(loadedMessages);
      await markChatMessagesRead(otherUserId);
      setNotice("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not load chat.");
    } finally {
      setIsLoading(false);
    }
  }, [otherUserId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadChat();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!messageText.trim()) {
      return;
    }

    try {
      const sentMessage = await sendChatMessage(otherUserId, messageText);
      setMessages((currentMessages) => [...currentMessages, sentMessage]);
      setMessageText("");
      setNotice("");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Could not send message.",
      );
    }
  }

  if (isLoading) {
    return (
      <div className="px-6 py-8 lg:px-10">
        <div className="rounded-[2rem] bg-white p-8 text-center ring-1 ring-red-100">
          Loading chat...
        </div>
      </div>
    );
  }

  const photo = otherUser?.matchmakingAnswers?.photo;

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mx-auto flex max-w-5xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-red-100">
        <header className="flex flex-col gap-4 border-b border-red-100 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/requests"
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-red-600 ring-1 ring-red-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-white">
              {photo ? (
                <Image
                  src={photo}
                  alt={`${otherUser?.name ?? "User"} profile photo`}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-red-400">
                  <MessageCircle className="h-6 w-6" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
                Chat
              </p>
              <h1 className="text-xl font-bold text-gray-900">
                {otherUser?.name ?? "User"}
              </h1>
            </div>
          </div>

          <Link
            href={`/video-call/${otherUserId}`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <Video className="h-4 w-4" />
            Video call
          </Link>
        </header>

        {notice ? (
          <p className="m-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
            {notice}
          </p>
        ) : null}

        <div className="min-h-[440px] flex-1 space-y-3 overflow-y-auto bg-[#fffaf8] p-5">
          {messages.length ? (
            messages.map((message) => {
              const isMine = message.senderId === currentUserId;

              return (
                <div
                  key={message.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[78%] rounded-3xl px-4 py-3 text-sm leading-6 ${
                      isMine
                        ? "bg-red-600 text-white"
                        : "bg-white text-gray-800 ring-1 ring-red-100"
                    }`}
                  >
                    {message.body}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex h-[360px] items-center justify-center text-center text-gray-500">
              <p>No messages yet. Send hi to start the chat.</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSendMessage}
          className="flex flex-col gap-3 border-t border-red-100 bg-white p-5 sm:flex-row"
        >
          <input
            type="text"
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            disabled={Boolean(notice)}
            placeholder="Type a message..."
            className="min-h-12 flex-1 rounded-2xl border border-red-100 px-4 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={Boolean(notice) || !messageText.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
