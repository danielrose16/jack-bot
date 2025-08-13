import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { randomUUID } from 'crypto';
import { buildReply, welcome, setBotProfile } from '@jack-bot/chat-core';
import { ChatMessage, BotProfile, Personality, BotConfigUpdate } from '@jack-bot/shared-types';

setBotProfile({ name: process.env.BOT_NAME ?? 'Jack', icon: process.env.BOT_ICON ?? '🤖' });

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const defaults: { profile: BotProfile; personality: Personality } = {
  profile: {
    name: process.env.BOT_NAME ?? 'Jack',
    icon: process.env.BOT_ICON ?? '🤖'
  },
  personality: {
    tone: 'default',
    emoji: true
  }
};
const cfg = new Map<string, { profile: BotProfile; personality: Personality }>();

app.get('/', (_req, res) => res.send('OK'));

io.on('connection', (socket) => {
  cfg.set(socket.id, JSON.parse(JSON.stringify(defaults)));
  const { profile, personality } = cfg.get(socket.id)!;

  io.to(socket.id).emit('bot:meta', profile);
  io.to(socket.id).emit('bot:typing', true);

  setTimeout(() => {
    const welcomeMessage: ChatMessage = { id: randomUUID(), author: 'bot', text: welcome(profile, personality), ts: Date.now() };
    io.to(socket.id).emit('chat:new', welcomeMessage);
    io.to(socket.id).emit('bot:typing', false);
  }, 500);

  socket.on('bot:config', (update: BotConfigUpdate) => {
    const current = cfg.get(socket.id);
    if (!current) return;

    if (update.profile) current.profile = { ...current.profile, ...update.profile };
    if (update.personality) current.personality = { ...current.personality, ...update.personality };

    io.to(socket.id).emit('bot:meta', current.profile);
  });

  socket.on('chat:send', (msg: ChatMessage) => {
    io.emit('chat:new', msg);
    const userCfg = cfg.get(socket.id) ?? defaults;
    const text = buildReply(msg.text, userCfg.personality);

    if (text) {
      const botMsg: ChatMessage = {
        id: randomUUID(),
        author: 'bot',
        text,
        ts: Date.now() + 1
      };
      io.emit('bot:typing', true);

      setTimeout(() => {
        io.emit('chat:new', botMsg);
        io.emit('bot:typing', false);
      }, calcDelay(text));
    }
  });

  socket.on('disconnect', () => {
    cfg.delete(socket.id);
  });
});

function calcDelay(text: string) {
  return Math.min(1500, Math.max(500, text.length * 20));
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`)
});
