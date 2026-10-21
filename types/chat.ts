export type Message = {
  role: "user" | "assistant";
  content: string;
  error?: string;
  stopped?: boolean;
};
