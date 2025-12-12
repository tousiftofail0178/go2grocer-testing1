
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Checking for both standard and Netlify-specific env vars
const connectionString = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL or NETLIFY_DATABASE_URL is not set');
}

const sql = neon(connectionString);
export const db = drizzle(sql);
