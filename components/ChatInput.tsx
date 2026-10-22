import { useState } from "react";

type ChatInputProps = {
  onSubmit: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
};

export const ChatInput = ({
  onSubmit,
  onStop,
  isStreaming,
}: ChatInputProps) => {
  const [draft, setDraft] = useState("");
  const handleSubmitChat = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (draft.trim() === "" || isStreaming) return;
    setDraft("");
    onSubmit(draft);
  };

  return (
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
      {isStreaming ? (
        <button
          type="button"
          className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white enabled:hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:enabled:hover:bg-zinc-300"
          onClick={onStop}
        >
          중지
        </button>
      ) : (
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white enabled:hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:enabled:hover:bg-zinc-300"
        >
          제출
        </button>
      )}
    </form>
  );
};
