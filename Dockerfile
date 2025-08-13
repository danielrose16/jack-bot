FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx nx build api --configuration=production

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY --from=build /app/dist/apps/api ./dist/apps/api
EXPOSE 3000
CMD ["node", "dist/apps/api/main.js"]
