import { drizzle } from 'drizzle-orm/node-postgres';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { Pool } from 'pg';

config({ path: resolve(process.cwd(), '../../.env') });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not configured.');
}

export const pool = new Pool({
  connectionString: databaseUrl,
});

export const database = drizzle(pool);
