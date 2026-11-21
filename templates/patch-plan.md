# Patch plan: <short title>

| Field | Value |
|---|---|
| Plan ID | `YYYY-MM-DD-<project>-<slug>` |
| Project | `<repo>` |
| Status | `draft` / `approved` / `done` / `rejected` |
| Severity | `kev` / `critical` / `high` / `medium` / `low` |
| Deadline | `YYYY-MM-DD` (from the project's `patch_policy`) |
| Rules | `<RULE-ID>, <RULE-ID>` |
| Approver | `<from patch_policy.approver>` |

## Summary

Two or three sentences a non-engineer can read: what is wrong, what could happen, what this plan changes.

## Evidence

- What was found, where (file and line, package and version, or setting).
- Primary source link (vendor advisory, KEV entry, OSV/GHSA ID).
- How it was confirmed to affect this project, not just to exist.

## Decision

`patch` / `mitigate` / `accept`, with one line of reasoning. A mitigation has an expiry date. An acceptance names who accepted the risk.

## Implementation steps

Branch: `seniorsec/<plan-id>`

Each step is atomic. A worker does them in order and stops at the first failed verification.

### Step 1: <imperative title>
- **Change:** the exact file edit or command.
- **Verify:** a command and the output that means success.
- **Rollback:** how to undo this step alone.

### Step 2: <imperative title>
- **Change:**
- **Verify:**
- **Rollback:**

## Done when

One check that proves the finding is closed, for example: `seniorsec check` no longer reports `<ID>`, and the test suite passes.

## Not verified

What the planner could not confirm and a person or the worker should check.
