import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

async function checkDatabaseConnection() {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('ERROR: DATABASE_URL is not set in environment or .env');
    process.exit(1);
  }

  // Parse URL safely to display non-sensitive metadata only
  try {
    const parsed = new URL(connectionString);
    console.log(`[Config] Host: ${parsed.hostname}`);
    console.log(`[Config] Port: ${parsed.port || '5432'}`);
    console.log(`[Config] Database: ${parsed.pathname.replace(/^\//, '')}`);
    console.log(`[Config] Username present: ${Boolean(parsed.username)}`);
    console.log(`[Config] Password present: ${Boolean(parsed.password)}`);
  } catch {
    console.log('[Config] Custom connection string format');
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log('\n[1/4] Attempting direct PostgreSQL connection handshake...');
    const client = await pool.connect();
    console.log('✅ Handshake succeeded!');

    console.log('\n[2/4] Querying database version & server time...');
    const timeRes = await client.query('SELECT NOW() as server_time, version() as pg_version');
    console.log(`✅ Server Time (PostgreSQL): ${timeRes.rows[0].server_time}`);
    console.log(`✅ Engine: ${timeRes.rows[0].pg_version.split(',')[0]}`);

    console.log('\n[3/4] Verifying schema tables in public schema...');
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    const tableNames = tablesRes.rows.map((r: any) => r.table_name);
    console.log(`✅ Found ${tableNames.length} tables in public schema:`);
    console.log(`   ${tableNames.join(', ')}`);

    console.log('\n[4/4] Verifying table data counts...');
    const counts: Record<string, number> = {};
    for (const t of ['users', 'vehicles', 'vehicle_drivers', 'reports', 'delivery_logs', 'audit_logs']) {
      if (tableNames.includes(t)) {
        const countRes = await client.query(`SELECT COUNT(*) as cnt FROM ${t}`);
        counts[t] = parseInt(countRes.rows[0].cnt, 10);
      }
    }
    console.log('✅ Table row counts in Supabase:', counts);

    client.release();
    await pool.end();

    console.log('\n==========================================');
    console.log('RESULT: REAL POSTGRESQL CONNECTION SUCCEEDED!');
    console.log('==========================================');
    process.exit(0);
  } catch (err: any) {
    console.error('\n❌ POSTGRESQL CONNECTION FAILED:');
    console.error(`Error Code: ${err.code || 'UNKNOWN'}`);
    console.error(`Message: ${err.message}`);
    process.exit(1);
  }
}

checkDatabaseConnection();
