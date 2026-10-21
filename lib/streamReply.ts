export const streamReply = async (
  text: string,
  onChunk: (chunk: string) => void,
  signal: AbortSignal,
) => {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text }),
    signal,
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
