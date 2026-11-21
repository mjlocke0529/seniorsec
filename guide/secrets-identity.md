# Secrets and identity pack

Applies to every project.

### SEC-01  No secret in the repository, ever
**Rule.** No credential appears in source, history, config committed to the repo, client-side bundles, or CI logs.
**Why.** A pasted value travels: clones, forks, caches, logs, screenshots. Deleting the line does not remove it from history.
**Check.** Run a secret scanner over full history. Confirm push protection is on. Inspect the built client bundle for keys that grant more than public access.
**Fix.** Rotate the exposed secret first, then remove it. Rotation is the fix; removal is cleanup.
**Sources.** Wiki: [Secrets from day one](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki/Secrets-From-Day-One)

### SEC-02  Machines get their own short-lived credentials
**Rule.** Each service, environment and pipeline has its own credential, scoped to what it needs, delivered at run time by a secrets manager.
**Why.** A shared long-lived key makes every holder a path to everything and makes rotation painful enough that nobody does it.
**Check.** No credential is shared between environments or services. `.env` files exist only for local development and are git-ignored.
**Fix.** Move secrets to a manager, issue one credential per consumer, and prefer workload identity (OIDC) to stored keys in CI.
**Sources.** Wiki: [Secrets from day one](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki/Secrets-From-Day-One), [APIs and tokens](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki/APIs-and-Tokens-From-Zero)

### SEC-03  Every secret can be rotated, and has been
**Rule.** For each secret, someone can say how to rotate it and when it was last done.
**Why.** The first rotation should not happen during an incident.
**Check.** A rotation note exists per secret class with a last-rotated date.
**Fix.** Rotate once now to prove the procedure, then schedule it.
**Sources.** Wiki: [Secrets from day one](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki/Secrets-From-Day-One)

### SEC-04  Phishing-resistant sign-in for people with power
**Rule.** Accounts that can deploy, administer, pay or read customer data use a password manager and multi-factor sign-in, preferably passkeys or hardware keys.
**Why.** Most break-ins start with a person's credentials, not a software bug.
**Check.** MFA is enforced (not optional) on the code host, cloud provider, domain registrar, DNS, email and payment accounts.
**Fix.** Turn on enforcement, move admins to passkeys or hardware keys, and remove SMS as a fallback where possible.
**Sources.** Wiki: [Password managers and passkeys](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki/Password-Managers-and-Passkeys-What-Each-Protects-and-Where-They-Fail)

### SEC-05  Access ends when the need ends
**Rule.** People and integrations lose access when they leave or stop needing it.
**Why.** Forgotten accounts and stale tokens are unmonitored doors.
**Check.** Review members, deploy keys, personal access tokens and OAuth apps on the code host and cloud accounts. Each has a current owner.
**Fix.** Remove what has no owner. Set expiry on tokens.
**Sources.** OWASP Top 10 (Broken Access Control).
