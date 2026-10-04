import { DatabaseSync } from 'node:sqlite';
import { spawn } from 'node:child_process';
import { Role, generatePrefixedToken } from '../emdash-site/node_modules/@emdash-cms/auth/dist/index.mjs';

console.log('='.repeat(85));
console.log('REAL HTTP STUDENT SUBMISSION TAMPER-PROOFING & RBAC TEST');
console.log('='.repeat(85));

const db = new DatabaseSync('./emdash-site/data.db');

// 1. Initial Root Admin & Student Setup in data.db
// We state clearly: Root Admin and initial users are created during system provisioning / setup wizard.
const adminId = 'usr_flow_admin_001';
const studentId = 'usr_flow_student_001';

db.prepare("DELETE FROM users WHERE id IN (?, ?)").run(adminId, studentId);
db.prepare("DELETE FROM _emdash_api_tokens WHERE user_id IN (?, ?)").run(adminId, studentId);

db.prepare(`
  INSERT INTO users (id, email, name, role, email_verified, disabled, created_at, updated_at)
  VALUES (?, 'admin@privatesector.ch', 'Flow Admin', ?, 1, 0, datetime('now'), datetime('now'))
`).run(adminId, Role.ADMIN);

db.prepare(`
  INSERT INTO users (id, email, name, role, email_verified, disabled, created_at, updated_at)
  VALUES (?, 'student@privatesector.ch', 'Flow Student', ?, 1, 0, datetime('now'), datetime('now'))
`).run(studentId, Role.CONTRIBUTOR);

// Admin PAT (provisioned for administrative access)
const adminBootstrap = generatePrefixedToken('ec_pat_');
db.prepare(`
  INSERT INTO _emdash_api_tokens (id, name, token_hash, prefix, user_id, scopes, created_at)
  VALUES ('tok_boot_admin', 'Admin Bootstrap Token', ?, ?, ?, ?, datetime('now'))
`).run(adminBootstrap.hash, adminBootstrap.prefix, adminId, JSON.stringify(['content:write', 'content:read', 'admin']));

// Student PAT (provisioned with contributor scopes: content:write, content:read)
const studentBootstrap = generatePrefixedToken('ec_pat_');
db.prepare(`
  INSERT INTO _emdash_api_tokens (id, name, token_hash, prefix, user_id, scopes, created_at)
  VALUES ('tok_boot_student', 'Student Contributor Token', ?, ?, ?, ?, datetime('now'))
`).run(studentBootstrap.hash, studentBootstrap.prefix, studentId, JSON.stringify(['content:write', 'content:read']));

console.log('[1] Users and initial tokens initialized:');
console.log(`  -> Admin User ID:   ${adminId} (Role: ${Role.ADMIN})`);
console.log(`  -> Student User ID: ${studentId} (Role: ${Role.CONTRIBUTOR})`);

// 2. Start standalone Astro server
console.log('\n[2] Spawning standalone Astro server on port 4321...');
const serverProcess = spawn('node', ['./dist/server/entry.mjs'], {
  cwd: './emdash-site',
  env: { ...process.env, PORT: '4321', HOST: '127.0.0.1' },
  stdio: ['ignore', 'pipe', 'pipe']
});

serverProcess.stderr.on('data', (d) => {
  const msg = d.toString();
  if (!msg.includes('ExperimentalWarning')) {
    console.error('[Server Log]:', msg.trim());
  }
});

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404 || res.status === 200) return true;
    } catch (e) {}
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error('Server timed out waiting to start');
}

await waitForServer('http://127.0.0.1:4321/_emdash/api/health');
console.log('  -> Server is UP on http://127.0.0.1:4321\n');

const createdPostIds = [];

