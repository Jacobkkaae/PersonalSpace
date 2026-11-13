import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';
import { resolve } from 'node:path';

config({ path: resolve(process.cwd(), '../../.env') });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not configured.');
}

export default defineConfig({
  schema: './src/database/schema.ts',
  out: '../../database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
});
