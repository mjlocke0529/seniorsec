# Writing your `seniorsec.json`

`seniorsec.json` lives in the root of your project. It tells an agent what your project is, so it can pick the right rules and match advisories to you. Think of it as `package.json` for security context.

Run `seniorsec init` to create it. The tool fills in the **detected** half. You fill in the **declared** half once and update it when the business changes.

## What does not go in it

- **Dependency versions.** They live in your lockfiles. The profile lists the lockfile paths and `check` reads them fresh each run.
- **Secrets.** No keys, tokens, passwords or internal hostnames. This file is committed.
- **Anything you would not want public** if your repo is public. Describe data by category ("student records"), not by detail.

## The detected half

Written by `init`. Re-run `init` any time; it refreshes this half and leaves your declared answers alone.

| Field | Meaning |
|---|---|
| `detected.languages` | Languages found from manifests |
| `detected.frameworks` | Frameworks and notable libraries found in manifests |
| `detected.manifests` | Manifest and lockfile paths `check` should read |
| `detected.hosting` | Hosting and infrastructure config found (Firebase, Vercel, Docker, Terraform…) |
| `detected.ci` | CI systems found |
| `detected.ai` | AI SDKs, MCP configs and agent instruction files found |
| `detected.generated_at` | When `init` last ran |

If detection is wrong, do not edit this half by hand. Add the correction under `declared.overrides` so it survives the next `init`.

## The declared half

### `project_type` (required)

One of: `web-app`, `api`, `mobile-backend`, `wordpress`, `static-site`, `ai-agent`, `library`, `infrastructure`.

Pick what the project mostly is. This selects rule packs (see `guide/README.md`).

### `exposure` (required)

`public` (anyone on the internet), `authenticated` (public sign-in page, content behind it), or `internal` (private network only).

### `business` (required)

| Field | What to write |
|---|---|
| `type` | Plain words: "fire protection contractor", "K-12 school", "online store" |
| `data_handled` | Any of: `public`, `personal`, `payment-card`, `health`, `student-records`, `children-under-13`, `cui`, `financial`, `credentials`, `other` |
| `compliance` | Frameworks you are subject to, if known: `PCI-DSS`, `HIPAA`, `FERPA`, `COPPA`, `CMMC-L1`, `CMMC-L2`, `NIST-800-171`, `SOC2`, `GDPR`. Leave empty if unsure; the business pack will prompt the question |
| `critical_vendors` | Third parties that hold your data or can change your systems |

### `ai` (required if you use AI at all)

| Field | What to write |
|---|---|
| `uses_ai` | `true` if the product calls a model or agents work on the repo |
| `models` | Providers or models used |
| `tools` | What a model can do: "read database", "send email", "run shell" |
| `mcp_servers` | MCP servers the project connects |
| `data_in_context` | Categories of data the model can see, same vocabulary as `data_handled` |
| `human_approval_for` | Actions that need a person to approve |

The most useful answer here is `tools`. It is what the AI rule pack uses to judge blast radius.

### `patch_policy` (required)

| Field | What to write |
|---|---|
| `approver` | Role or handle of who approves a patch plan |
| `kev_days` | Days allowed to fix something on the exploited list |
| `critical_days`, `high_days` | Days allowed by severity |
| `auto_merge` | `none`, or `patch-level-dev-deps` if you allow low-risk auto merges |

If you have no policy yet, start with 7 / 14 / 30.

### `overrides` (optional)

Corrections to detection, and rules you have deliberately accepted:

```json
"overrides": {
  "extra_manifests": ["services/api/requirements.txt"],
  "accepted_rules": [
    { "id": "WP-07", "reason": "Site needs member login", "until": "2027-06-01" }
  ]
}
```

An accepted rule needs a reason and an end date. `check` reports it again after that date.

## By project type: what matters most

- **WordPress site.** Lockfiles will not show your plugins. List them under `overrides.wordpress` (`core`, `php`, `plugins`, `themes` with versions) or export from `wp plugin list --format=json`. This is the one case where versions belong in the profile, because nothing else in the repo records them.
- **Firebase or similar backend-as-a-service app.** Make sure the rules files (`firestore.rules`, `storage.rules`) are in the repo so they can be reviewed.
- **AI agent or AI feature.** Spend your time on `ai.tools` and `ai.human_approval_for`.
- **Static site.** Mostly `core`, `secrets-identity` and the email-spoofing rule in `cloud-infra`.

## Keeping it current

Update the declared half when you add a kind of data, a vendor, an AI capability, or a compliance obligation. The scheduled workflow re-runs detection for you.
