const CHAR_DELAY_MS = 30;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const message = body?.message;

  if (typeof message !== "string" || message.trim() === "") {
    return Response.json(
      { error: "message must be a non-empty string" },
      { status: 400 },
    );
  }

  const reply = `"${message}"에 대한 답변입니다. 이 문장은 한 글자씩 스트리밍으로 전송됩니다.`;
  const encoder = new TextEncoder();

  let cancelled = false;

  const stream = new ReadableStream({
    async start(controller) {
      for (const ch of reply) {
        if (cancelled) return;
        controller.enqueue(encoder.encode(ch));
        await sleep(CHAR_DELAY_MS);
      }
      controller.close();
    },
    cancel() {
      cancelled = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
