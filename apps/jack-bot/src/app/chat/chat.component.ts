import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../services/socket';
import { ChatMessage, Tone } from '@jack-bot/shared-types';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent {
  private socket = inject(SocketService);
  public msgs = this.socket.messages;
  public typing = this.socket.typing;
  public profile = this.socket.botProfile;
  public personality = this.socket.personality;
  public text = '';
  public nameModel = this.profile().name;
  public iconModel = this.profile().icon;
  public toneLabels: Record<Tone, string> = {
    funny: 'מצחיק',
    serious: 'רציני',
    motivational: 'מעודד',
    concise: 'קצר',
    default: 'ברירת מחדל'
  };
  public toneModel: Tone = this.personality().tone;
  public emojiModel = this.personality().emoji;
  public showSettings = signal(false);
  public emojiOptions = ['🤖','🧠','⚡','🧑‍🏫','🦉','🧩','🛠️','✨','🐱','🛰️'];

  pickEmoji(e: string) {
    this.iconModel = e;
  }

  send() {
    const m = this.text.trim();
    if (!m) return;
    this.socket.send(m);
    this.text = '';
  }

  saveProfile() {
    this.socket.updateConfig({
      profile: { name: this.nameModel || 'Jack', icon: this.iconModel || '🤖' },
      personality: { tone: this.toneModel, emoji: this.emojiModel }
    });
    this.showSettings.set(false);
  }

  clearHistory() {
    this.socket.clearHistory();
  }

  trackById(_: number, m: ChatMessage) {
    return m.id;
  }
}
