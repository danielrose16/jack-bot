import { Injectable, signal, effect } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { ChatMessage, BotProfile, Personality, BotConfigUpdate } from '@jack-bot/shared-types';
import { environment } from '../../environments/environment';

const LS_HISTORY = 'jackbot_history';
const LS_BOTCFG = 'jackbot_config';
type NetState = 'online' | 'offline' | 'connecting';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;
  public messages = signal<ChatMessage[]>([]);
  public typing = signal(false);
  public botProfile = signal<BotProfile>({ name: 'Jack', icon: '🤖' });
  public personality = signal<Personality>({ tone: 'default', emoji: true });

  constructor() {
    try {
      const history = JSON.parse(localStorage.getItem(LS_HISTORY) || '[]');
      if (Array.isArray(history)) this.messages.set(history);
      
      const cfg = JSON.parse(localStorage.getItem(LS_BOTCFG) || 'null');
      if (cfg?.profile) this.botProfile.set(cfg.profile);
      if (cfg?.personality) this.personality.set(cfg.personality);
    } catch(err) {
      console.error(err);
    }

    this.socket = io(environment.API_URL);

    this.socket.on('chat:new', (m: ChatMessage) => {
      this.messages.update(list => [...list, m]);
      if (m.author === 'bot') this.typing.set(false);
    });
    
    this.socket.on('bot:typing', (v: boolean) => this.typing.set(!!v));
    this.socket.on('bot:meta', (p: BotProfile) => this.botProfile.set(p));

    this.socket.on('connect', () => {
      this.socket.emit('bot:config', {
        profile: this.botProfile(),
        personality: this.personality()
      } as BotConfigUpdate)
    });

    effect(() => {
      const data = this.messages();
      localStorage.setItem(LS_HISTORY, JSON.stringify(data));
    });
    effect(() => {
      const cfg = {
        profile: this.botProfile(),
        personality: this.personality()
      };
      localStorage.setItem(LS_BOTCFG, JSON.stringify(cfg));
    });
  }

  send(text: string) {
    const t = text.trim();
    if (!t) return;

    const m: ChatMessage = {
      id: crypto.randomUUID(),
      author: 'user',
      text: t,
      ts: Date.now()
    };

    this.socket.emit('chat:send', m);
  }

  updateConfig(update: BotConfigUpdate) {
    if (update.profile) this.botProfile.set({ ...this.botProfile(), ...update.profile });
    if (update.personality) this.personality.set({ ...this.personality(), ...update.personality });

    this.socket.emit('bot:config', update);
  }

  clearHistory() {
    this.messages.set([]);
    localStorage.removeItem(LS_HISTORY);
  }
}
