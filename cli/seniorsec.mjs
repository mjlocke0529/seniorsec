#!/usr/bin/env node
// SeniorSec CLI. Zero dependencies on purpose: a security tool should not add to your supply chain.
// Usage: seniorsec <init|check|packs> [dir] [--offline] [--out FILE] [--json]
// Exit codes for check: 0 clean, 1 findings, 2 a finding is on CISA KEV, 3 a check could not run, 64 usage.

import fs from 'node:fs';
import path from 'node:path';

const PROFILE = 'seniorsec.json';
const FORMAT = '0.1';
const OSV_URL = process.env.SENIORSEC_OSV_URL || 'https://api.osv.dev';
const KEV_URLS = (process.env.SENIORSEC_KEV_URL
  ? [process.env.SENIORSEC_KEV_URL]
  : ['https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json',
     'https://raw.githubusercontent.com/cisagov/kev-data/main/known_exploited_vulnerabilities.json']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'vendor', 'dist', 'build', '.next', 'out', 'coverage', '.venv', 'venv', '__pycache__', 'target']);

const MANIFESTS = {
  'package.json': { ecosystem: 'npm', lockfile: false, language: 'JavaScript' },
  'package-lock.json': { ecosystem: 'npm', lockfile: true },
  'npm-shrinkwrap.json': { ecosystem: 'npm', lockfile: true },
  'yarn.lock': { ecosystem: 'npm', lockfile: true },
  'pnpm-lock.yaml': { ecosystem: 'npm', lockfile: true },
  'requirements.txt': { ecosystem: 'PyPI', lockfile: false, language: 'Python' },
  'pyproject.toml': { ecosystem: 'PyPI', lockfile: false, language: 'Python' },
  'poetry.lock': { ecosystem: 'PyPI', lockfile: true },
  'Pipfile.lock': { ecosystem: 'PyPI', lockfile: true },
  'uv.lock': { ecosystem: 'PyPI', lockfile: true },
  'Gemfile': { ecosystem: 'RubyGems', lockfile: false, language: 'Ruby' },
  'Gemfile.lock': { ecosystem: 'RubyGems', lockfile: true },
  'composer.json': { ecosystem: 'Packagist', lockfile: false, language: 'PHP' },
  'composer.lock': { ecosystem: 'Packagist', lockfile: true },
  'go.mod': { ecosystem: 'Go', lockfile: false, language: 'Go' },
  'go.sum': { ecosystem: 'Go', lockfile: true },
  'Cargo.toml': { ecosystem: 'crates.io', lockfile: false, language: 'Rust' },
  'Cargo.lock': { ecosystem: 'crates.io', lockfile: true },
};
const HOSTING = {
  'firebase.json': 'Firebase', 'vercel.json': 'Vercel', 'netlify.toml': 'Netlify', 'Dockerfile': 'Docker',
  'docker-compose.yml': 'Docker Compose', 'compose.yaml': 'Docker Compose', 'fly.toml': 'Fly.io',
  'wrangler.toml': 'Cloudflare Workers', 'app.yaml': 'Google App Engine', 'Procfile': 'Procfile host',
  'render.yaml': 'Render', 'serverless.yml': 'Serverless Framework',
};
const JS_FRAMEWORKS = ['react', 'next', 'vue', 'nuxt', 'svelte', '@sveltejs/kit', 'express', 'fastify', 'koa', '@nestjs/core',
  'firebase', 'firebase-admin', 'firebase-functions', '@supabase/supabase-js', 'prisma', 'mongoose', 'expo', 'react-native', 'electron'];
const JS_AI = ['@anthropic-ai/sdk', '@anthropic-ai/claude-agent-sdk', 'openai', '@google/generative-ai', '@google/genai', 'langchain',
  '@langchain/core', 'ai', '@modelcontextprotocol/sdk', 'llamaindex', '@mistralai/mistralai', 'ollama'];
const PY_FRAMEWORKS = ['django', 'flask', 'fastapi'];
const PY_AI = ['anthropic', 'openai', 'langchain', 'llama-index', 'google-generativeai', 'transformers', 'mcp'];
const AGENT_FILES = ['AGENTS.md', 'CLAUDE.md', '.cursorrules', '.github/copilot-instructions.md', '.windsurfrules'];
const MCP_FILES = ['.mcp.json', 'mcp.json', '.cursor/mcp.json', '.vscode/mcp.json'];

