import fs from 'node:fs';
import path from 'node:path';

const SECRET_PATTERNS = [
  /password\s*[:=]\s*['"][^'"]{4,}['"]/i,
  /api[_-]?key\s*[:=]\s*['"][^'"]{8,}['"]/i,
  /secret\s*[:=]\s*['"][^'"]{8,}['"]/i,
  /bearer\s+[a-zA-Z0-9_\-\.]{20,}/i,
  /ec_pat_[a-zA-Z0-9_\-]{20,}/i,
  /postgres:\/\/[^:]+:[^@]+@/i,
  /mysql:\/\/[^:]+:[^@]+@/i,
  /mongodb(\+srv)?:\/\/[^:]+:[^@]+@/i,
  /-----BEGIN [A-Z ]+ PRIVATE KEY-----/
];

const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'traefik-bin'];
const EXTENSIONS = ['.ts', '.js', '.mjs', '.astro', '.json', '.yaml', '.yml'];

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE_DIRS.includes(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (EXTENSIONS.includes(path.extname(entry.name))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Allow env template or process.env checks
        if (line.includes('process.env') || line.includes('${') || line.includes('example') || line.includes('test_token')) continue;
        for (const pattern of SECRET_PATTERNS) {
          if (pattern.test(line)) {
            console.log(`POTENTIAL SECRET in ${fullPath}:${i + 1}`);
            console.log(`  -> ${line.trim().slice(0, 100)}`);
          }
        }
      }
    }
  }
}

console.log('--- SCANNING REPOSITORY FOR SECRETS ---');
scanDir('./scripts');
scanDir('./emdash-site/src');
scanDir('./docs');
console.log('--- SECRET SCAN COMPLETED ---');
