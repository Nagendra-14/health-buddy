import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from '../shared/schema';
import connectPg from 'connect-pg-simple';
import session from 'express-session';

// Create PostgreSQL connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Drizzle ORM client
export const db = drizzle(pool, { schema });

// For session storage
export const PostgresSessionStore = connectPg(session);
export const sessionStore = new PostgresSessionStore({
  pool,
  createTableIfMissing: true,
});

// Log database connection
console.log('Database connected: PostgreSQL via Drizzle ORM');