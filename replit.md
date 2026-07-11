# MJP Security Website

## Overview
A static marketing website for MJP Security, a Cape Town community armed-response
security company. Covers installations, monitoring, armed response, CCTV, and
access control services.

## Tech stack
- Plain HTML (`index.html`), CSS (`styles.css`), and vanilla JavaScript (`script.js`).
- No build tooling, package manager, or backend — just static assets.
- External assets loaded via CDN: Google Fonts (Barlow / Barlow Condensed) and
  Font Awesome icons.

## Running the site
The "Start application" workflow serves the static files with `npx serve -l 5000 .`
on port 5000 (webview). No build step is required — edits to `index.html`,
`styles.css`, or `script.js` take effect on browser refresh; restart the
workflow only if it stops.

## User preferences
- Working on this project to improve UI/UX design and polish.
