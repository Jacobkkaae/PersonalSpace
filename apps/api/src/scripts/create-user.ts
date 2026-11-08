import { password, input } from '@inquirer/prompts';

import { pool } from '../database/client.js';
import { createUser } from '../auth/service.js';

try {
  const email = await input({
    message: 'Email:',
    validate: (value) => {
      if (!value.includes('@')) {
        return 'Enter a valid email address.';
      }

      return true;
    },
  });

  const userPassword = await password({
    message: 'Password:',
    mask: '*',
    validate: (value) => {
      if (value.length < 8) {
        return 'Use at least 8 characters.';
      }

      return true;
    },
  });

  const user = await createUser(email, userPassword);

  console.log(`Created user: ${user.email}`);
} catch (error) {
  console.error('Could not create user.');

  if (error instanceof Error) {
    console.error(error.message);
  }

  process.exitCode = 1;
} finally {
  await pool.end();
}
