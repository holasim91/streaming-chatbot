"use client";

import { useState } from "react";

export default function Home() {
  const [sentMsgs, setSentMsgs] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  const onSubmitChat = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (msg.trim() === "") return;
    setSentMsgs((prev) => {
      const newChat = [...prev, msg];
      return newChat;
    });
    setMsg("");
  };
  return (
    <div className="mx-auto flex h-dvh w-full max-w-2xl flex-col">
      <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
        {sentMsgs.map((m, i) => (
          <li
            key={i}
            className="max-w-[80%] self-end whitespace-pre-wrap break-words rounded-2xl bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            {m}
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
