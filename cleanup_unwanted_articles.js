import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgres://postgres:edcKM0253QrFib0sSl2JYZoj5If8DxbKVxgzmsBpQVI5HBHyQ9UBZ6gMi79z0AFD@62.72.44.254:1127/postgres";

async function main() {
  const client = new Client({ connectionString });
  
  try {
    console.log("Connecting to live PostgreSQL database...");
    await client.connect();
    console.log("Connected successfully!");

    const unwantedSlugs = [
      'novartis-expands-ai-drug-discovery-basel',
      'roche-secures-fda-approval-molecular-diagnostics',
      'abb-partners-green-hydrogen-industrial-decarbonization',
      'schindler-accelerates-smart-elevator-iot-integration',
      'richemont-reports-strong-q2-growth-watchmaking',
      'swisscom-deploys-standalone-5g-enterprise-networks'
    ];

    for (const slug of unwantedSlugs) {
      const result = await client.query('DELETE FROM news WHERE slug = $1', [slug]);
      console.log(`Deleted "${slug}": ${result.rowCount} row(s)`);
    }

    // Verify remaining articles
    const remaining = await client.query('SELECT id, title, slug FROM news ORDER BY id');
    console.log(`\nRemaining articles (${remaining.rows.length}):`);
    for (const row of remaining.rows) {
      console.log(`  [${row.id}] ${row.title} (${row.slug})`);
    }

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
    console.log("\nDone.");
  }
}

main();
