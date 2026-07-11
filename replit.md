# MJP Security Website

## Overview
A multi-page marketing website for MJP Security, a Cape Town community
armed-response security company. Pages: Home, About, Services overview,
5 service detail pages (Installations, Monitoring, Armed Response, CCTV,
Access Control), and Contact. Preserves the original dark/yellow brand
styling, adds an AI-generated hero image and service photography, sitewide
WhatsApp click-to-chat, a working contact-form backend, GA4 hook, SEO
metadata (sitemap/robots/structured data), and responsive layout. No CMS —
content lives in `data/site.js` and `data/services.js`.

## Tech stack
- Node.js + Express, server-rendered with EJS templates (`views/`).
- Static assets (CSS, images) served from `public/`, cache-controlled with a
  server-generated `assetVersion` query param appended to CSS/image URLs so
  browsers never serve a stale cached copy after content changes.
- Contact form posts to `/api/contact`; leads are appended to
  `data/leads.jsonl`. Email delivery uses Nodemailer but is optional — if
  `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`/`SMTP_FROM` are not set,
  the server logs a warning and still saves the lead to disk (no silent
  failure, no fake success).
- GA4: `gtag.js` snippet only activates if `site.gaMeasurementId` is set in
  `data/site.js` — currently unset (no GA4 ID has been provided yet).

## Running the site
The "Start application" workflow runs `node server.js` on port 5000.
Restart the workflow after editing `server.js`, `data/*.js`, or install
changes; EJS views and CSS are read fresh on each server restart.

## User preferences
- Working on this project to improve UI/UX design and polish.

## Known follow-ups / open items
- SMTP secrets and a GA4 Measurement ID have not been provided — ask the
  user before assuming email delivery or analytics are live.
- CMS/content-editing UI is explicitly out of scope per user request.
