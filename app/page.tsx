"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [sentMsgs, setSentMsgs] = useState<Message[]>([]);
  const [msg, setMsg] = useState("");
  const listRef = useRef<HTMLUListElement>(null);
  const onSubmitChat = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (msg.trim() === "") return;
    setSentMsgs((prev) => {
      return [...prev, { role: "user", content: msg }];
    });
    setMsg("");
  };

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight - el.clientHeight;
  }, [sentMsgs]);
  return (
    <div className="mx-auto flex h-dvh w-full max-w-2xl flex-col">
      <ul
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4 scroll-smooth"
        ref={listRef}
      >
        {sentMsgs.map((m, i) => (
          <li
            key={i}
            className={`max-w-[80%] whitespace-pre-wrap wrap-break-word rounded-2xl px-4 py-2 ${
              m.role === "user"
                ? "self-end bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "self-start bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
            }`}
          >
            {m.content}
          </li>
        ))}
      </ul>
      <form
        onSubmit={onSubmitChat}
        className="flex gap-2 border-t border-zinc-200 p-4 dark:border-zinc-800"
      >
        <input
          type="text"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-300"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          제출
        </button>
      </form>
    </div>
  );
}
