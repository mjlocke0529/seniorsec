# Changelog

Guide changes, source changes and tool changes are all recorded here, newest first.

## 0.1.0 — 2026-11-21

Initial scaffold.

**Guide**
- Seven rule packs: core (6 rules), secrets-identity (5), web-app (7), wordpress (7), ai-agents (9), cloud-infra (7), business (6).

**Sources**
- Registry of 11 sources in three tiers: foundation, primary, news.
- Index of the Clouds Against Humanity wiki pages that back each pack.

**Tool**
- `init`: detects languages, frameworks, manifests and lockfiles, hosting, CI and AI tooling; preserves declared answers on re-run.
- `check`: selects rule packs; four static checks (CORE-01 lockfiles, SEC-01 un-ignored .env, CORE-06 workflow permissions and unpinned actions, AI-06 agent files without CODEOWNERS); npm lockfile lookup against OSV with CISA KEV cross-reference; draft patch plan output.
- Reusable GitHub Action and example workflow.

**Known gaps**
- `check` reads npm `package-lock.json` only. Yarn, pnpm, Python, Ruby, PHP, Go and Rust lockfiles are detected and reported as not checked.
- WordPress core, plugin and theme versions in `overrides.wordpress` are not yet matched against advisories.
- Scout, Planner and Worker roles are documented but not automated.
- The OSV lookup has been tested against a local mock of the API, not yet against the live service.
