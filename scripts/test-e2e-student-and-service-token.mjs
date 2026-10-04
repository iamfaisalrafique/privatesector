import { DatabaseSync } from 'node:sqlite';
import { generatePrefixedToken, hashPrefixedToken, scopesForRole } from '../emdash-site/node_modules/@emdash-cms/auth/dist/index.mjs';
import { spawn } from 'node:child_process';
import path from 'node:path';

console.log('='.repeat(85));
console.log('REAL END-TO-END RUN: STUDENT PORTAL SUBMISSION & SERVICE PAT PERMISSIONS');
console.log('='.repeat(85));

// 1. Setup real EmDash Contributor service user & PAT in data.db
const db = new DatabaseSync('emdash-site/data.db');

const serviceUserId = 'usr_service_contributor_student_system';
const serviceUserName = 'Student Submission Service (Automated)';
const serviceUserEmail = 'service-student-submissions@privatesector.ch';

// Upsert service user (Role.CONTRIBUTOR = 20)
db.prepare(`
  INSERT INTO users (id, email, name, role, email_verified, created_at, updated_at)
  VALUES (?, ?, ?, 20, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  ON CONFLICT(id) DO UPDATE SET role=20
`).run(serviceUserId, serviceUserEmail, serviceUserName);

// Generate real PAT
const tokenObj = generatePrefixedToken('ec_pat_');
const rawServiceToken = tokenObj.raw;
const tokenHash = tokenObj.hash;
const tokenPrefix = tokenObj.prefix;
const tokenId = 'tok_student_service_e2e_1';
const contributorScopes = JSON.stringify(scopesForRole(20));

db.prepare(`
  INSERT INTO _emdash_api_tokens (id, name, token_hash, prefix, user_id, scopes, created_at)
  VALUES (?, 'Student Service Worker PAT', ?, ?, ?, ?, CURRENT_TIMESTAMP)
  ON CONFLICT(id) DO UPDATE SET token_hash=?, scopes=?
`).run(tokenId, tokenHash, tokenPrefix, serviceUserId, contributorScopes, tokenHash, contributorScopes);

// Also insert an existing post owned by admin to test edit-existing / delete-existing
const adminPostId = 'post_admin_benchmark_test_42';
db.prepare(`
  INSERT OR REPLACE INTO ec_posts (id, slug, status, author_id, published_at, created_at, updated_at, title)
  VALUES (?, 'swiss-pharma-benchmark-2026', 'published', 'usr_admin_root', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Swiss Pharma')
`).run(adminPostId);

console.log('✓ EmDash Contributor Service User and PAT successfully configured in database.');
console.log(`  - Service User ID: ${serviceUserId} (Role: 20 Contributor)`);
console.log(`  - Service PAT Token Prefix: ${tokenPrefix}`);

// 2. Start Astro Standalone Server with the real service token
console.log('\n[SERVER] Starting Astro server on http://127.0.0.1:4321 with EMDASH_STUDENT_SERVICE_PAT...');

const serverProc = spawn('node', ['./dist/server/entry.mjs'], {
  cwd: path.resolve('emdash-site'),
  env: {
    ...process.env,
    PORT: '4321',
    HOST: '127.0.0.1',
    EMDASH_STUDENT_SERVICE_PAT: rawServiceToken,
    EMDASH_INTERNAL_URL: 'http://127.0.0.1:4321'
  },
  stdio: 'pipe'
});

serverProc.stderr.on('data', d => console.error('[SERVER STDERR]', d.toString()));

// Wait for server to be responsive
async function waitForServer(retries = 20) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch('http://127.0.0.1:4321/api/health');
      if (res.ok) return true;
    } catch {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  return false;
}

const isReady = await waitForServer();
if (!isReady) {
  console.error('Server failed to start within timeout');
  serverProc.kill();
  process.exit(1);
}
console.log('✓ Astro server listening and verified responsive.');

let testsPassed = true;

