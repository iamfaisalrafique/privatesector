import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString || (!connectionString.startsWith('postgres://') && !connectionString.startsWith('postgresql://'))) {
  console.error('[CONFIG ERROR] No valid postgres DATABASE_URL provided in environment.');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString, max: 1 });

async function run() {
  const client = await pool.connect();
  try {
    await client.query('SET default_transaction_read_only = on;');
    console.log('Connected to Production PostgreSQL in READ ONLY mode.');

    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log(`Found ${tablesRes.rows.length} tables in PostgreSQL public schema:`);

    for (const row of tablesRes.rows) {
      const tableName = row.table_name;
      const countRes = await client.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
      const count = countRes.rows[0].count;

      const colsRes = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);

      console.log(`\n### PostgreSQL Table: \`${tableName}\` (Rows: ${count})`);
      console.log('| Column | Type | Nullable | Default |');
      console.log('| --- | --- | --- | --- |');
      for (const c of colsRes.rows) {
        console.log(`| \`${c.column_name}\` | \`${c.data_type}\` | ${c.is_nullable} | ${c.column_default || 'NULL'} |`);
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => {
  console.error('PostgreSQL inspection error:', err.message);
  process.exit(1);
});
