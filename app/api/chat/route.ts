import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-haiku-5-5";
const MESSAGE_MAX_LENGTH = 500;

const client = new Anthropic();

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const message = body?.message;
  if (typeof message !== "string" || message.trim() === "") {
    return Response.json(
      { error: "message must be a non-empty string" },
      { status: 400 },
    );
  }

  if (message.length > MESSAGE_MAX_LENGTH) {
    return Response.json(
      { error: `message must be at most ${MESSAGE_MAX_LENGTH} characters` },
      { status: 400 },
    );
  }

  const encoder = new TextEncoder();

  let cancelled = false;

  const claudeStream = client.messages.stream({
    model: MODEL,
    max_tokens: 2048,
    messages: [{ role: "user", content: message }],
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
