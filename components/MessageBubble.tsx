import type { Message } from "@/types/chat";

type MessageBubbleProps = { message: Message };

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  return (
    <li
      className={`max-w-[80%] whitespace-pre-wrap wrap-break-word rounded-2xl px-4 py-2 ${
        message.role === "user"
          ? "self-end bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
          : "self-start bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
      }`}
    >
      {message.content}

      {message.error && (
        <p
          className={`text-sm text-red-700 dark:text-red-400 ${
            message.content
              ? "mt-2 border-t border-zinc-300 pt-2 dark:border-zinc-700"
              : ""
          }`}
        >
          {message.error}
        </p>
      )}
      {message.stopped && (
        <p
          className={`text-sm text-zinc-600 dark:text-zinc-400 ${
            message.content
              ? "mt-2 border-t border-zinc-300 pt-2 dark:border-zinc-700"
              : ""
          }`}
        >
          응답을 멈췄어요.
        </p>
      )}
    </li>
  );
};
