# Rendering pack

Applies when `project_type` is `web-app` or `static-site`.

Where and when a page is rendered decides what crawlers see, what gets cached, and what ends up in the browser. Several of these are security rules wearing a performance hat.

### RND-01  Content that must be found is in the HTML the server sends
**Rule.** For public pages, the main content and metadata are present in the initial server response, not built only by JavaScript in the browser.
**Why.** Crawlers, link previews and many AI agents read the first response. A page that renders client-side only can look empty to them, and is slower for people.
**Check.** `seniorsec check` flags framework pages marked as fully client-rendered on public sites. Confirm with `curl` or "view source": the headline and body text should be there.
**Fix.** Render the page on the server or at build time and move interactivity into smaller client components.
**Sources.** Google Search Central: JavaScript SEO basics.

### RND-02  Personal data is never prerendered or shared-cached
**Rule.** A response that contains one user's data is rendered per request and marked so no CDN or framework cache serves it to anyone else.
**Why.** Static generation or a shared cache in front of a personalized route shows one person's page to another. This is a data breach caused by a caching setting.
**Check.** List routes that read the session. Each is dynamic, and its response carries `Cache-Control: private` or `no-store`. Request it signed out and as a second user.
**Fix.** Opt those routes out of static rendering and shared caching. Keep shared caches for content that is the same for everyone.
**Sources.** OWASP Top 10:2025 (Broken Access Control, Security Misconfiguration).

### RND-03  No raw HTML from untrusted input
**Rule.** Text from users, third parties or a model is never inserted into the page as HTML unless it has passed through a sanitizer.
**Why.** Cross-site scripting. Raw-HTML escape hatches bypass the escaping that frameworks do by default.
**Check.** `seniorsec check` lists uses of `dangerouslySetInnerHTML`, `v-html`, `{@html}`, `innerHTML` and `document.write`. For each, trace where the value comes from.
**Fix.** Render as text. Where HTML is required (rich text, markdown), sanitize with a maintained library on the server and keep a content security policy as a second layer.
**Sources.** OWASP Top 10:2025 (Injection) · CWE-79 · see also WEB-02 and AI-04.

### RND-04  Server secrets never reach the browser bundle
**Rule.** Only values meant to be public use a public environment prefix (`NEXT_PUBLIC_`, `VITE_`, `REACT_APP_`, `PUBLIC_`), and server-only modules are not imported into client code.
**Why.** Anything with those prefixes is compiled into JavaScript that every visitor downloads.
**Check.** `seniorsec check` flags public-prefixed variables with secret-sounding names. Also search the built bundle for key patterns.
**Fix.** Rename the variable without the public prefix, move the call that needs it to the server, and rotate the secret if it was ever deployed.
**Sources.** See also SEC-01.

### RND-05  Missing and broken pages return honest status codes
**Rule.** An unknown URL returns 404, a server failure returns 5xx, and both show a helpful page without internal details.
**Why.** A "not found" page served with 200 gets indexed as content. A stack trace on an error page helps attackers.
**Check.** Request a nonsense URL and read the status code. Trigger an error in production mode.
**Fix.** Add framework-level not-found and error pages and confirm the status codes after deploy.
**Sources.** Google Search Central: soft 404 errors · see also WEB-07.
