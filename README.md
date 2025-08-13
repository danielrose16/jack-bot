# JackBot

Monorepo NX: Chatbot; Front: Angular (20v); Backend: NodeJS/Express + Socket.IO
Chatbot based on keywords with a configurable basic "personality".
Tailwind (v3). signals, basic A11y, chat history saved on local-storage.

## Stack
- Nx, npm
- Frontend: Angular + Signals + Tailwind v3
- Backend: Node + Express + Socket.IO
- Libs: `shared-types` (DTOs), `chat-core` (logics)
- Tests: Jest `chat-core` + Chat Component

## local run
```bash
# Terminal 1 (runs on port 3000)
npx nx serve api
# Terminal 2 (runs on port 4200)
npx nx serve jack-bot
## test scripts
npx nx test chat-core
npx nx test jack-bot

```
### structure
apps/
  api/        # Backend
  jack-bot/   # Frontend
libs/
  chat-core/  # buildReply, welcome, openings, tips
  shared-types/ # ChatMessage, BotProfile, Tone, Personality
