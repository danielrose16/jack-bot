export type Author = 'user' | 'bot';

export interface ChatMessage {
  id: string;
  author: Author;
  text: string;
  ts: number;
}

export interface BotProfile {
  name: string;
  icon: string;
}

export type Tone = "funny" | "serious" | "motivational" | "concise" | "default";

export interface Personality {
  tone: Tone;
  emoji: boolean;
}

// עדכון חלקי דרך הסוקט
export type BotConfigUpdate = Partial<{ profile: Partial<BotProfile>; personality: Partial<Personality> }>;
