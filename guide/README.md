# The guide

Rules are grouped into packs. A project's `project_type` and `business` answers in `seniorsec.json` decide which packs apply.

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
