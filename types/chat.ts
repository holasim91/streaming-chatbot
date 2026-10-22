export type Message = {
  role: "user" | "assistant";
  content: string;
  error?: string;
  stopped?: boolean;
};
export type History = Pick<Message, "role" | "content">[];
