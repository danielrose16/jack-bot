import { buildReply, welcome } from './index';
import { Personality, BotProfile } from '@jack-bot/shared-types';

describe('chat-core', () => {
  const serious: Personality = { tone: 'serious', emoji: true };

  it('returns a reply for a prompt', () => {
    const out = buildReply('מה עם OnPush ב-Angular?', serious);
    expect(typeof out).toBe('string');
    expect(out!.length).toBeGreaterThan(5);
  });

  it('welcome includes bot name', () => {
    const profile: BotProfile = { name: 'Jack', icon: '🤖' };
    const out = welcome(profile, serious);
    expect(out).toContain('Jack');
  });

  it('concise tone shortens output', () => {
    const concise: Personality = { tone: 'concise', emoji: false };
    const longish = buildReply('Angular Material theme', serious)!;
    const shorty  = buildReply('Angular Material theme', concise)!;
    expect(shorty.length).toBeLessThan(longish.length);
  });
});
