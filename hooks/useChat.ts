import {
  transformForClaude,
  withChunk,
  withError,
  withStopped,
} from "@/lib/messages";
import { streamReply } from "@/lib/streamReply";
import type { Message } from "@/types/chat";
import { useRef, useState } from "react";

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const appendToLastMessage = (chunk: string) => {
    if (!chunk) return;
    setMessages((prev) => withChunk(prev, chunk));
  };

  const send = async (text: string) => {
    try {
      setMessages((prev) => {
        return [...prev, { role: "user", content: text }];
      });

      setIsStreaming(true);
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      controllerRef.current = new AbortController();
      const history = transformForClaude([
        ...messages,
        { role: "user", content: text },
      ]);
      await streamReply(
        history,
        appendToLastMessage,
        controllerRef.current.signal,
      );
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setMessages((prev) => withStopped(prev));
        return;
      }
      setMessages((prev) => withError(prev));
      console.error(error);
    } finally {
      setIsStreaming(false);
    }
  };

  const stop = () => controllerRef.current?.abort();

  return {
    messages,
    isStreaming,
    send,
    stop,
  };
};
