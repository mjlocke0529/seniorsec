# Changelog

Guide changes, source changes and tool changes are all recorded here, newest first.

## 0.3.0 — 2026-11-21

**Guide**
- Three ship-readiness packs: seo (6 rules), rendering (5), accessibility (5). 10 packs and 63 rules in total.
- `guide/README.md` explains what a pack is and how to add one.

**Tool**
- `check` selects the new packs from the profile and runs source-level checks for them: missing titles, descriptions and metadata; missing sitemap or robots; fully client-rendered public pages; raw-HTML sinks; secret-sounding variables behind a public prefix; missing `lang`; images without `alt`.
- These checks read source only. The report says so and points to a browser audit for the rest.

**Skills**
- `skills/seniorsec-check`, `skills/seniorsec-plan`, `skills/seniorsec-patch` in the SKILL.md format, for adding to an agent's workflow.

**Sources**
- 3 added (25 total): Google Search Central, WCAG 2.2, schema.org.

**Known gaps (added)**
- No performance pack yet. Core Web Vitals need a browser; the plan is to wrap Lighthouse rather than rebuild it.
- App Router detection covers Next.js only. Other frameworks get the HTML, raw-HTML and public-prefix checks.
- Skills have been written but not yet exercised in a live agent.

## 0.2.0 — 2026-11-21

**Docs**
- README: animated demo and a three-step screenshot guide; new sections on why to use it, what ongoing use looks like, how it differs from scanners and checklists, and how sources are validated.
- `sources/README.md`: the rules for confirming, prioritizing and citing.

**Sources**
- 11 added (22 total): OWASP Top 10:2025, OWASP ASVS, NIST SSDF and its generative-AI profile, CWE Top 25, OpenSSF Scorecard, NVD, FIRST EPSS, CISA advisories, Wordfence Intelligence, AI Incident Database.

**Tool**
- `check` prints a compact summary on a terminal and whenever `--out` is used; `--markdown` and `--summary` force one or the other.
- Example profile made vendor-neutral.

**Known gaps (added)**
- EPSS, NVD and Wordfence are documented as sources but `check` does not query them yet.

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
