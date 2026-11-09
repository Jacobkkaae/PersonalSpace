import { hashPassword, verifyPassword } from './password.js';

import { describe, expect, it } from 'vitest';

describe('password hashing', () => {
  it('verifies the original password and rejects a different one', async () => {
    const password = 'development-password';
    const hash = await hashPassword(password);

    await expect(verifyPassword(password, hash)).resolves.toBe(true);
    await expect(verifyPassword('wrong-password', hash)).resolves.toBe(false);
  });

  it('creates a different hash for the same password each time', async () => {
    const firstHash = await hashPassword('development-password');
    const secondHash = await hashPassword('development-password');

    expect(firstHash).not.toBe(secondHash);
  });
});
