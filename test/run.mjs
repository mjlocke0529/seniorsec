// End-to-end test: builds a throwaway project, serves a mock OSV + KEV, runs init and check.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const CLI = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'cli', 'seniorsec.mjs');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'seniorsec-test-'));
const w = (rel, text) => { fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true }); fs.writeFileSync(path.join(dir, rel), text); };

w('package.json', JSON.stringify({ name: 'fixture', dependencies: { react: '^18.0.0', next: '^14.0.0', '@anthropic-ai/sdk': '^0.30.0', leftpadish: '1.0.0' }, devDependencies: { typescript: '^5.0.0' } }));
w('package-lock.json', JSON.stringify({ lockfileVersion: 3, packages: { '': { name: 'fixture' }, 'node_modules/leftpadish': { version: '1.0.0' }, 'node_modules/safe-pkg': { version: '2.0.0' }, 'node_modules/a/node_modules/nofix': { version: '0.1.0', dev: true } } }));
w('services/api/requirements.txt', 'fastapi==0.110.0\nanthropic>=0.30\n');
w('firebase.json', '{}');
w('AGENTS.md', '# agents\n');
w('.env', 'X=1\n');
w('.github/workflows/ci.yml', 'on: push\njobs:\n  a:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: someone/thing@v1\n');

const VULNS = {
  'GHSA-aaaa': { id: 'GHSA-aaaa', aliases: ['CVE-2026-0001'], summary: 'Bad thing in leftpadish', database_specific: { severity: 'HIGH' }, affected: [{ package: { name: 'leftpadish', ecosystem: 'npm' }, ranges: [{ events: [{ introduced: '0' }, { fixed: '1.0.3' }] }, { events: [{ introduced: '2.0.0' }, { fixed: '2.1.0' }] }] }] },
  'GHSA-bbbb': { id: 'GHSA-bbbb', aliases: ['CVE-2026-0002'], summary: 'No fix yet', database_specific: { severity: 'MODERATE' }, affected: [{ package: { name: 'nofix', ecosystem: 'npm' }, ranges: [{ events: [{ introduced: '0' }] }] }] },
};
const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    res.setHeader('content-type', 'application/json');
    if (req.url === '/v1/querybatch') {
      const q = JSON.parse(body).queries;
      return res.end(JSON.stringify({ results: q.map((x) => (x.package.name === 'leftpadish' ? { vulns: [{ id: 'GHSA-aaaa' }] } : x.package.name === 'nofix' ? { vulns: [{ id: 'GHSA-bbbb' }] } : {})) }));
    }
    if (req.url.startsWith('/v1/vulns/')) return res.end(JSON.stringify(VULNS[req.url.split('/').pop()]));
    if (req.url === '/kev.json') return res.end(JSON.stringify({ vulnerabilities: [{ cveID: 'CVE-2026-0001' }] }));
    res.statusCode = 404; res.end('{}');
  });
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const run = (args, env = {}) => new Promise((resolve) => {
  const p = spawn(process.execPath, [CLI, ...args], { env: { ...process.env, ...env } });
  let out = ''; p.stdout.on('data', (c) => (out += c)); p.stderr.on('data', (c) => (out += c));
  p.on('close', (code) => resolve({ code, out }));
});
const mock = { SENIORSEC_OSV_URL: base, SENIORSEC_KEV_URL: `${base}/kev.json` };
let passed = 0; const ok = (name) => { passed++; console.log(`ok  ${name}`); };

// init
let r = await run(['init', dir]);
assert.equal(r.code, 0, r.out);
let prof = JSON.parse(fs.readFileSync(path.join(dir, 'seniorsec.json'), 'utf8'));
assert.deepEqual(prof.detected.languages, ['JavaScript', 'Python', 'TypeScript']);
assert.ok(prof.detected.frameworks.includes('next') && prof.detected.frameworks.includes('fastapi'));
assert.deepEqual(prof.detected.ai.sdks, ['@anthropic-ai/sdk', 'anthropic']);
assert.deepEqual(prof.detected.ai.agent_files, ['AGENTS.md']);
assert.ok(prof.detected.hosting.includes('Firebase'));
assert.equal(prof.declared.ai.uses_ai, true);
assert.equal(prof.declared.project_type, null);
ok('init detects stack and leaves declared answers for a person');

