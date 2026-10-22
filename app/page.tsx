"use client";

import { ChatInput } from "@/components/ChatInput";
import { MessageBubble } from "@/components/MessageBubble";
import { useChat } from "@/hooks/useChat";
import { useEffect, useRef } from "react";

export default function Home() {
  const listRef = useRef<HTMLUListElement>(null);
  const { messages, isStreaming, send, stop } = useChat();

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight - el.clientHeight;
  }, [messages]);

  return (
    <div className="mx-auto flex h-dvh w-full max-w-2xl flex-col">
      <ul
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4 scroll-smooth"
        ref={listRef}
      >
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}
      </ul>
      <ChatInput onSubmit={send} onStop={stop} isStreaming={isStreaming} />
    </div>
  );
}
