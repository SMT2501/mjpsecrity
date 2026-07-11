---
name: Stale asset caching masks CSS/image fixes
description: When a screenshot/browser still shows old CSS or an old image after files were fixed and the workflow restarted, suspect the browser's own asset cache before re-debugging layout/CSS.
---

If a static asset (CSS file, image) is served with `Cache-Control: max-age=...`
(common via `express.static({ maxAge })`), a long-lived browser session (e.g.
a screenshot tool's persistent browser profile) can keep serving the OLD
cached bytes for that exact URL indefinitely — even after the file on disk
is fixed and the server process is fully restarted. Restarting the server
does nothing for this; the HTML page URL can be cache-busted with a query
string and still show the bug, because the CSS/image `<link>`/`<img src>`
URL itself is unchanged and reused from cache.

**Why:** Spent a long debugging session convinced a genuine CSS/stacking bug
was hiding a hero image (tried repositioning, z-index, removing `<picture>`,
inline styles, etc.) — the CSS was actually fine (or fine after an
unrelated fix), but the screenshot browser was rendering a stale cached
`styles.css` and a stale cached hero image (from before the file was
replaced), which look identical to a real rendering bug.

**How to apply:** Before assuming a CSS/positioning bug when "the file is
correct on disk but doesn't render," append a cache-busting query
(`?v=<token>`) to the specific asset URL (not just the page URL) and
re-check. If that fixes it, add a server-side cache-busting token (e.g.
`app.locals.assetVersion = Date.now()` appended as `?v=` to stylesheet/image
URLs in templates) so this doesn't recur for real users after future
content/asset updates, especially when a `maxAge` is set on static serving.
