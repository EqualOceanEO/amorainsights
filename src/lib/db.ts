import { neon } from '@neondatabase/serverless';

// Initialize database tables
export async function initDb() {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL environment variable is not set');
  }
  
  const sql = neon(process.env.POSTGRES_URL);
  
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Database tables initialized');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Helper to get SQL client
function getSql() {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL environment variable is not set');
  }
  return neon(process.env.POSTGRES_URL);
}

export async function getUserByEmail(email: string) {
  const sql = getSql();
  try {
    const users = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    return users[0] || null;
  } catch (error) {
    console.error('Failed to get user by email:', error);
    return null;
  }
}

export async function getUserById(id: number) {
  const sql = getSql();
  try {
    const users = await sql`
      SELECT id, name, email, created_at FROM users WHERE id = ${id}
    `;
    return users[0] || null;
  } catch (error) {
    console.error('Failed to get user by id:', error);
    return null;
  }
}

export async function createUser(name: string, email: string, passwordHash: string) {
  const sql = getSql();
  try {
    const users = await sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (${name}, ${email}, ${passwordHash})
      RETURNING id, name, email, created_at
    `;
    return users[0];
  } catch (error: any) {
    if (error.code === '23505') {
      throw new Error('Email already exists');
    }
    throw error;
  }
}
