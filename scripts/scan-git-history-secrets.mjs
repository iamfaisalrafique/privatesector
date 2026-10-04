import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('='.repeat(80));
console.log('COMPREHENSIVE SECRETS AUDIT OVER FULL GIT HISTORY & WORKING TREE');
console.log('='.repeat(80));

const SECRET_PATTERNS = [
  {
    name: 'PostgreSQL / Database URI with Password',
    regex: /postgres(?:ql)?:\/\/[a-zA-Z0-9_.\-]+:([^@\s\/]+)@[a-zA-Z0-9_.\-]+(?::\d+)?\/[a-zA-Z0-9_.\-]+/i,
    ignore: (m) => m[1] === 'password' || m[1] === 'postgres' || m[1] === 'test' || m[1] === '${password}'
  },
  {
    name: 'AWS Access Key ID',
    regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/,
    ignore: () => false
  },
  {
    name: 'Generic Private Key',
    regex: /-----BEGIN(?: [A-Z]+)? PRIVATE KEY-----/,
    ignore: () => false
  },
  {
    name: 'JSON Web Token (JWT)',
    regex: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
    ignore: () => false
  },
  {
    name: 'GitHub Personal Access Token / PAT',
    regex: /gh[pousr]_[A-Za-z0-9_]{36,}/,
    ignore: () => false
  },
  {
    name: 'Generic API Key / Token Assignment',
    regex: /(?:api[_-]?key|secret[_-]?key|access[_-]?token|auth[_-]?token)\s*[:=]\s*['"][a-zA-Z0-9_\-]{20,}['"]/i,
    ignore: (m) => m[0].includes('test') || m[0].includes('example') || m[0].includes('placeholder')
  }
];

const findings = [];

// 1. Scan Working Tree
console.log('\n[PHASE 1] Scanning entire working tree...');
function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(process.cwd(), fullPath).replace(/\\/g, '/');

    // Skip git folder, node_modules, dist, .astro
    if (entry.isDirectory()) {
      if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.astro' || entry.name === '.impeccable') {
        continue;
      }
      scanDir(fullPath);
    } else if (entry.isFile()) {
      // Skip binary, lockfiles, image files
      if (/\.(jpg|jpeg|png|gif|ico|webp|svg|woff|woff2|ttf|eot|sqlite|db|lock|pdf)$/i.test(entry.name)) {
        continue;
      }
      try {
        const text = fs.readFileSync(fullPath, 'utf8');
        const lines = text.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          for (const pat of SECRET_PATTERNS) {
            const m = line.match(pat.regex);
            if (m && !pat.ignore(m)) {
              findings.push({
                location: 'Working Tree',
                commit: 'UNCOMMITTED / CURRENT',
                file: relPath,
                line: i + 1,
                rule: pat.name
              });
            }
          }
        }
      } catch (e) {
        // Binary or unreadable file
      }
    }
  }
}

scanDir(process.cwd());

// 2. Scan Git Log History across ALL branches
console.log('[PHASE 2] Scanning full git commit history across all branches (--all)...');
const gitLogOutput = execSync('git log --all -p --no-color', { maxBuffer: 100 * 1024 * 1024, encoding: 'utf8' });

const logLines = gitLogOutput.split('\n');
let currentCommit = '';
let currentFile = '';
let currentAuthor = '';
let currentDate = '';

for (let i = 0; i < logLines.length; i++) {
  const line = logLines[i];
  if (line.startsWith('commit ')) {
    currentCommit = line.split(' ')[1].trim();
  } else if (line.startsWith('Author: ')) {
    currentAuthor = line.slice(8).trim();
  } else if (line.startsWith('Date: ')) {
    currentDate = line.slice(6).trim();
  } else if (line.startsWith('diff --git ')) {
    const parts = line.split(' ');
    currentFile = parts[parts.length - 1].replace(/^b\//, '').trim();
  } else if (line.startsWith('+') && !line.startsWith('+++')) {
    // Only check added lines
    const addedContent = line.slice(1);
    for (const pat of SECRET_PATTERNS) {
      const m = addedContent.match(pat.regex);
      if (m && !pat.ignore(m)) {
        findings.push({
          location: 'Git History',
          commit: currentCommit.slice(0, 10),
          file: currentFile,
          rule: pat.name
        });
      }
    }
  }
}

// 3. Deduplicate and report findings
console.log('\n' + '='.repeat(80));
console.log('AUDIT RESULTS (Commit Hash & Filename ONLY - Zero Secrets Printed):');
console.log('='.repeat(80));

const uniqueKey = (f) => `${f.location}:${f.commit}:${f.file}:${f.rule}`;
const dedupedFindings = Array.from(new Map(findings.map(f => [uniqueKey(f), f])).values());

const historyFindings = dedupedFindings.filter(f => f.location === 'Git History');
const workingTreeFindings = dedupedFindings.filter(f => f.location === 'Working Tree');

console.log(`\nWorking Tree Findings: ${workingTreeFindings.length}`);
if (workingTreeFindings.length > 0) {
  console.log('⚠️  Active secrets detected in working tree:');
  for (const f of workingTreeFindings) {
    console.log(`   - [${f.rule}] ${f.file}:${f.line}`);
  }
} else {
  console.log('✓ Zero secrets detected in working tree.');
}

console.log(`\nGit History Findings: ${historyFindings.length}`);
if (historyFindings.length > 0) {
  console.log('⚠️  Historical secrets detected in commit history:');
  const commitMap = {};
  for (const f of historyFindings) {
    if (!commitMap[f.commit]) commitMap[f.commit] = [];
    commitMap[f.commit].push({ file: f.file, rule: f.rule });
  }
  for (const [commit, items] of Object.entries(commitMap)) {
    console.log(`   Commit: ${commit}`);
    for (const it of items) {
      console.log(`     - [${it.rule}] File: ${it.file}`);
    }
  }
} else {
  console.log('✓ Zero secrets detected across all commits in git history.');
}

console.log('\n' + '='.repeat(80));
console.log('SUMMARY & ACTION PLAN:');
console.log(`- Working tree clean: ${workingTreeFindings.length === 0 ? 'YES' : 'NO'}`);
console.log(`- Historical commits with findings: ${Object.keys(historyFindings.reduce((acc, f) => ({...acc, [f.commit]: true}), {})).length}`);
console.log(`- Note: Per user directive, NO history rewrite was performed (user will purge history).`);
console.log('='.repeat(80));
