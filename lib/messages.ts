import type { Message } from "@/types/chat";

const ERROR_MESSAGE = "응답을 받지 못했어요. 잠시 후 다시 시도해 주세요!";

export const updateLastMessage = (
  messages: Message[],
  onUpdate: (msgs: Message) => Message,
): Message[] => {
  const newMessages = [...messages];
  const latestMessage = newMessages[newMessages.length - 1];
  if (latestMessage?.role !== "assistant") return messages;
  newMessages[newMessages.length - 1] = onUpdate(latestMessage);

  return newMessages;
};

export const withError = (messages: Message[]): Message[] =>
  updateLastMessage(messages, (message) => ({
    ...message,
    error: ERROR_MESSAGE,
  }));

export const withStopped = (messages: Message[]): Message[] =>
  updateLastMessage(messages, (message) => ({
    ...message,
    stopped: true,
  }));

export const withChunk = (messages: Message[], chunk: string): Message[] =>
  updateLastMessage(messages, (message) => ({
    ...message,
    content: message.content + chunk,
  }));
