import { createHash, randomBytes } from 'node:crypto';

import { and, eq, gt } from 'drizzle-orm';

import { database } from '../database/client.js';
import { sessions, users } from '../database/schema.js';
import { hashPassword, verifyPassword } from './password.js';

const sessionDurationMs = 30 * 24 * 60 * 60 * 1000;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function createUser(
  email: string,
  password: string,
): Promise<{ id: string; email: string }> {
  const [user] = await database
    .insert(users)
    .values({
      email: normalizeEmail(email),
      passwordHash: await hashPassword(password),
    })
    .returning({
      id: users.id,
      email: users.email,
    });

  return user;
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<{ id: string; email: string } | null> {
  const [user] = await database
    .select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, normalizeEmail(email)))
    .limit(1);

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
  };
}

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + sessionDurationMs);

  await database.insert(sessions).values({
    userId,
    tokenHash: hashSessionToken(token),
    expiresAt,
  });

  return token;
}

export async function getUserFromSessionToken(
  token: string,
): Promise<{ id: string; email: string } | null> {
  const [result] = await database
    .select({
      id: users.id,
      email: users.email,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, hashSessionToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);

  return result ?? null;
}

export async function deleteSession(token: string): Promise<void> {
  await database.delete(sessions).where(eq(sessions.tokenHash, hashSessionToken(token)));
}