// declared answers survive a second init
prof.declared.project_type = 'web-app'; prof.declared.exposure = 'public';
prof.declared.business = { type: 'test', data_handled: ['personal'], compliance: [], critical_vendors: [] };
prof.declared.ai.tools = ['read db']; prof.declared.patch_policy.approver = 'owner';
fs.writeFileSync(path.join(dir, 'seniorsec.json'), JSON.stringify(prof));
r = await run(['init', dir]);
prof = JSON.parse(fs.readFileSync(path.join(dir, 'seniorsec.json'), 'utf8'));
assert.equal(prof.declared.project_type, 'web-app');
assert.ok(!/Needs a person/.test(r.out), r.out);
ok('re-running init keeps declared answers');

// packs
r = await run(['packs', dir]);
assert.deepEqual(r.out.trim().split('\n'), ['core', 'secrets-identity', 'web-app', 'ai-agents', 'cloud-infra', 'business']);
ok('pack selection follows the profile');

// check with mock services
r = await run(['check', dir, '--json'], mock);
assert.equal(r.code, 2, r.out);
let j = JSON.parse(r.out);
const dep = (id) => j.findings.find((x) => x.id === id);
assert.equal(dep('GHSA-aaaa').kev, true);
assert.equal(dep('GHSA-aaaa').fixed, '1.0.3');
assert.equal(dep('GHSA-aaaa').severity, 'high');
assert.equal(dep('GHSA-bbbb').fixed, null);
assert.equal(dep('GHSA-bbbb').severity, 'medium');
assert.equal(j.findings[0].id, 'GHSA-aaaa', 'KEV finding sorts first');
const rules = j.findings.filter((x) => x.kind === 'config').map((x) => `${x.rule}:${x.where}`);
assert.ok(rules.includes('SEC-01:.env'), rules.join());
assert.ok(rules.includes('CORE-01:services/api/requirements.txt'), rules.join());
assert.ok(rules.includes('AI-06:AGENTS.md'), rules.join());
assert.equal(j.findings.filter((x) => x.rule === 'CORE-06').length, 2);
assert.ok(j.findings.some((x) => /someone\/thing@v1/.test(x.summary)) && !j.findings.some((x) => /actions\/checkout/.test(x.summary)));
ok('check finds dependency, KEV and config issues');

// markdown plan
r = await run(['check', dir], mock);
assert.match(r.out, /Draft patch plan: dependency upgrades/);
assert.match(r.out, /npm install leftpadish@1\.0\.3/);
assert.match(r.out, /No fixed version is published for GHSA-bbbb/);
assert.match(r.out, /\| kev \| CORE-02 \| leftpadish@1\.0\.0/);
ok('check renders a patch plan');

// unreachable OSV must not look clean
fs.rmSync(path.join(dir, '.env')); fs.rmSync(path.join(dir, '.github'), { recursive: true }); fs.rmSync(path.join(dir, 'AGENTS.md')); fs.rmSync(path.join(dir, 'services'), { recursive: true });
await run(['init', dir]);
r = await run(['check', dir, '--json'], { SENIORSEC_OSV_URL: 'http://127.0.0.1:1', SENIORSEC_KEV_URL: 'http://127.0.0.1:1/k' });
j = JSON.parse(r.out);
assert.equal(r.code, 3, r.out);
assert.ok(j.notVerified.some((n) => /NOT checked/.test(n)));
ok('a failed lookup exits 3 and says what was not checked');

// offline
r = await run(['check', dir, '--offline', '--json']);
assert.equal(r.code, 0, r.out);
ok('offline run on a clean fixture exits 0');

server.close();
fs.rmSync(dir, { recursive: true });
console.log(`\n${passed} tests passed`);
