# SeniorSec

The senior security engineer every repo should have.

SeniorSec is a security guide written for AI agents, plus a small command-line tool that applies it to a project. It does three things:

1. **Keeps a living guide** (`guide/`) of security rules for designing and building products and businesses, grouped into rule packs by project type.
2. **Watches the outside world** (`sources/`) for exploited vulnerabilities, new advisories and breaking security news, and turns what matters into guide updates.
3. **Produces patch plans** (`plans/`, `templates/`) that a worker agent can execute step by step against a new or existing project.

## Quick start

Run these from the root of the project you want checked. Nothing is installed into your project.

```bash
npx github:mjlocke0529/seniorsec init     # scans the repo, writes seniorsec.json
# answer the "declared" questions in seniorsec.json (see docs/profile-guide.md)
npx github:mjlocke0529/seniorsec check    # findings + a patch plan
```

`init` detects what it can (languages, frameworks, lockfiles, hosting, AI tooling) and leaves the rest for a person to declare: project type, business type, the data you handle, and your patch policy. `check` reads that profile and your lockfiles live, so versions are never copied into the profile and never go stale.

For continuous checking, copy `examples/seniorsec-workflow.yml` into `.github/workflows/` in your project.

## Status

Early scaffold (v0.1). See `CHANGELOG.md` for what works and what is stubbed.

| Piece | State |
|---|---|
| Guide rule packs | First draft, 7 packs |
| Source registry | 11 sources listed |
| `init` | Works for Node, Python, Ruby, PHP/WordPress, Go, Rust detection |
| `check` | npm lockfiles against OSV and CISA KEV; other ecosystems not yet |
| Scout / Planner / Worker roles | Documented in `AGENTS.md`, not automated yet |

## How the repo is laid out

```
AGENTS.md            entry point for any agent working in or with this repo
guide/               the rules, one file per rule pack
sources/             registry of feeds and references, plus the wiki index
intake/              dated findings from the feeds
plans/               patch plans, one per finding per project
templates/           patch plan, worker task and intake note formats
docs/profile-guide.md   how to write seniorsec.json for your project
schema/              JSON Schema for seniorsec.json
cli/                 the init and check commands (zero dependencies)
action/              reusable GitHub Action
examples/            sample profiles and the workflow file
```

## What SeniorSec is not

It is not a scanner replacement, a compliance certification, or a guarantee. It gives an agent a consistent way to reason about security and a consistent format for fixing things. A person approves every guide change and every patch.

## License and attribution

Apache-2.0. Parts of the guide are informed by the [Clouds Against Humanity wiki](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki) by ChiefGyk3D, also Apache-2.0. See `NOTICE`.
