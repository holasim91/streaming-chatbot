"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
  error?: string;
};
const ERROR_MESSAGE = "응답을 받지 못했어요. 잠시 후 다시 시도해 주세요!";

const streamReply = async (text: string, onChunk: (chunk: string) => void) => {
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

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      const lastChunk = decoder.decode();
      onChunk(lastChunk);
      break;
    }
    const chunk = decoder.decode(value, { stream: true });
    onChunk(chunk);
  }
};

const withError = (messages: Message[]): Message[] => {
  const newMessages = [...messages];
  const latestMessage = newMessages[newMessages.length - 1];
  if (latestMessage?.role !== "assistant") return messages;
  newMessages[newMessages.length - 1] = {
    ...latestMessage,
    error: ERROR_MESSAGE,
  };
  return newMessages;
};

const withChunk = (messages: Message[], chunk: string): Message[] => {
  const newMessages = [...messages];
  const latestMessage = newMessages[newMessages.length - 1];
  if (latestMessage?.role !== "assistant") return messages;
  newMessages[newMessages.length - 1] = {
    ...latestMessage,
    content: latestMessage.content + chunk,
  };
  return newMessages;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  const appendToLastMessage = (chunk: string) => {
    if (!chunk) return;
    setMessages((prev) => withChunk(prev, chunk));
  };

  const handleSubmitChat = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (draft.trim() === "" || isStreaming) return;
    try {
      setMessages((prev) => {
        return [...prev, { role: "user", content: draft }];
      });
      setDraft("");
      setIsStreaming(true);

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      await streamReply(draft, appendToLastMessage);
    } catch (error) {
      setMessages((prev) => withError(prev));

      console.error(error);
    } finally {
      setIsStreaming(false);
    }
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
