# Core pack

Applies to every project.

### CORE-01  Know what you run
**Rule.** Every dependency is pinned by a committed lockfile, and the project can list what it ships.
**Why.** You cannot patch what you cannot name. Unpinned installs also let a compromised new release in without review.
**Check.** A lockfile exists for each package manager in use and is committed. CI installs with the frozen/ci mode (`npm ci`, `pip install --require-hashes`, `bundle install --frozen`).
**Fix.** Generate and commit the lockfile. Switch CI to the frozen install command.
**Sources.** OWASP LLM Top 10 2026 and OWASP Top 10 (supply chain categories).

### CORE-02  Patch what is being exploited first
**Rule.** Anything on CISA's Known Exploited Vulnerabilities list that the project runs is fixed inside the project's `patch_policy.kev_days`.
**Why.** A severity score says how bad a bug could be. KEV says attackers are using it now. That is the list to clear first.
**Check.** `seniorsec check` reports no KEV matches. For software outside lockfiles (servers, CMS, plugins), compare versions against the catalog by vendor and product.
**Fix.** Upgrade to the fixed version. If none exists, apply the vendor's mitigation and record an expiry date for it.
**Sources.** https://www.cisa.gov/known-exploited-vulnerabilities-catalog · Wiki: [Threats in plain words](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki/Threats-in-Plain-Words)

### CORE-03  Shrink the attack surface before defending it
**Rule.** Every listening port, public route, admin panel and third-party integration has a named reason to exist; the rest are removed, not hidden.
**Why.** Moving or obscuring a door still leaves a door. Removed surface needs no patching.
**Check.** List what is reachable from the internet. Each entry maps to a feature someone uses.
**Fix.** Delete unused routes, plugins, demo endpoints and open ports. Put admin surfaces behind identity-aware access, not just an unlinked URL.
**Sources.** Wiki: [Attack surface: list it, shrink it, measure it](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki/Attack-Surface-List-Shrink-Measure)

### CORE-04  Assume one piece gets compromised
**Rule.** For each component, the project can state what an attacker reaches from it, and that reach is deliberately limited.
**Why.** Prevention fails eventually. Blast radius decides whether a failure is an incident or a catastrophe.
**Check.** Pick the web tier, a CI token and a developer laptop. For each, write what it can read and change. Flag any that reach production data or deploy rights without need.
**Fix.** Split credentials per component, scope them to the minimum, and separate environments.
**Sources.** Wiki: [Plan for failure](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki/Plan-for-Failure-Blast-Radius-and-Assuming-Breach)

### CORE-05  Backups that have been restored
**Rule.** Data the business cannot lose has a backup that is off the primary system, cannot be altered by the primary system's credentials, and has been restored in a test.
**Why.** Ransomware and mistakes delete backups that the same credentials can reach. An untested backup is a hope.
**Check.** A dated record of the last restore test exists and is recent.
**Fix.** Add an immutable or offline copy and schedule a restore test.
**Sources.** Wiki: [Backups deep dive](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki/Backups-Deep-Dive-3-2-1-1-0-Immutability-and-Restore-Testing)

### CORE-06  CI is production
**Rule.** Build pipelines run with least privilege, pin third-party actions to a commit, and do not expose secrets to code from forks.
**Why.** A pipeline holds deploy credentials. A poisoned action or a pull request from a fork that runs with secrets is a direct path to production.
**Check.** Workflow `permissions` are set explicitly. Third-party actions are pinned by commit SHA. No `pull_request_target` workflow checks out and runs untrusted code.
**Fix.** Add a top-level `permissions: contents: read`, pin actions, and split trusted from untrusted workflows.
**Sources.** Wiki: [Threat frameworks](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki/Threat-Frameworks-STRIDE-ATTACK-ATLAS)
