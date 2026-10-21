"use client";

import { useChat } from "@/hooks/useChat";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLUListElement>(null);
  const { messages, isStreaming, send, stop } = useChat();

  const handleSubmitChat = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (draft.trim() === "" || isStreaming) return;
    setDraft("");
    await send(draft);
  };

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
          <li
            key={i}
            className={`max-w-[80%] whitespace-pre-wrap wrap-break-word rounded-2xl px-4 py-2 ${
              m.role === "user"
                ? "self-end bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "self-start bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
            }`}
          >
            {m.content}

            {m.error && (
              <p
                className={`text-sm text-red-700 dark:text-red-400 ${
                  m.content
                    ? "mt-2 border-t border-zinc-300 pt-2 dark:border-zinc-700"
                    : ""
                }`}
              >
                {m.error}
              </p>
            )}
            {m.stopped && (
              <p
                className={`text-sm text-zinc-600 dark:text-zinc-400 ${
                  m.content
                    ? "mt-2 border-t border-zinc-300 pt-2 dark:border-zinc-700"
                    : ""
                }`}
              >
                응답을 멈췄어요.
              </p>
            )}
          </li>
        ))}
      </ul>
      <form
        onSubmit={handleSubmitChat}
        className="flex gap-2 border-t border-zinc-200 p-4 dark:border-zinc-800"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-300"
        />
        {isStreaming ? (
          <button
            type="button"
            className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white enabled:hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:enabled:hover:bg-zinc-300"
            onClick={() => stop()}
          >
            중지
          </button>
        ) : (
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white enabled:hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:enabled:hover:bg-zinc-300"
          >
            제출
          </button>
        )}
      </form>
    </div>
  );
}
