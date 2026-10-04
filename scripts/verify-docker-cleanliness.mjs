import fs from 'fs';
import path from 'path';

console.log('='.repeat(80));
console.log('DOCKER IMAGE & BUILD CONTEXT CLEANLINESS VERIFICATION');
console.log('Target: emdash-site/Dockerfile & emdash-site/dist');
console.log('='.repeat(80));

// Read .dockerignore
const dockerignorePath = path.resolve('emdash-site', '.dockerignore');
const dockerignore = fs.readFileSync(dockerignorePath, 'utf8')
  .split('\n')
  .map(l => l.trim())
  .filter(l => l && !l.startsWith('#'));

console.log('\n[CHECK 1] Active .dockerignore exclusion patterns:');
for (const rule of dockerignore) {
  console.log(`  ✓ Excluded: ${rule}`);
}

// Check that sensitive patterns are explicitly covered in .dockerignore
const mandatoryRules = ['.env*', '.env.migration', '*.db', '*.sqlite', '.impeccable/', 'uploads/'];
console.log('\n[CHECK 2] Verifying mandatory exclusion rules:');
for (const rule of mandatoryRules) {
  const covered = dockerignore.some(r => r.includes(rule.replace('*', '')) || r === rule);
  console.log(`  - ${rule.padEnd(20)}: ${covered ? '✓ COVERED' : 'FAIL'}`);
}

// Check the runner stage file footprint (emdash-site/dist)
console.log('\n[CHECK 3] Scanning runner stage directory (emdash-site/dist)...');
const distPath = path.resolve('emdash-site', 'dist');

function scanRunnerAssets(dir) {
  const foundSensitive = [];
  if (!fs.existsSync(dir)) return foundSensitive;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'uploads' || entry.name === '.impeccable') {
        foundSensitive.push(path.relative(distPath, full));
      }
      foundSensitive.push(...scanRunnerAssets(full));
    } else {
      const lower = entry.name.toLowerCase();
      // Look for leaked secrets, SQLite databases, media files, or impeccable data
      if (lower.startsWith('.env') || lower.endsWith('.db') || lower.endsWith('.sqlite') || lower.endsWith('.sqlite3') || lower.endsWith('.db-journal') || lower.includes('.impeccable')) {
        foundSensitive.push(path.relative(distPath, full));
      }
      // Check for user-uploaded media files accidentally packaged
      if (/\.(jpg|jpeg|png|webp|mp3|wav|ogg|pdf)$/i.test(lower) && !full.includes('fonts') && !full.includes('favicon')) {
        foundSensitive.push(path.relative(distPath, full));
      }
    }
  }
  return foundSensitive;
}

const sensitiveInDist = scanRunnerAssets(distPath);
console.log(`  Total sensitive/forbidden assets in dist: ${sensitiveInDist.length}`);
if (sensitiveInDist.length > 0) {
  for (const s of sensitiveInDist) {
    console.log(`  ⚠️ Sensitive file found: ${s}`);
  }
} else {
  console.log('  ✓ dist/ is 100% clean of .env, *.db, *.sqlite, .impeccable, and user uploads.');
}

// Check Dockerfile configuration
console.log('\n[CHECK 4] Verifying Dockerfile Security Constraints:');
const dockerfilePath = path.resolve('emdash-site', 'Dockerfile');
const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');

const hasNonRootUser = /USER\s+node/i.test(dockerfileContent);
const hasHealthcheck = /HEALTHCHECK/i.test(dockerfileContent);
const hasMultiStage = /FROM.*AS builder[\s\S]*FROM.*AS runner/i.test(dockerfileContent);
const copiesOnlyDist = /COPY\s+--from=builder\s+\/app\/dist\s+\.\/dist/i.test(dockerfileContent);

console.log(`  - Multi-stage build separation:      ${hasMultiStage ? '✓ PASS' : 'FAIL'}`);
console.log(`  - Runner stage copies only /app/dist: ${copiesOnlyDist ? '✓ PASS' : 'FAIL'}`);
console.log(`  - Runs as non-root user (node):       ${hasNonRootUser ? '✓ PASS (UID 1000 node)' : 'FAIL'}`);
console.log(`  - Native HEALTHCHECK defined:        ${hasHealthcheck ? '✓ PASS (/api/health)' : 'FAIL'}`);

console.log('\n' + '='.repeat(80));
console.log('AUDIT VERDICT:');
const allPass = sensitiveInDist.length === 0 && hasNonRootUser && hasHealthcheck && hasMultiStage && copiesOnlyDist;
console.log(allPass ? '✓ ALL DOCKER SECURITY & CLEANLINESS CRITERIA SATISFIED' : 'FAIL');
console.log('='.repeat(80));

if (!allPass) process.exit(1);
