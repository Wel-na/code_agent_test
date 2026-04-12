FROM node:24-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
RUN npm install

FROM deps AS build
COPY . .
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/client ./client
COPY --from=build /app/server ./server
COPY --from=build /app/.env.example ./.env.example

EXPOSE 3001

CMD ["npm", "run", "start"]
