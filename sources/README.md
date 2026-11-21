# Sources and how they are validated

`registry.json` lists every source. No single source is trusted on its own. This page is the rule for combining them.

## Three tiers

| Tier | What it is for | Can it change the guide or trigger a plan by itself? |
|---|---|---|
| **foundation** | Frameworks and standards that shape the rules (OWASP, NIST, MITRE, CWE, the wiki) | Guide: yes, with a pull request. Plan: no |
| **primary** | Authoritative records about a specific vulnerability (CISA KEV, OSV, GitHub advisories, NVD, vendor advisories, Wordfence for WordPress) | Yes |
| **news** | Reporting and commentary (BleepingComputer, The Hacker News, SANS ISC, Krebs, AI Incident Database) | No. A lead only |

## Validation rules

**To act on a vulnerability** (write a plan):

1. A **primary** source confirms it exists and names affected versions.
2. It **matches the project**: the installed version is in the affected range, or the vulnerable setting is present. "This CVE exists" is not a finding. "This project runs the affected version" is.
3. Where two primary sources disagree, the **vendor advisory** wins on affected versions and the fix; **CISA KEV** wins on urgency.

**To prioritize** what was found:

1. On CISA KEV: exploited now. Use `patch_policy.kev_days`.
2. Not on KEV but high EPSS: likely to be exploited soon. Treat one level above its severity.
3. Otherwise by severity from the advisory, cross-checked against NVD's CVSS when they differ by more than one level.

**To change a rule** in the guide:

1. The rule cites at least one **foundation** source, and a framework ID where one exists (OWASP category, ATLAS technique, CWE, SSDF practice).
2. A rule prompted by news also links the **primary** source that confirmed the underlying fact.
3. A claim found in only one place is written as "reported by X", not as fact, until a second source agrees.

## What each primary source is best at

| Question | Ask |
|---|---|
| Is it being exploited right now? | CISA KEV |
| How likely is exploitation soon? | FIRST EPSS |
| Which package versions are affected and fixed? | OSV, GitHub Advisory Database |
| What is the CVSS vector and the official CVE record? | NVD |
| WordPress core, plugin or theme? | Wordfence Intelligence |
| What does the maker say to do? | The vendor's own advisory |

## Adding a source

Add it to `registry.json` with a tier, a cadence and a one-line `use`. A new **primary** source needs a reason it is authoritative. A vendor blog that sells a product in the same post is **news**, whatever its accuracy.