try {
  // TEST 0: Real Flow HTTP Token Generation via POST /_emdash/api/admin/api-tokens
  console.log('='.repeat(85));
  console.log('REAL FLOW HTTP TOKEN CREATION TEST (POST /_emdash/api/admin/api-tokens)');
  console.log('='.repeat(85));

  const createTokenRes = await fetch('http://127.0.0.1:4321/_emdash/api/admin/api-tokens', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminBootstrap.raw}`,
      'X-EmDash-Request': '1',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Real HTTP Generated Admin Token',
      scopes: ['content:write', 'content:read', 'admin']
    })
  });
  console.log(`  -> HTTP Status for Admin Token Creation: ${createTokenRes.status} (${createTokenRes.status === 201 ? '✓ SUCCESS' : 'FAILED'})`);
  const tokenData = await createTokenRes.json();
  const httpToken = tokenData.data?.token || tokenData.token;
  console.log('  -> Generated Token Prefix/Snippet:     ', httpToken ? httpToken.slice(0, 16) + '...' : 'N/A');

  // Verify non-admin cannot use the token creation endpoint
  const failTokenRes = await fetch('http://127.0.0.1:4321/_emdash/api/admin/api-tokens', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${studentBootstrap.raw}`,
      'X-EmDash-Request': '1',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Unauthorized Student Token Creation',
      scopes: ['admin']
    })
  });
  console.log(`  -> Student attempting to create token via API: HTTP ${failTokenRes.status} (${failTokenRes.status === 403 ? '✓ REJECTED (403 Forbidden)' : 'FAILED'})`);

  console.log('\n' + '='.repeat(85));
  console.log('STUDENT SUBMISSION TAMPER-PROOFING TESTS');
  console.log('='.repeat(85));

  // TEST 1: Tamper Attempt with status: "published"
  console.log('\n[TEST 1] Tamper: Student supplies status = "published" in POST /_emdash/api/content/posts');
  const res1 = await fetch('http://127.0.0.1:4321/_emdash/api/content/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${studentBootstrap.raw}`,
      'X-EmDash-Request': '1',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      slug: 'test-tamper-published',
      status: 'published',
      data: {
        title: 'Tamper Published Post',
        content: [{ _type: 'block', children: [{ _type: 'span', text: 'Hello' }] }]
      }
    })
  });
  console.log(`  -> HTTP Status: ${res1.status} (${res1.status === 400 ? '✓ REJECTED (400 Bad Request — Zod schema restricts status to ["draft"])' : 'FAIL'})`);
  const err1 = await res1.json();
  console.log('  -> Error Response Details:', JSON.stringify(err1.error || err1));

  // TEST 2: Tamper Attempt with publishedAt date override
  console.log('\n[TEST 2] Tamper: Student supplies publishedAt date override in POST /_emdash/api/content/posts');
  const res2 = await fetch('http://127.0.0.1:4321/_emdash/api/content/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${studentBootstrap.raw}`,
      'X-EmDash-Request': '1',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      slug: 'test-tamper-published-at',
      status: 'draft',
      publishedAt: '2026-10-04T00:00:00.000Z',
      data: {
        title: 'Tamper publishedAt Post',
        content: [{ _type: 'block', children: [{ _type: 'span', text: 'Hello' }] }]
      }
    })
  });
  console.log(`  -> HTTP Status: ${res2.status} (${res2.status === 403 ? '✓ REJECTED (403 Forbidden — requires content:publish_any)' : 'FAIL'})`);
  const err2 = await res2.json();
  console.log('  -> Error Response Details:', JSON.stringify(err2.error || err2));

  // TEST 3: Tamper Attempt with authorId override (spoofing Admin)
  console.log('\n[TEST 3] Tamper: Student supplies spoofed authorId = adminId in POST /_emdash/api/content/posts');
  const res3 = await fetch('http://127.0.0.1:4321/_emdash/api/content/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${studentBootstrap.raw}`,
      'X-EmDash-Request': '1',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      slug: 'test-tamper-author-id',
      status: 'draft',
      authorId: adminId, // Trying to attribute post to Admin!
      data: {
        title: 'Tamper authorId Post',
        content: [{ _type: 'block', children: [{ _type: 'span', text: 'Hello' }] }]
      }
    })
  });
  console.log(`  -> HTTP Status: ${res3.status}`);
  const data3 = await res3.json();
  const item3 = data3.item || data3.data?.item;
  if (item3) {
    createdPostIds.push(item3.id);
    console.log('  -> Created Item ID:       ', item3.id);
    console.log('  -> Created Item Status:   ', item3.status, '(strictly "draft")');
    console.log('  -> Created Item authorId: ', item3.authorId);
    console.log('  -> Authenticated Student: ', studentId);
    console.log('  -> Spoof Admin ID sent:   ', adminId);
    const authorIsStudent = item3.authorId === studentId;
    console.log('  -> Tamper Prevention:     ', authorIsStudent ? '✓ PASSED (authorId strictly enforced from session)' : 'FAIL');
  }

  // TEST 4: Legitimate Student Draft
  console.log('\n[TEST 4] Legitimate Student Submission: Student submits valid draft');
  const res4 = await fetch('http://127.0.0.1:4321/_emdash/api/content/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${studentBootstrap.raw}`,
      'X-EmDash-Request': '1',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      slug: 'valid-student-draft-submission',
      status: 'draft',
      data: {
        title: 'Student Analysis on Geneva Wealth Management',
        content: [{ _type: 'block', children: [{ _type: 'span', text: 'Student analysis prose...' }] }]
      }
    })
  });
  console.log(`  -> HTTP Status: ${res4.status} (${res4.status === 201 ? '✓ SUCCESS (201 Created)' : 'FAIL'})`);
  const data4 = await res4.json();
  const item4 = data4.item || data4.data?.item;
  if (item4) {
    createdPostIds.push(item4.id);
    console.log('  -> Draft ID: ', item4.id);
    console.log('  -> Status:   ', item4.status, '(draft)');
    console.log('  -> Author:   ', item4.authorId, '(authenticated student ID)');
  }

} finally {
  console.log('\n' + '='.repeat(85));
  console.log('CLEANUP: Deleting test posts, tokens and users...');
  for (const id of createdPostIds) {
    db.prepare("DELETE FROM ec_posts WHERE id = ?").run(id);
  }
  db.prepare("DELETE FROM _emdash_api_tokens WHERE user_id IN (?, ?)").run(adminId, studentId);
  db.prepare("DELETE FROM users WHERE id IN (?, ?)").run(adminId, studentId);
  serverProcess.kill('SIGTERM');
  console.log('Cleanup completed and server terminated.');
}
