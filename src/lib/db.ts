import { Pool } from 'pg';

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

// Connection pool — reused across requests in serverless
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
});

export { pool };

// ─── Types ───────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  password: string;
  name: string | null;
  created_at: Date;
}

// ─── User operations ─────────────────────────────────────────────────────────

export async function createUser(
  email: string,
  hashedPassword: string,
  name?: string
): Promise<User> {
  const { rows } = await pool.query<User>(
    `INSERT INTO users (email, password, name)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [email, hashedPassword, name ?? null]
  );
  return rows[0];
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { rows } = await pool.query<User>(
    `SELECT * FROM users WHERE email = $1 LIMIT 1`,
    [email]
  );
  return rows[0] ?? null;
}

export async function getUserById(id: number): Promise<User | null> {
  const { rows } = await pool.query<User>(
    `SELECT * FROM users WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}
