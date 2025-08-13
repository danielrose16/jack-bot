import { TestBed } from '@angular/core/testing';
import { ChatComponent } from './chat.component';
import { signal } from '@angular/core';
import { ChatMessage, BotProfile, Personality } from '@jack-bot/shared-types';
import { SocketService } from '../services/socket';

class MockSocketService {
  public messages = signal<ChatMessage[]>([]);
  public typing = signal(false);
  public botProfile = signal<BotProfile>({ name: 'Jack', icon: '🤖' });
  public personality = signal<Personality>({ tone: 'serious', emoji: true });
  send = jest.fn();
  updateConfig = jest.fn();
  clearHistory = jest.fn();
}

function query(root: HTMLElement, sel: string) {
  const el = root.querySelector(sel);
  if (!el) throw new Error('element not found: ' + sel);
  return el as HTMLElement;
}

describe('ChatComponent', () => {
  let fixture: any;
  let chatComp: ChatComponent;
  let mockSocketService: MockSocketService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatComponent],
      providers: [{ provide: SocketService, useClass: MockSocketService }]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatComponent);
    chatComp = fixture.componentInstance;
    mockSocketService = TestBed.inject(SocketService) as any;
    fixture.detectChanges();
  });

  it('renders header with bot name', () => {
    const h2 = query(fixture.nativeElement, 'h2').textContent!;
    expect(h2).toContain('Jack');
  });

  it('sends trimmed text', () => {
    chatComp['text'] = '  hello  ';
    chatComp.send();
    expect(mockSocketService.send).toHaveBeenCalledWith('hello');
    expect(chatComp['text']).toBe('');
  });

  it('shows typing indicator when typing=true', () => {
    mockSocketService.typing.set(true);
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('[data-testid="typing-indicator"]');
    expect(el).toBeTruthy();
  });

  it('renders incoming messages', () => {
    const msg: ChatMessage = { id: '1', author: 'user', text: 'hi', ts: Date.now() };
    mockSocketService.messages.set([msg]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('hi');
  });
});
