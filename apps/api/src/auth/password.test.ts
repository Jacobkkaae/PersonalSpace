import { hashPassword, verifyPassword } from './password.js';

const password = 'development-password';
const hash = await hashPassword(password);

if (!(await verifyPassword(password, hash))) {
  throw new Error('Password verification failed.');
}

if (await verifyPassword('wrong-password', hash)) {
  throw new Error('Incorrect password was accepted.');
}

console.log('Password hashing test passed.');
