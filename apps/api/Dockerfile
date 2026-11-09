FROM node:24-alpine AS dependencies

WORKDIR /app

COPY package*.json ./
COPY tsconfig.base.json ./
COPY apps/api/package*.json apps/api/
COPY packages/shared/package*.json packages/shared/

RUN npm ci

FROM node:24-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared
COPY database ./database

WORKDIR /app/apps/api

CMD ["node", "--import", "tsx/esm", "src/server.ts"]