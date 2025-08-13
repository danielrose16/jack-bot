import { Tone } from '@jack-bot/shared-types'

export interface BotProfile {
    name: string;
    icon: string;
}
let profile: BotProfile = {
    name: 'Jack',
    icon: '🤖'
};

export const availableEmojis = ["🤖", "😎", "🐱", "🦉", "🚀", "✨", "🧠"];

export function setBotProfile(p: Partial<BotProfile>) {
    profile = { ...profile, ...p };
}

export function getBotProfile(): BotProfile {
    return profile;
}

export interface Personality {
    tone: Tone;
    emoji: boolean;
}

let style: Personality = {
    tone: 'default',
    emoji: true
};

export function setPersonality(p: Partial<Personality>) {
    style = { ...style, ...p };
}

export function getPersonality(): Personality {
    return style;
}