const PACK_TABLE = [
  ['core', () => true],
  ['secrets-identity', () => true],
  ['web-app', (p) => ['web-app', 'api', 'mobile-backend'].includes(p.declared.project_type)],
  ['wordpress', (p) => p.declared.project_type === 'wordpress'],
  ['ai-agents', (p) => p.declared.ai?.uses_ai === true || p.declared.project_type === 'ai-agent'],
  ['cloud-infra', (p) => (p.detected.hosting || []).length > 0 || p.declared.project_type === 'infrastructure'],
  ['business', (p) => (p.declared.business?.data_handled || []).some((d) => d !== 'public')],
];

// ---------- helpers ----------
const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const exists = (f) => fs.existsSync(f);
const uniq = (a) => [...new Set(a)].sort();

function walk(root, maxDepth = 3) {
  const found = [];
  (function go(dir, depth) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isSymbolicLink()) continue;
      if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name) && depth < maxDepth) go(full, depth + 1); }
      else found.push(path.relative(root, full).split(path.sep).join('/'));
    }
  })(root, 0);
  return found;
}

function cmpVersion(a, b) {
  const pa = String(a).split(/[.+-]/), pb = String(b).split(/[.+-]/);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] ?? '0', y = pb[i] ?? '0';
    const nx = /^\d+$/.test(x) ? Number(x) : NaN, ny = /^\d+$/.test(y) ? Number(y) : NaN;
    if (!Number.isNaN(nx) && !Number.isNaN(ny)) { if (nx !== ny) return nx - ny; }
    else if (x !== y) return x < y ? -1 : 1;
  }
  return 0;
}

