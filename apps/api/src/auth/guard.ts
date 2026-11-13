import type { FastifyReply, FastifyRequest } from 'fastify';

import { getUserFromSessionToken } from './service.js';
import { sessionCookieName } from './routes.js';

export type AuthenticatedUser = {
  id: string;
  email: string;
};

declare module 'fastify' {
  interface FastifyRequest {
    user: AuthenticatedUser | null;
  }
}

export async function requireAuthentication(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const sessionToken = request.cookies[sessionCookieName];

  if (!sessionToken) {
    request.user = null;

    await reply.code(401).send({
      error: 'Not authenticated.',
    });

    return;
  }

  const user = await getUserFromSessionToken(sessionToken);

  if (!user) {
    request.user = null;

    await reply.code(401).send({
      error: 'Not authenticated.',
    });

    return;
  }

  request.user = user;
}
