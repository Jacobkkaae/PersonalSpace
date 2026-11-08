import cors from '@fastify/cors';
import Fastify from 'fastify';
import { authRoutes } from './auth/routes.js';

import { sql } from 'drizzle-orm';

import { database } from './database/client.js';

const server = Fastify({
  logger: true,
});

server.decorateRequest('user', null);

await server.register(authRoutes);

await server.register(cors, {
  origin: 'http://localhost:5173',
  credentials: true,
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
    host: '127.0.0.1',
    port,
  });
} catch (error) {
  server.log.error(error);
  process.exit(1);
}