// ---------- init ----------
function detect(root) {
  const files = walk(root);
  const base = (f) => f.split('/').pop();
  const manifests = [], languages = [], frameworks = [], hosting = [], ci = [], sdks = [];

  for (const f of files) {
    const m = MANIFESTS[base(f)];
    if (m) { manifests.push({ path: f, ecosystem: m.ecosystem, lockfile: m.lockfile }); if (m.language) languages.push(m.language); }
    if (HOSTING[base(f)]) hosting.push(HOSTING[base(f)]);
    if (f.endsWith('.tf')) hosting.push('Terraform/OpenTofu');
    if (base(f) === 'tsconfig.json') languages.push('TypeScript');
    if (f.startsWith('.github/workflows/') && /\.ya?ml$/.test(f)) ci.push('GitHub Actions');
    if (f === '.gitlab-ci.yml') ci.push('GitLab CI');
    if (f.startsWith('.circleci/')) ci.push('CircleCI');
    if (base(f) === 'wp-config.php' || base(f) === 'wp-config-sample.php') { frameworks.push('WordPress'); languages.push('PHP'); }
    if (base(f) === 'firestore.rules' || base(f) === 'storage.rules') hosting.push('Firebase');

    if (base(f) === 'package.json') {
      try {
        const pj = readJson(path.join(root, f));
        const deps = Object.keys({ ...pj.dependencies, ...pj.devDependencies });
        for (const d of deps) { if (JS_FRAMEWORKS.includes(d)) frameworks.push(d); if (JS_AI.includes(d)) sdks.push(d); if (d === 'typescript') languages.push('TypeScript'); }
      } catch { /* unreadable manifest: still listed, just not inspected */ }
    }
    if (base(f) === 'requirements.txt' || base(f) === 'pyproject.toml') {
      const text = fs.readFileSync(path.join(root, f), 'utf8').toLowerCase();
      for (const d of PY_FRAMEWORKS) if (new RegExp(`(^|[\\s"'\\[])${d}([\\s"'=<>~!\\[,]|$)`, 'm').test(text)) frameworks.push(d);
      for (const d of PY_AI) if (new RegExp(`(^|[\\s"'\\[])${d}([\\s"'=<>~!\\[,]|$)`, 'm').test(text)) sdks.push(d);
    }
    if (base(f) === 'Gemfile') {
      const text = fs.readFileSync(path.join(root, f), 'utf8');
      if (/gem\s+['"]rails['"]/.test(text)) frameworks.push('rails');
    }
  }
  return {
    languages: uniq(languages), frameworks: uniq(frameworks),
    manifests: manifests.sort((a, b) => a.path.localeCompare(b.path)),
    hosting: uniq(hosting), ci: uniq(ci),
    ai: { sdks: uniq(sdks), mcp_configs: MCP_FILES.filter((f) => exists(path.join(root, f))), agent_files: AGENT_FILES.filter((f) => exists(path.join(root, f))) },
    generated_at: new Date().toISOString(),
  };
}

function blankDeclared(detected) {
  const aiSeen = detected.ai.sdks.length > 0 || detected.ai.mcp_configs.length > 0;
  return {
    project_type: detected.frameworks.includes('WordPress') ? 'wordpress' : null,
    exposure: null,
    business: { type: null, data_handled: [], compliance: [], critical_vendors: [] },
    ai: { uses_ai: aiSeen ? true : null, models: [], tools: [], mcp_servers: [], data_in_context: [], human_approval_for: [] },
    patch_policy: { approver: null, kev_days: 7, critical_days: 14, high_days: 30, auto_merge: 'none' },
    overrides: {},
  };
}

function profileGaps(p) {
  const d = p.declared || {}, gaps = [];
  if (!d.project_type) gaps.push('declared.project_type');
  if (!d.exposure) gaps.push('declared.exposure');
  if (!d.business?.type) gaps.push('declared.business.type');
  if (!(d.business?.data_handled || []).length) gaps.push('declared.business.data_handled');
  if (d.ai?.uses_ai == null) gaps.push('declared.ai.uses_ai');
  if (d.ai?.uses_ai === true && !(d.ai.tools || []).length) gaps.push('declared.ai.tools');
  if (!d.patch_policy?.approver) gaps.push('declared.patch_policy.approver');
  return gaps;
}

function cmdInit(root) {
  const file = path.join(root, PROFILE);
  const detected = detect(root);
  let declared = blankDeclared(detected), kept = false;
  if (exists(file)) {
    try { const old = readJson(file); if (old.declared) { declared = { ...declared, ...old.declared }; kept = true; } }
    catch { console.error(`Existing ${PROFILE} is not valid JSON. Fix or remove it, then run init again.`); process.exit(64); }
  }
  const profile = { $schema: 'https://raw.githubusercontent.com/mjlocke0529/seniorsec/main/schema/profile.schema.json', seniorsec: FORMAT, detected, declared };
  fs.writeFileSync(file, JSON.stringify(profile, null, 2) + '\n');
  const gaps = profileGaps(profile);
  console.log(`${kept ? 'Refreshed' : 'Wrote'} ${PROFILE}`);
  console.log(`  languages:  ${detected.languages.join(', ') || 'none found'}`);
  console.log(`  frameworks: ${detected.frameworks.join(', ') || 'none found'}`);
  console.log(`  manifests:  ${detected.manifests.length} (${detected.manifests.filter((m) => m.lockfile).length} lockfiles)`);
  console.log(`  hosting:    ${detected.hosting.join(', ') || 'none found'}`);
  console.log(`  AI tooling: ${[...detected.ai.sdks, ...detected.ai.mcp_configs, ...detected.ai.agent_files].join(', ') || 'none found'}`);
  if (gaps.length) { console.log(`\nNeeds a person to answer (${gaps.length}):`); for (const g of gaps) console.log(`  - ${g}`); console.log('See docs/profile-guide.md for what each one means.'); }
}

// ---------- check ----------
function loadProfile(root) {
  const file = path.join(root, PROFILE);
  if (!exists(file)) { console.error(`No ${PROFILE} here. Run: seniorsec init`); process.exit(64); }
  return readJson(file);
}

function npmPackages(lockPath) {
  const lock = readJson(lockPath), out = new Map();
  for (const [key, v] of Object.entries(lock.packages || {})) {
    if (!key || v.link || !v.version) continue;
    const name = v.name || key.slice(key.lastIndexOf('node_modules/') + 'node_modules/'.length);
    out.set(`${name}@${v.version}`, { name, version: v.version, dev: !!v.dev });
  }
  if (!lock.packages) (function v1(deps) { // lockfileVersion 1
    for (const [name, v] of Object.entries(deps || {})) { if (v.version) out.set(`${name}@${v.version}`, { name, version: v.version, dev: !!v.dev }); v1(v.dependencies); }
  })(lock.dependencies);
  return [...out.values()];
}

async function postJson(url, body) {
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`${url} -> HTTP ${r.status}`);
  return r.json();
}
async function getJson(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`${url} -> HTTP ${r.status}`);
  return r.json();
}

