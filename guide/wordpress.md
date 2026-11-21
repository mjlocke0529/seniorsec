# WordPress pack

Applies when `project_type` is `wordpress`.

Most WordPress compromises come through plugins and themes, weak admin sign-in, or an unpatched runtime, not through WordPress core.

### WP-01  Core, plugins, themes and PHP are current
**Rule.** WordPress core, every plugin, every theme and the PHP version are on supported, patched releases, with automatic security updates on.
**Why.** Plugin flaws are exploited at scale within days of disclosure. An end-of-life PHP gets no fixes.
**Check.** `wp core version`, `wp plugin list`, `wp theme list` and `php -v` against current releases and the PHP supported-versions page. Auto-updates are enabled for minor core releases and plugins.
**Fix.** Update, enable auto-updates, and move to a supported PHP branch.
**Sources.** Wiki: [WordPress and PHP security](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki/WordPress-and-PHP-Security-WAF-and-Static-Sites)

### WP-02  Fewer plugins, all of them maintained
**Rule.** Only plugins and themes in active use are installed, and each has had a release recently from a known author.
**Why.** Deactivated plugins can still be reachable. Abandoned ones never get fixed.
**Check.** List installed plugins and themes; flag inactive ones and any without a recent update.
**Fix.** Delete (not just deactivate) what is unused. Replace abandoned plugins.
**Sources.** Wiki: [WordPress and PHP security](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki/WordPress-and-PHP-Security-WAF-and-Static-Sites)

### WP-03  Lock down the admin
**Rule.** Admin accounts use unique passwords and multi-factor sign-in; `wp-login.php` and `xmlrpc.php` are rate limited or restricted; there is no account named `admin`.
**Why.** Credential stuffing and brute force against the login page are constant.
**Check.** Review the user list and roles. Attempt repeated failed sign-ins and confirm a block.
**Fix.** Enforce MFA for administrators and editors, disable XML-RPC if unused, and limit login attempts at the edge.
**Sources.** Wiki: [WordPress and PHP security](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki/WordPress-and-PHP-Security-WAF-and-Static-Sites)

### WP-04  The web server cannot rewrite the site
**Rule.** File editing from the dashboard is off, the web user cannot write to code directories, and PHP does not execute from the uploads folder.
**Why.** An attacker who gets one admin session or one upload flaw otherwise gets a permanent backdoor.
**Check.** `DISALLOW_FILE_EDIT` is true in `wp-config.php`. A `.php` file placed in `wp-content/uploads` does not run.
**Fix.** Set the constant, tighten ownership and permissions, and block PHP execution in uploads.
**Sources.** Wiki: [WordPress and PHP security](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki/WordPress-and-PHP-Security-WAF-and-Static-Sites)

### WP-05  Least-privilege database and unique keys
**Rule.** The database user has only the privileges WordPress needs on its own database, and the salts and keys in `wp-config.php` are unique to the site.
**Why.** A SQL injection in a plugin should not become control of the whole database server.
**Check.** Inspect the grants for the WordPress database user. Confirm salts are not defaults.
**Fix.** Reduce grants, regenerate salts, and move `wp-config.php` secrets out of the web root where the host allows.
**Sources.** Wiki: [WordPress and PHP security](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki/WordPress-and-PHP-Security-WAF-and-Static-Sites)

### WP-06  Put a WAF and CDN in front, and know its limits
**Rule.** The site sits behind a web application firewall with a managed WordPress ruleset, and the origin accepts traffic only from it.
**Why.** A WAF buys time between disclosure and patching. It does not replace patching, and it does nothing if attackers can reach the origin directly.
**Check.** Requests straight to the origin IP are refused.
**Fix.** Enable the managed ruleset and restrict the origin firewall to the CDN's ranges.
**Sources.** Wiki: [WordPress at scale](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki/WordPress-at-Scale-CDN-WAF-and-CI)

### WP-07  Ask whether it needs to be dynamic
**Rule.** A site that is mostly brochure content is considered for static publishing.
**Why.** A static site has no PHP, no database and no login page to attack.
**Check.** List the features that need server-side code. If the list is a contact form, static plus a form service may do.
**Fix.** Generate static pages from WordPress, or migrate to a static generator.
**Sources.** Wiki: [Static vs dynamic sites](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki/Static-vs-Dynamic-Sites-Hugo-and-WordPress-and-Recon)
