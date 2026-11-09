import cors from '@fastify/cors';
import Fastify from 'fastify';
import { authRoutes } from './auth/routes.js';
import cookie from '@fastify/cookie';
import { sql } from 'drizzle-orm';
import { recipeRoutes } from './recipes/routes.js';
import { database } from './database/client.js';
import 'dotenv/config';

const server = Fastify({
  logger: true,
});

server.decorateRequest('user', null);

await server.register(cookie);
await server.register(authRoutes);
await server.register(recipeRoutes);

await server.register(cors, {
  origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

server.get('/health', async () => {
  return { status: 'ok' };
});

server.get('/health/database', async () => {
  await database.execute(sql`select 1`);

  return { status: 'ok' };
});

const port = Number(process.env.API_PORT ?? 3000);

try {
  await server.listen({
    host: process.env.API_HOST ?? '127.0.0.1',
    port,
  });
} catch (error) {
  server.log.error(error);
  process.exit(1);
}