async function osvFindings(pkgs, ecosystem) {
  const hits = new Map(); // vulnId -> [pkg]
  for (let i = 0; i < pkgs.length; i += 500) {
    const chunk = pkgs.slice(i, i + 500);
    const res = await postJson(`${OSV_URL}/v1/querybatch`, { queries: chunk.map((p) => ({ package: { name: p.name, ecosystem }, version: p.version })) });
    (res.results || []).forEach((r, j) => { for (const v of r.vulns || []) { if (!hits.has(v.id)) hits.set(v.id, []); hits.get(v.id).push(chunk[j]); } });
  }
  const findings = [], ids = [...hits.keys()];
  for (let i = 0; i < ids.length; i += 10) {
    const details = await Promise.all(ids.slice(i, i + 10).map((id) => getJson(`${OSV_URL}/v1/vulns/${encodeURIComponent(id)}`)));
    for (const d of details) for (const pkg of hits.get(d.id)) {
      const fixed = [];
      for (const a of d.affected || []) if (a.package?.name === pkg.name) for (const rg of a.ranges || []) for (const ev of rg.events || []) if (ev.fixed && cmpVersion(ev.fixed, pkg.version) > 0) fixed.push(ev.fixed);
      // Lowest fixed version above the installed one, preferring the same major line.
      fixed.sort(cmpVersion);
      const major = pkg.version.split('.')[0];
      const sev = String(d.database_specific?.severity || 'unknown').toLowerCase().replace('moderate', 'medium');
      findings.push({ kind: 'dependency', id: d.id, aliases: d.aliases || [], rule: 'CORE-02', package: pkg.name, installed: pkg.version, dev: pkg.dev,
        fixed: fixed.find((f) => f.split('.')[0] === major) || fixed[0] || null, severity: sev, summary: d.summary || '', kev: false,
        source: `https://osv.dev/vulnerability/${d.id}` });
    }
  }
  return findings;
}

async function kevSet() {
  let lastErr;
  for (const u of KEV_URLS) { try { const j = await getJson(u); return new Set((j.vulnerabilities || []).map((v) => v.cveID)); } catch (e) { lastErr = e; } }
  throw lastErr;
}

