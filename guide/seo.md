# SEO pack

Applies when `exposure` is `public` and `project_type` is `web-app`, `static-site` or `wordpress`.

These rules cover what a search engine or AI crawler needs in order to find, understand and show a page. They are engineering checks, not a content strategy.

### SEO-01  Every page has its own descriptive title
**Rule.** Each indexable page sets a unique title that says what that page is.
**Why.** The title is the link people see in results and the strongest on-page signal of topic. A site where every page shares one title competes with itself.
**Check.** `seniorsec check` flags HTML files with no title and framework pages with no metadata on the page or any layout above it. Then list the titles and look for duplicates.
**Fix.** Set a title per page (in Next.js, export `metadata` or `generateMetadata` from the page). Put the specific part first and the site name last.
**Sources.** Google Search Central: title links.

### SEO-02  Every page has a meta description
**Rule.** Each indexable page has a description written for a person deciding whether to click.
**Why.** Without one, the snippet is whatever text the crawler picks.
**Check.** `seniorsec check` flags HTML files with no description. For framework pages, confirm `description` is set in the page's metadata.
**Fix.** Write one or two plain sentences per page. Do not repeat the same description site-wide.
**Sources.** Google Search Central: snippets.

### SEO-03  One canonical URL per page
**Rule.** Each page is reachable at one preferred URL, declares it with a canonical link, and other variants redirect to it.
**Why.** `http`/`https`, `www`/bare, trailing slashes and tracking parameters otherwise split one page into several weaker duplicates.
**Check.** Request the variants; each should return a 301 to the preferred URL. View source for `rel="canonical"`.
**Fix.** Pick one host and scheme, redirect the rest at the edge, and emit a canonical link from the layout.
**Sources.** Google Search Central: canonicalization.

### SEO-04  Sitemap and robots rules exist and agree
**Rule.** The site publishes a sitemap of the pages it wants indexed and a robots file that does not block them, and no staging `noindex` reaches production.
**Why.** A blocked or missing sitemap slows discovery. A leftover `noindex` or `Disallow: /` removes the site from search entirely.
**Check.** `seniorsec check` flags a repo with no sitemap or robots file or route. Then fetch both on production, confirm the sitemap is referenced from robots, and search the built output for `noindex`.
**Fix.** Generate the sitemap from the route list at build time. Make `noindex` depend on the environment, defaulting to off in production.
**Sources.** Google Search Central: sitemaps, robots.txt.

### SEO-05  Structured data where it earns something
**Rule.** Pages that describe a business, product, article, event or FAQ carry matching schema.org markup that validates.
**Why.** It is how search engines and AI assistants read facts such as hours, price and address without guessing.
**Check.** Run the page through a structured-data validator. No errors, and the markup matches the visible content.
**Fix.** Add JSON-LD for the one or two types that fit the page. Do not mark up content that is not on the page.
**Sources.** schema.org · Google Search Central: structured data.

### SEO-06  Share previews are set
**Rule.** Pages set Open Graph title, description and image so links render properly when shared.
**Why.** A bare link in a message or post gets fewer clicks, and the platform picks the image for you.
**Check.** Paste a page URL into a link-preview debugger.
**Fix.** Set `og:title`, `og:description`, `og:image` and `twitter:card` from the same metadata as the title and description.
**Sources.** The Open Graph protocol.
