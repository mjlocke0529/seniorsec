# The guide

Rules are grouped into packs. A pack is one file of rules about one topic. A project's answers in `seniorsec.json` decide which packs apply, so a brochure site and an internal API get different checks from the same command.

The first seven packs are security. The last three cover ship-readiness: what else should be true before a public site goes live.

## Which packs apply

| Pack | File | Applies when |
|---|---|---|
| core | `core.md` | Always |
| secrets-identity | `secrets-identity.md` | Always |
| web-app | `web-app.md` | `project_type` is `web-app`, `api` or `mobile-backend` |
| wordpress | `wordpress.md` | `project_type` is `wordpress` |
| ai-agents | `ai-agents.md` | `ai.uses_ai` is true, or `project_type` is `ai-agent` |
| cloud-infra | `cloud-infra.md` | Any hosting is detected or declared |
| business | `business.md` | `business.data_handled` lists anything other than `public` |
| seo | `seo.md` | `exposure` is `public` and `project_type` is `web-app`, `static-site` or `wordpress` |
| rendering | `rendering.md` | `project_type` is `web-app` or `static-site` |
| accessibility | `accessibility.md` | `project_type` is `web-app`, `static-site` or `wordpress` |

## Rule format

Every rule has the same five parts so an agent can apply it mechanically.

```
### PACK-NN  Short name
**Rule.** One sentence, stated as what must be true.
**Why.** The attack or failure it prevents.
**Check.** How to tell whether a project meets it.
**Fix.** What to change when it does not.
**Sources.** Links. Framework IDs where they exist.
```

Rule IDs are permanent. A retired rule keeps its ID and is marked `Retired`, so old plans still resolve.

## Changing the guide

Changes come in as pull requests that link an intake note or a primary source. See the Scout role in `AGENTS.md`.

## Adding a pack

1. Add `guide/<name>.md` with rules in the format above and a new ID prefix.
2. Add a row to the table here and a matching line to `PACK_TABLE` in `cli/seniorsec.mjs`.
3. Optional: add source-level checks for the rules that can be detected reliably. A rule with no automated check is still useful; agents and people apply it by hand.
4. Cite at least one foundation source per rule (`sources/README.md`).

Keep packs small. A rule earns its place by being checkable and by preventing a failure that actually happens.
