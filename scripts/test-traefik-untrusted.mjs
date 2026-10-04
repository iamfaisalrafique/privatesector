import fs from 'node:fs';
import http from 'node:http';
import { spawn } from 'node:child_process';

const whoami = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ headers: req.headers }, null, 2));
});
await new Promise(r => whoami.listen(9124, '127.0.0.1', r));

// Default config: NO forwardedHeaders or trustedIPs
const traefikDefault = `
entryPoints:
  web:
    address: ":8181"

providers:
  file:
    filename: "./traefik-dyn-default.yaml"

log:
  level: "WARN"
`;

const traefikDyn = `
http:
  routers:
    r:
      rule: "PathPrefix(\`/\`)"
      service: "s"
      entryPoints: ["web"]
  services:
    s:
      loadBalancer:
        servers:
          - url: "http://127.0.0.1:9124"
`;

fs.writeFileSync('./traefik-default.yaml', traefikDefault);
fs.writeFileSync('./traefik-dyn-default.yaml', traefikDyn);

const proc = spawn('.\\traefik-bin\\traefik.exe', ['--configfile=./traefik-default.yaml'], { stdio: 'inherit' });
await new Promise(r => setTimeout(r, 2000));

try {
  const res = await fetch('http://127.0.0.1:8181/whoami', {
    headers: {
      'X-Forwarded-For': '203.0.113.195',
      'CF-Connecting-IP': '198.51.100.77',
      'X-Real-IP': '203.0.113.50'
    }
  });
  const data = await res.json();
  console.log('--- DEFAULT TRAEFIK (NO TRUSTED IPS CONFIGURED) ---');
  console.log(JSON.stringify(data.headers, null, 2));
} finally {
  proc.kill('SIGTERM');
  whoami.close();
  try { fs.unlinkSync('./traefik-default.yaml'); } catch {}
  try { fs.unlinkSync('./traefik-dyn-default.yaml'); } catch {}
}
