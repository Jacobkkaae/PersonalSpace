import type { FastifyPluginAsync } from 'fastify';

import {
  authenticateUser,
  createSession,
  deleteSession,
  getUserFromSessionToken,
} from './service.js';

export const sessionCookieName = 'personal_space_session';

export const authRoutes: FastifyPluginAsync = async (server) => {

  server.post<{
    Body: {
      email: string;
      password: string;
    };
  }>('/auth/login', async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.code(400).send({
        error: 'Email and password are required.',
      });
    }

    const user = await authenticateUser(email, password);

    if (!user) {
      return reply.code(401).send({
        error: 'Invalid email or password.',
      });
    }

    const sessionToken = await createSession(user.id);

    reply.setCookie(sessionCookieName, sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
      },
    };
  });

  server.post('/auth/logout', async (request, reply) => {
    const sessionToken = request.cookies[sessionCookieName];

    if (sessionToken) {
      await deleteSession(sessionToken);
    }

    reply.clearCookie(sessionCookieName, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return { status: 'ok' };
  });

  server.get('/auth/me', async (request, reply) => {
    const sessionToken = request.cookies[sessionCookieName];

    if (!sessionToken) {
      return reply.code(401).send({
        error: 'Not authenticated.',
      });
    }

    const user = await getUserFromSessionToken(sessionToken);

    if (!user) {
      return reply.code(401).send({
        error: 'Not authenticated.',
      });
    }

    return { user };
  });
};
