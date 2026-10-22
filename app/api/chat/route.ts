import type { History } from "@/types/chat";
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-haiku-5-5";
const MESSAGE_MAX_LENGTH = 500;
const HISTORY_MAX_LENGTH = 10000;

const client = new Anthropic();

const checkRole = (role: unknown) => role === "user" || role === "assistant";
const checkContent = (content: unknown) =>
  typeof content === "string" && content !== "";

const getValidationError = (messages: unknown): string | null => {
  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    !messages.every((m) => checkRole(m?.role)) ||
    !messages.every((m) => checkContent(m?.content))
  ) {
    return `messages must be a non-empty array of { role: "user" | "assistant", content: non-empty string }`;
  }
  const lastMessage = messages.at(-1);

  if (lastMessage.role !== "user") {
    return `last message's role must be "user"`;
  }

  if (lastMessage.content.length > MESSAGE_MAX_LENGTH) {
    return `message must be at most ${MESSAGE_MAX_LENGTH} characters`;
  }
  return null;
};

const trimHistory = (messages: History) => {
  let total = 0;
  let startIndex = messages.length - 1;

  for (let i = messages.length - 1; i >= 0; i--) {
    if (total + messages[i].content.length > HISTORY_MAX_LENGTH) break;
    total += messages[i].content.length;
    startIndex = i;
  }

  const trimmed = messages.slice(startIndex);

  const firstUserIndex = trimmed.findIndex((m) => m.role === "user");
  const editedHistory = trimmed.slice(firstUserIndex);
  return editedHistory.map(({ role, content }) => ({ role, content }));
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const messages = body?.messages;

  const error = getValidationError(messages);
  if (error) {
    return Response.json({ error }, { status: 400 });
  }

  const claudeMessages: Anthropic.MessageParam[] = trimHistory(
    messages as History,
  );

  const encoder = new TextEncoder();

  let cancelled = false;

  const claudeStream = client.messages.stream({
    model: MODEL,
    max_tokens: 2048,
    messages: claudeMessages,
  });

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of claudeStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (error) {
        if (cancelled) {
          return;
        }
        console.error(error);
        controller.error(error);
      }
    },
    cancel() {
      cancelled = true;
      claudeStream.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