function localFindings(root, profile) {
  const f = [], d = profile.detected;
  // CORE-01: a manifest with no lockfile beside it
  const dirOf = (p) => (p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '');
  for (const m of d.manifests.filter((x) => !x.lockfile)) {
    if (profile.declared.project_type === 'library') continue;
    if (m.path.endsWith('package.json')) { try { const pj = readJson(path.join(root, m.path)); if (!Object.keys({ ...pj.dependencies, ...pj.devDependencies }).length) continue; } catch { /* fall through */ } }
    if (!d.manifests.some((x) => x.lockfile && x.ecosystem === m.ecosystem && dirOf(x.path) === dirOf(m.path)))
      f.push({ kind: 'config', rule: 'CORE-01', severity: 'medium', where: m.path, summary: `No committed lockfile next to ${m.path}; installs are not pinned.` });
  }
  // SEC-01: .env present but not git-ignored
  const gi = exists(path.join(root, '.gitignore')) ? fs.readFileSync(path.join(root, '.gitignore'), 'utf8') : '';
  for (const env of walk(root, 2).filter((p) => /(^|\/)\.env(\.[\w-]+)?$/.test(p) && !/\.(example|sample|template)$/.test(p))) {
    if (!/^\s*(\*\*\/)?\.env(\*|\.\*)?\s*$/m.test(gi) && !gi.split('\n').map((l) => l.trim()).includes(env))
      f.push({ kind: 'config', rule: 'SEC-01', severity: 'high', where: env, summary: `${env} exists and .gitignore does not exclude it. If it was ever committed, rotate what it holds.` });
  }
  // CORE-06: workflows without explicit permissions, or third-party actions not pinned to a commit
  const wfDir = path.join(root, '.github', 'workflows');
  if (exists(wfDir)) for (const w of fs.readdirSync(wfDir).filter((n) => /\.ya?ml$/.test(n))) {
    const text = fs.readFileSync(path.join(wfDir, w), 'utf8'), where = `.github/workflows/${w}`;
    if (!/^\s*permissions\s*:/m.test(text)) f.push({ kind: 'config', rule: 'CORE-06', severity: 'medium', where, summary: 'Workflow sets no explicit permissions; the token gets the repository default.' });
    const loose = uniq([...text.matchAll(/^\s*-?\s*uses:\s*([^\s#]+)/gm)].map((m) => m[1]).filter((u) => !u.startsWith('./') && !u.startsWith('docker://') && !/^(actions|github)\//.test(u) && !/@[0-9a-f]{40}$/.test(u)));
    if (loose.length) f.push({ kind: 'config', rule: 'CORE-06', severity: 'medium', where, summary: `Third-party actions not pinned to a commit: ${loose.join(', ')}` });
    if (/pull_request_target/.test(text) && /actions\/checkout/.test(text)) f.push({ kind: 'config', rule: 'CORE-06', severity: 'high', where, summary: 'pull_request_target workflow checks out code; confirm it never runs code from the fork with secrets.' });
  }
  // AI-06: agent instruction files with no CODEOWNERS
  if (d.ai?.agent_files?.length && !['CODEOWNERS', '.github/CODEOWNERS', 'docs/CODEOWNERS'].some((c) => exists(path.join(root, c))))
    f.push({ kind: 'config', rule: 'AI-06', severity: 'medium', where: d.ai.agent_files.join(', '), summary: 'Agent instruction files exist but no CODEOWNERS file requires review for them.' });
  return f;
}

const SEV_ORDER = ['kev', 'critical', 'high', 'medium', 'low', 'unknown'];
const sevOf = (x) => (x.kev ? 'kev' : x.severity);
function deadline(policy, sev) {
  const days = { kev: policy.kev_days, critical: policy.critical_days, high: policy.high_days }[sev];
  if (days == null) return 'next scheduled maintenance';
  return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
}

function render(profile, packs, gaps, findings, notVerified) {
  const L = [], pol = profile.declared.patch_policy, today = new Date().toISOString().slice(0, 10);
  L.push(`# SeniorSec check: ${today}`, '');
  L.push(`**Rule packs applied:** ${packs.join(', ')}`, '');
  if (gaps.length) L.push(`**Profile incomplete.** Answer these in ${PROFILE} so the right packs apply: ${gaps.map((g) => '`' + g + '`').join(', ')}`, '');
  if (!findings.length) L.push('No findings from the automated checks.', '');
  else {
    L.push(`## Findings (${findings.length})`, '', '| Severity | Rule | Where | What | Fix by |', '|---|---|---|---|---|');
    for (const x of findings) L.push(`| ${sevOf(x)} | ${x.rule} | ${x.kind === 'dependency' ? `${x.package}@${x.installed}` : x.where} | ${x.kind === 'dependency' ? `${x.id}${x.kev ? ' (on CISA KEV)' : ''}: ${x.summary}` : x.summary} | ${deadline(pol, sevOf(x))} |`);
    L.push('');
    const deps = findings.filter((x) => x.kind === 'dependency');
    if (deps.length) {
      const byPkg = new Map();
      for (const x of deps) { const k = x.package; const cur = byPkg.get(k); if (!cur || (x.fixed && (!cur.fixed || cmpVersion(x.fixed, cur.fixed) > 0))) byPkg.set(k, { ...x, ids: [...(cur?.ids || []), x.id] }); else cur.ids.push(x.id); }
      const worst = SEV_ORDER.find((s) => deps.some((x) => sevOf(x) === s));
      L.push('## Draft patch plan: dependency upgrades', '', '| Field | Value |', '|---|---|', `| Plan ID | \`${today}-dependency-upgrades\` |`, '| Status | `draft` |',
        `| Severity | \`${worst}\` |`, `| Deadline | \`${deadline(pol, worst)}\` |`, '| Rules | `CORE-02` |', `| Approver | \`${pol.approver || 'not set in profile'}\` |`, '',
        '### Implementation steps', '', `Branch: \`seniorsec/${today}-dependency-upgrades\``, '');
      let n = 1;
      for (const [name, x] of byPkg) {
        L.push(`#### Step ${n++}: upgrade ${name}`);
        if (x.fixed) L.push(`- **Change:** \`npm install ${name}@${x.fixed}\` (if it is a transitive dependency, upgrade the parent or add an \`overrides\` entry). Closes ${uniq(x.ids).join(', ')}.`, `- **Verify:** \`npm ls ${name}\` shows no version below ${x.fixed}, and the test suite passes.`);
        else L.push(`- **Change:** No fixed version is published for ${uniq(x.ids).join(', ')}. Read the advisory and apply its mitigation, or replace the package.`, '- **Verify:** State the mitigation and how it was tested.');
        L.push('- **Rollback:** `git checkout -- package.json package-lock.json && npm ci`', '');
      }
      L.push('### Done when', '', '`seniorsec check` reports none of the IDs above and the test suite passes.', '');
    }
  }
  L.push('## Not verified', '');
  for (const n of notVerified) L.push(`- ${n}`);
  L.push('- Rules that need a person or an agent to inspect the running system. This tool only automates part of each pack; read the packs listed above.', '');
  return L.join('\n');
}

async function cmdCheck(root, flags) {
  const profile = loadProfile(root), gaps = profileGaps(profile);
  const packs = PACK_TABLE.filter(([, test]) => test(profile)).map(([n]) => n);
  const findings = localFindings(root, profile), notVerified = [];
  let incomplete = false;

  const extra = (profile.declared.overrides?.extra_manifests || []).map((p) => ({ path: p, ecosystem: 'npm', lockfile: true }));
  const npmLocks = [...profile.detected.manifests, ...extra].filter((m) => /(^|\/)(package-lock|npm-shrinkwrap)\.json$/.test(m.path) && exists(path.join(root, m.path)));
  const otherLocks = profile.detected.manifests.filter((m) => m.lockfile && !npmLocks.includes(m));
  if (otherLocks.length) notVerified.push(`Dependencies in ${otherLocks.map((m) => m.path).join(', ')}: this version only reads npm package-lock files. Run OSV-Scanner on these.`);

  if (flags.offline) notVerified.push('Known-vulnerability lookup skipped (--offline).');
  else if (npmLocks.length) {
    const pkgs = new Map();
    for (const m of npmLocks) for (const p of npmPackages(path.join(root, m.path))) pkgs.set(`${p.name}@${p.version}`, p);
    try {
      const deps = await osvFindings([...pkgs.values()], 'npm');
      try { const kev = await kevSet(); for (const x of deps) x.kev = [x.id, ...x.aliases].some((a) => kev.has(a)); }
      catch (e) { incomplete = true; notVerified.push(`CISA KEV could not be fetched (${e.message}); exploited status unknown.`); }
      findings.push(...deps);
    } catch (e) { incomplete = true; notVerified.push(`OSV lookup failed (${e.message}). ${pkgs.size} npm packages were NOT checked for known vulnerabilities.`); }
  }
  for (const a of profile.declared.overrides?.accepted_rules || []) {
    const live = a.until && a.until >= new Date().toISOString().slice(0, 10);
    if (live) for (let i = findings.length - 1; i >= 0; i--) if (findings[i].rule === a.id && findings[i].kind === 'config') findings.splice(i, 1);
  }
  findings.sort((a, b) => SEV_ORDER.indexOf(sevOf(a)) - SEV_ORDER.indexOf(sevOf(b)));

  const out = flags.json ? JSON.stringify({ packs, gaps, findings, notVerified }, null, 2) : render(profile, packs, gaps, findings, notVerified);
  if (flags.out) { fs.writeFileSync(flags.out, out + '\n'); console.log(`Wrote ${flags.out} (${findings.length} findings)`); } else console.log(out);
  process.exit(findings.some((x) => x.kev) ? 2 : findings.length ? 1 : incomplete ? 3 : 0);
}

// ---------- main ----------
const args = process.argv.slice(2), flags = { offline: false, json: false, out: null }, pos = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--offline') flags.offline = true; else if (args[i] === '--json') flags.json = true;
  else if (args[i] === '--out') flags.out = args[++i]; else pos.push(args[i]);
}
const [cmd, dir = '.'] = pos, root = path.resolve(dir);
if (cmd === 'init') cmdInit(root);
else if (cmd === 'check') await cmdCheck(root, flags);
else if (cmd === 'packs') { const p = loadProfile(root); console.log(PACK_TABLE.filter(([, t]) => t(p)).map(([n]) => n).join('\n')); }
else { console.error('Usage: seniorsec <init|check|packs> [dir] [--offline] [--out FILE] [--json]'); process.exit(64); }
