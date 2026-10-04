import { POST } from '../emdash-site/src/pages/api/student/submit.ts';

console.log('='.repeat(85));
console.log('STUDENT PORTAL AUTHENTICATION & TAMPER RESISTANCE TEST');
console.log('Endpoint: emdash-site/src/pages/api/student/submit.ts');
console.log('='.repeat(85));

// Capture payload forwarded to EmDash internal API
let capturedForwardPayload = null;
let capturedAuthHeader = null;
const originalFetch = globalThis.fetch;

globalThis.fetch = async (url, options = {}) => {
  if (typeof url === 'string' && url.includes('/_emdash/api/content/posts')) {
    capturedForwardPayload = JSON.parse(options.body);
    capturedAuthHeader = options.headers?.Authorization || options.headers?.authorization;
    return new Response(JSON.stringify({
      id: 'post_created_student_test_1',
      data: { item: { id: 'post_created_student_test_1', status: capturedForwardPayload.status } }
    }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  }
  return originalFetch(url, options);
};

process.env.EMDASH_STUDENT_SERVICE_PAT = 'emdash_service_pat_contributor_single_token_secret';
process.env.EMDASH_INTERNAL_URL = 'http://127.0.0.1:4321';

// Helper to create base64url portal token
function createPortalToken(user) {
  return 'portal_session_' + Buffer.from(JSON.stringify(user)).toString('base64url');
}

// TEST 1: Unauthenticated request (no portal session)
console.log('\n[TEST 1] Unauthenticated request (no portal session header or cookie)...');
const req1 = new Request('http://localhost:4321/api/student/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Unauthorized Student Submission Attempt',
    content_body: 'This should be rejected before any processing.'
  })
});
const res1 = await POST({ request: req1, locals: {} });
console.log(`  -> Response Status: ${res1.status} (${res1.status === 401 ? '✓ REJECTED (401 Unauthorized)' : 'FAILED'})`);
const body1 = await res1.json();
console.log('  -> Body:', JSON.stringify(body1));

// TEST 2: Wrong portal role (Company user trying to submit student article)
console.log('\n[TEST 2] Wrong portal role (Company portal user trying to submit to student endpoint)...');
const companyUser = {
  id: 'usr_company_novartis_42',
  email: 'careers@novartis.ch',
  name: 'Novartis Recruiter',
  role: 'company'
};
const req2 = new Request('http://localhost:4321/api/student/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${createPortalToken(companyUser)}`
  },
  body: JSON.stringify({
    title: 'Company Submitting as Student',
    content_body: 'This should be rejected because role is company, not student.'
  })
});
const res2 = await POST({ request: req2, locals: {} });
console.log(`  -> Response Status: ${res2.status} (${res2.status === 403 ? '✓ REJECTED (403 Forbidden)' : 'FAILED'})`);
const body2 = await res2.json();
console.log('  -> Body:', JSON.stringify(body2));

// TEST 3: Authenticated Student Contributor supplies SPOOFED author fields in request body
console.log('\n[TEST 3] Authenticated Student supplies forged author and status fields in request body...');
const verifiedStudentUser = {
  id: 'student_ethz_8841',
  profile_id: 'ethz_student_profile_99',
  name: 'Lukas Keller (ETH Zurich)',
  email: 'l.keller@student.ethz.ch',
  role: 'student'
};

const req3 = new Request('http://localhost:4321/api/student/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${createPortalToken(verifiedStudentUser)}`
  },
  body: JSON.stringify({
    title: 'Decarbonizing Swiss Supply Chains: Bühler Analysis',
    subtitle: 'A student research brief on Swiss manufacturing emissions',
    content_body: 'This article analyzes Scope 1 and Scope 2 emissions across Swiss food processing industries in depth.',
    // SPOOF ATTEMPTS:
    student_id: 999999,
    student_author_id: 888888,
    author_name: 'Dr. Severin Schwan (Chairman of Roche)',
    authorId: 'usr_admin_root',
    status: 'published',
    publishedAt: '2026-10-04T00:00:00.000Z'
  })
});

const res3 = await POST({ request: req3, locals: {} });
console.log(`  -> Response Status: ${res3.status} (${res3.status === 201 ? '✓ SUCCESS (201 Created)' : 'FAILED'})`);
const body3 = await res3.json();

console.log('\nVERIFICATION OF CLIENT SPOOF ATTEMPTS VS SERVER-ENFORCED VALUES:');
console.log('  -> Client Sent student_id:        999999');
console.log('  -> Client Sent student_author_id: 888888');
console.log('  -> Client Sent author_name:       "Dr. Severin Schwan (Chairman of Roche)"');
console.log('  -> Client Sent status:            "published"');
console.log('  -> Client Sent authorId:          "usr_admin_root"');

console.log('\n  -> Payload Forwarded to Internal EmDash Content API:');
console.log('     * status:            ', JSON.stringify(capturedForwardPayload.status), '(Must be "draft")');
console.log('     * student_author_id: ', JSON.stringify(capturedForwardPayload.data.student_author_id), '(Must match session profile_id)');
console.log('     * author_name:       ', JSON.stringify(capturedForwardPayload.data.author_name), '(Must match session user name)');
console.log('     * auth token used:   ', capturedAuthHeader === `Bearer ${process.env.EMDASH_STUDENT_SERVICE_PAT}` ? '✓ Dedicated Single Service PAT' : 'FAILED');

const passedId = capturedForwardPayload.data.student_author_id === verifiedStudentUser.profile_id;
const passedName = capturedForwardPayload.data.author_name === verifiedStudentUser.name;
const passedStatus = capturedForwardPayload.status === 'draft';
const passedServicePAT = capturedAuthHeader === `Bearer ${process.env.EMDASH_STUDENT_SERVICE_PAT}`;

console.log('\nAUDIT VERDICT ON TAMPER RESISTANCE:');
console.log('  - student_author_id came strictly from server session: ', passedId ? '✓ PASS' : 'FAIL');
console.log('  - author_name came strictly from server session:       ', passedName ? '✓ PASS' : 'FAIL');
console.log('  - status strictly forced to draft:                     ', passedStatus ? '✓ PASS' : 'FAIL');
console.log('  - internal EmDash call used dedicated service PAT:     ', passedServicePAT ? '✓ PASS' : 'FAIL');
console.log('  - Client-supplied forged overrides completely ignored: ', (passedId && passedName && passedStatus && passedServicePAT) ? '✓ 100% SECURE' : 'FAIL');

globalThis.fetch = originalFetch;

if (!passedId || !passedName || !passedStatus || !passedServicePAT) {
  process.exit(1);
}
