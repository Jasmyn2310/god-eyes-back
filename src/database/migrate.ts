import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is missing in .env');
}

const sql = postgres(connectionString, { max: 1, ssl: 'require' });
const db = drizzle(sql);

async function runMigrate() {
  console.log('⏳ Running migrations...');
  try {
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('✅ Migrations applied successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await sql.end();
  }
}

runMigrate();
