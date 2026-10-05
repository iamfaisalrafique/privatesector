import { execSync } from 'node:child_process';

const cli = 'node ./node_modules/emdash/dist/cli/index.mjs';
const url = 'http://localhost:4321';

function run(cmd) {
  try {
    console.log(`Running: ${cmd}`);
    const out = execSync(cmd, { cwd: 'd:/privatesector/emdash-site', encoding: 'utf-8' });
    console.log(out.trim());
  } catch (err) {
    console.error(`Error: ${err.message}`);
    if (err.stdout) console.log(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
  }
}

// 1. Add fields to jobs
const jobFields = [
  { slug: 'company_name', type: 'string', label: 'Company Name', required: true },
  { slug: 'company_id', type: 'integer', label: 'Company ID', required: false },
  { slug: 'location', type: 'string', label: 'Location', required: false },
  { slug: 'canton', type: 'string', label: 'Canton', required: false },
  { slug: 'employment_type', type: 'string', label: 'Employment Type', required: false },
  { slug: 'experience_level', type: 'string', label: 'Experience Level', required: false },
  { slug: 'department', type: 'string', label: 'Department', required: false },
  { slug: 'apply_url', type: 'string', label: 'Application URL', required: false },
  { slug: 'description', type: 'portableText', label: 'Job Description', required: false },
  { slug: 'deadline', type: 'string', label: 'Application Deadline', required: false },
  { slug: 'legacy_id', type: 'integer', label: 'Legacy ID', required: false }
];

for (const f of jobFields) {
  const reqFlag = f.required ? '--required' : '';
  run(`${cli} schema add-field jobs ${f.slug} --type ${f.type} --label "${f.label}" ${reqFlag} --url ${url}`);
}

// 2. Add legacy_id to other collections
const collections = ['blogs', 'companies', 'interviews', 'briefings'];
for (const col of collections) {
  run(`${cli} schema add-field ${col} legacy_id --type integer --label "Legacy ID" --url ${url}`);
}

console.log('All schema fields added successfully!');
