FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./
COPY tsconfig.base.json ./
COPY apps/web/package*.json apps/web/
COPY packages/shared/package*.json packages/shared/

RUN npm ci

COPY apps/web ./apps/web
COPY packages/shared ./packages/shared

WORKDIR /app/apps/web

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]