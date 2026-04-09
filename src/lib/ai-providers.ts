export const AI_PROVIDER_IDS = ["mistral", "groq", "gemini"] as const;

export type AiProviderId = (typeof AI_PROVIDER_IDS)[number];

export const AI_PROVIDER_LABELS: Record<AiProviderId, string> = {
  mistral: "Mistral",
  groq: "Groq",
  gemini: "Gemini",
};

export function isAiProviderId(value: string): value is AiProviderId {
  return AI_PROVIDER_IDS.includes(value as AiProviderId);
}
