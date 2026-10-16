"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
  error?: string;
};
const ERROR_MESSAGE = "응답을 받지 못했어요. 잠시 후 다시 시도해 주세요!";
const withError = (msgs: Message[]): Message[] => {
  const newMsgs = [...msgs];
  const latestMsg = newMsgs[newMsgs.length - 1];
  if (latestMsg?.role === "assistant") {
    newMsgs[newMsgs.length - 1] = {
      ...latestMsg,
      error: ERROR_MESSAGE,
    };
    return newMsgs;
  }
  return [
    ...msgs,
    {
      role: "assistant",
      content: "",
      error: ERROR_MESSAGE,
    },
  ];
};

export default function Home() {
  const [sentMsgs, setSentMsgs] = useState<Message[]>([]);
  const [msg, setMsg] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  const appendToLastMsg = (chunk: string) => {
    if (!chunk) return;
    setSentMsgs((prev) => {
      const msgs = [...prev];
      const latestMsg = msgs[msgs.length - 1];
      msgs[msgs.length - 1] = {
        ...latestMsg,
        content: latestMsg.content + chunk,
      };
      return msgs;
    });
  };

  const sendMsg = async (text: string) => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    if (!res.ok || !res.body) {
      throw new Error(`서버 응답 실패:${res.status}`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    setSentMsgs((prev) => [...prev, { role: "assistant", content: "" }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        const lastChunk = decoder.decode();
        appendToLastMsg(lastChunk);
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      appendToLastMsg(chunk);
    }
  };

  const onSubmitChat = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (msg.trim() === "" || isStreaming) return;
    try {
      setSentMsgs((prev) => {
        return [...prev, { role: "user", content: msg }];
      });
      setMsg("");
      setIsStreaming(true);

      await sendMsg(msg);
    } catch (error) {
      setSentMsgs((prev) => withError(prev));

      console.error(error);
    } finally {
      setIsStreaming(false);
    }
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
          className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white enabled:hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:enabled:hover:bg-zinc-300"
          disabled={isStreaming}
        >
          제출
        </button>
      </form>
    </div>
  );
}
