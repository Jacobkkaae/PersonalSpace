import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);

const saltLength = 16;
const derivedKeyLength = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(saltLength);

  const derivedKey = (await scrypt(password, salt, derivedKeyLength)) as Buffer;

  return `${salt.toString('hex')}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, keyHex] = storedHash.split(':');

  if (!saltHex || !keyHex) {
    return false;
  }

  const salt = Buffer.from(saltHex, 'hex');
  const storedKey = Buffer.from(keyHex, 'hex');

  if (storedKey.length !== derivedKeyLength) {
    return false;
  }

  const derivedKey = (await scrypt(password, salt, derivedKeyLength)) as Buffer;

  return timingSafeEqual(derivedKey, storedKey);
}