try {
  // 3. Test CSRF Protection
  console.log('\n--- TEST A: CSRF Origin Protection ---');
  const studentSession = {
    id: 8841,
    profile_id: 99,
    name: 'Lukas Keller (ETH Zurich)',
    email: 'l.keller@student.ethz.ch',
    role: 'student'
  };
  const validCookie = 'portal_session=' + Buffer.from(JSON.stringify(studentSession)).toString('base64url');

  const forgedOriginRes = await fetch('http://127.0.0.1:4321/api/student/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'https://evil-attacker-site.com',
      'Host': '127.0.0.1:4321',
      'Cookie': validCookie
    },
    body: JSON.stringify({ title: 'CSRF Attempt', content_body: 'Should be blocked.' })
  });
  console.log(`  Forged Origin (https://evil-attacker-site.com): HTTP ${forgedOriginRes.status} (${forgedOriginRes.status === 403 ? '✓ BLOCKED 403 Forbidden' : 'FAILED'})`);
  if (forgedOriginRes.status !== 403) testsPassed = false;

  // Bearer Token alternative strictly removed:
  const bearerAttemptRes = await fetch('http://127.0.0.1:4321/api/student/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://127.0.0.1:4321',
      'Host': '127.0.0.1:4321',
      'Authorization': `Bearer portal_session_${Buffer.from(JSON.stringify(studentSession)).toString('base64url')}`
    },
    body: JSON.stringify({ title: 'Bearer Attempt', content_body: 'Should be rejected without cookie.' })
  });
  console.log(`  Bearer Token without Cookie: HTTP ${bearerAttemptRes.status} (${bearerAttemptRes.status === 401 ? '✓ REJECTED 401 Unauthorized (Cookie strictly required)' : 'FAILED'})`);
  if (bearerAttemptRes.status !== 401) testsPassed = false;

  // 4. Real Portal Submit with Spoof Attempts
  console.log('\n--- TEST B: Real End-to-End Submission with Client Spoof Attempts ---');
  const validSubmitRes = await fetch('http://127.0.0.1:4321/api/student/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://127.0.0.1:4321',
      'Host': '127.0.0.1:4321',
      'Cookie': validCookie
    },
    body: JSON.stringify({
      title: 'Decarbonizing Swiss Supply Chains: Bühler Analysis',
      subtitle: 'A student research brief on Swiss manufacturing emissions',
      content_body: 'This article analyzes Scope 1 and Scope 2 emissions across Swiss food processing industries in depth.',
      // Spoof attempts:
      student_id: 999999,
      student_author_id: 888888,
      author_name: 'Dr. Severin Schwan (Chairman of Roche)',
      authorId: 'usr_admin_root',
      status: 'published',
      publishedAt: '2026-10-04T00:00:00.000Z'
    })
  });

  const submitJson = await validSubmitRes.json();
  console.log(`  Submit HTTP Status: ${validSubmitRes.status} (${validSubmitRes.status === 201 ? '✓ 201 Created' : 'FAILED'})`);
  console.log('  Response Payload:', JSON.stringify(submitJson));
  if (validSubmitRes.status !== 201) testsPassed = false;

  const createdId = submitJson.id;
  console.log(`  Created Post ID in EmDash: ${createdId}`);

  // 5. Query Created Draft in EmDash
  console.log('\n--- TEST C: Inspect Created Post in EmDash Database ---');
  const postRow = db.prepare('SELECT id, status, author_id, student_author_id, author_name, title FROM ec_posts WHERE id = ?').get(createdId);
  console.log('  Stored Post Record:');
  console.log(`    - ID:                ${postRow?.id}`);
  console.log(`    - Status:            ${postRow?.status} (Must be strictly "draft")`);
  console.log(`    - Author ID:         ${postRow?.author_id} (Must be service user: ${serviceUserId})`);
  console.log(`    - student_author_id: ${postRow?.student_author_id} (Must match student profile_id: ${studentSession.profile_id})`);
  console.log(`    - author_name:       ${postRow?.author_name} (Must match student name: ${studentSession.name})`);

  const verifyStatus = postRow?.status === 'draft';
  const verifyAuthor = postRow?.author_id === serviceUserId;
  const verifyStudentId = postRow?.student_author_id === studentSession.profile_id;
  const verifyStudentName = postRow?.author_name === studentSession.name;

  console.log(`  Status is Draft:            ${verifyStatus ? '✓ PASS' : 'FAILED'}`);
  console.log(`  Author is Service User:     ${verifyAuthor ? '✓ PASS' : 'FAILED'}`);
  console.log(`  student_author_id Enforced: ${verifyStudentId ? '✓ PASS' : 'FAILED'}`);
  console.log(`  author_name Enforced:       ${verifyStudentName ? '✓ PASS' : 'FAILED'}`);

  if (!verifyStatus || !verifyAuthor || !verifyStudentId || !verifyStudentName) testsPassed = false;

  // 6. Test Service Token Privilege Enforcement (Publish, Edit-Existing, Delete-Existing)
  console.log('\n--- TEST D: Service Token Privilege Restrictions (Contributor Role 20) ---');

  // Attempt 1: Service token attempts to publish the draft
  const publishRes = await fetch(`http://127.0.0.1:4321/_emdash/api/content/posts/${createdId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${rawServiceToken}`
    },
    body: JSON.stringify({ status: 'published' })
  });
  console.log(`  1. Attempt to Publish (PUT status="published"): HTTP ${publishRes.status} (${publishRes.status === 403 || publishRes.status === 400 ? '✓ REJECTED (Forbidden/Blocked by schema)' : 'FAILED'})`);
  if (publishRes.status !== 403 && publishRes.status !== 400) testsPassed = false;

  // Attempt 2: Service token attempts to edit another user's post (adminPostId)
  const editExistingRes = await fetch(`http://127.0.0.1:4321/_emdash/api/content/posts/${adminPostId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${rawServiceToken}`
    },
    body: JSON.stringify({ title: 'Tampered Title by Service Token' })
  });
  console.log(`  2. Attempt to Edit Existing Post Owned by Other: HTTP ${editExistingRes.status} (${editExistingRes.status === 403 ? '✓ REJECTED (403 Forbidden)' : 'FAILED'})`);
  if (editExistingRes.status !== 403) testsPassed = false;

  // Attempt 3: Service token attempts to delete existing post
  const deleteExistingRes = await fetch(`http://127.0.0.1:4321/_emdash/api/content/posts/${adminPostId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${rawServiceToken}`
    }
  });
  console.log(`  3. Attempt to Delete Existing Post: HTTP ${deleteExistingRes.status} (${deleteExistingRes.status === 403 ? '✓ REJECTED (403 Forbidden)' : 'FAILED'})`);
  if (deleteExistingRes.status !== 403) testsPassed = false;

} finally {
  serverProc.kill();
  db.close();
}

console.log('\n' + '='.repeat(85));
console.log(`END-TO-END VERIFICATION RESULT: ${testsPassed ? '✓ 100% PASS' : 'FAILED'}`);
console.log('='.repeat(85));

if (!testsPassed) process.exit(1);
