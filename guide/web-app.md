# Web app and API pack

Applies when `project_type` is `web-app`, `api` or `mobile-backend`.

### WEB-01  Authorization is checked on the server, per object
**Rule.** Every request that reads or changes data checks, on the server, that this user may touch this specific record.
**Why.** Broken access control is the most common serious web flaw: changing an ID in a URL returns someone else's data.
**Check.** For each endpoint or database rule, try it as a different user and as no user. For Firebase and similar, read the security rules: no collection is open to all authenticated users unless that is intended.
**Fix.** Enforce ownership or role checks in the handler or the database rules, never only in the client.
**Sources.** OWASP Top 10 (Broken Access Control).

### WEB-02  Never build a query or command from input
**Rule.** User input reaches databases, shells, templates and file paths only through parameterized or escaped interfaces.
**Why.** Injection: SQL, command, template and path traversal.
**Check.** Search for string concatenation into queries, `exec`/`system` calls and file paths built from request data.
**Fix.** Use parameterized queries, argument arrays instead of shell strings, and path allowlists.
**Sources.** OWASP Top 10 (Injection).

### WEB-03  Validate input against a schema at the edge
**Rule.** Each endpoint validates type, size and shape of its input and rejects the rest.
**Why.** Unbounded or unexpected input drives injection, mass assignment and resource exhaustion.
**Check.** Handlers parse input through a schema. Request bodies and uploads have size limits.
**Fix.** Add schema validation and explicit field allowlists.
**Sources.** OWASP API Security Top 10.

### WEB-04  Rate limit anything that costs or guesses
**Rule.** Sign-in, password reset, signup, search, uploads and any endpoint that calls a paid API are rate limited.
**Why.** Credential stuffing, enumeration and bill-driven denial of service.
**Check.** Hammer each of those endpoints from one client. Something says no.
**Fix.** Limit at the edge (CDN/WAF) and in the app, keyed by account and by IP.
**Sources.** Wiki: [Rate limiting at every layer](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki/Rate-Limiting-at-Every-Layer)

### WEB-05  Sessions and tokens are hard to steal and short-lived
**Rule.** Session cookies are `HttpOnly`, `Secure` and `SameSite`; tokens expire; sign-out and password change revoke them.
**Why.** Stolen sessions bypass sign-in entirely.
**Check.** Inspect cookie flags and token lifetimes. Confirm a revoked session stops working.
**Fix.** Set the flags, shorten lifetimes, and store tokens out of reach of page scripts.
**Sources.** OWASP Top 10 (Identification and Authentication Failures).

### WEB-06  TLS everywhere and sane security headers
**Rule.** All traffic is HTTPS with HSTS, and responses set a content security policy, `X-Content-Type-Options` and frame protections.
**Why.** Downgrade, content sniffing, clickjacking and a second line against cross-site scripting.
**Check.** Request the site over HTTP and read the response headers.
**Fix.** Redirect to HTTPS, enable HSTS, and add headers at the edge or framework.
**Sources.** OWASP Secure Headers Project.

### WEB-07  Errors tell users little and logs tell you enough
**Rule.** Users never see stack traces or internal details; the system logs sign-ins, access denials and admin actions somewhere an attacker on the box cannot erase.
**Why.** Verbose errors help attackers. Missing logs mean you find out from a customer.
**Check.** Trigger an error in production mode. Confirm security events arrive in a separate log store.
**Fix.** Turn off debug output, centralize logs, and alert on repeated failures.
**Sources.** Wiki: [Logs, SIEM and detection basics](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki/Logs-SIEM-and-Detection-Basics)
