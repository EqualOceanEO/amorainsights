import { config } from 'dotenv';
import { join } from 'path';
import { initDb } from '../src/lib/db';

// Load environment variables from .env.local
config({ path: join(__dirname, '..', '.env.local') });

async function main() {
  try {
    console.log('🚀 Initializing database...');
    await initDb();
    console.log('✅ Database initialized successfully!');
    console.log('📊 Tables created: users, sessions');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

main();
