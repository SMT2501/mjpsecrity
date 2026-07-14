'use strict';

const path = require('path');
const fs = require('fs');
const express = require('express');
const compression = require('compression');
const nodemailer = require('nodemailer');

const site = require('./data/site');
const services = require('./data/services');

const app = express();
const PORT = process.env.PORT || 5000;
const LEADS_LOG = path.join(__dirname, 'data', 'leads.jsonl');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Cache-busting token for static assets so browser caches never serve a
// stale stylesheet/script after a deploy — appended as a query string.
app.locals.assetVersion = Date.now();

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static assets — long cache for fingerprint-free assets is not safe here since
// filenames don't change on edit, so use a short cache that still helps repeat views.
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d',
    etag: true,
}));

function siteUrl(req, pathname) {
    return `${req.protocol}://${req.get('host')}${pathname}`;
}

function localBusinessSchema(req) {
    return JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SecurityService',
        name: 'MJP Security',
        description: "Cape Town's trusted armed response, guarding, CCTV, monitoring, and security training specialists.",
        image: siteUrl(req, '/images/hero-armed-response.jpg'),
        telephone: site.phoneHref,
        email: site.email,
        url: siteUrl(req, '/'),
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Unit 9 Labella Park',
            addressLocality: 'Stikland Industrial, Cape Town',
            postalCode: '7530',
            addressCountry: 'ZA',
        },
        areaServed: 'Cape Town, South Africa',
        openingHours: 'Mo-Su 00:00-24:00',
        sameAs: [site.facebook],
    });
}

// ---- Mailer setup (only active once SMTP secrets are provided) ----
let transporter = null;
const smtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
if (smtpConfigured) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
} else {
    console.warn(
        '[mail] SMTP credentials are not configured — contact form leads will be saved to data/leads.jsonl ' +
        'but will NOT be emailed until SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM are set.'
    );
}

// ---- Page routes ----
app.get('/', (req, res) => {
    res.render('home', {
        title: 'MJP Security | Your Community Armed Response Service',
        description: "MJP Security - Cape Town's trusted community armed response, CCTV, monitoring, installations and access control specialists.",
        canonicalUrl: siteUrl(req, '/'),
        ogImage: siteUrl(req, '/images/hero-armed-response.jpg'),
        structuredData: localBusinessSchema(req),
        site,
        services,
    });
});

app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About Us | MJP Security',
        description: 'MJP Security is a Cape Town-based, PSIRA-registered armed response company committed to safer homes, businesses, and neighbourhoods.',
        canonicalUrl: siteUrl(req, '/about'),
        ogImage: siteUrl(req, '/images/about-team.jpg'),
        structuredData: localBusinessSchema(req),
        site,
    });
});

app.get('/services', (req, res) => {
    res.render('services', {
        title: 'Our Services | MJP Security',
        description: 'Guarding, armed response, CCTV, monitoring, electric fencing, VIP protection, and security training — complete security solutions from MJP Security in Cape Town.',
        canonicalUrl: siteUrl(req, '/services'),
        ogImage: siteUrl(req, '/images/hero-armed-response.jpg'),
        structuredData: localBusinessSchema(req),
        site,
        services,
    });
});

app.get('/services/:slug', (req, res, next) => {
    const service = services.find((s) => s.slug === req.params.slug);
    if (!service) return next();

    res.render('service-detail', {
        title: `${service.name} | MJP Security`,
        description: service.metaDescription,
        canonicalUrl: siteUrl(req, `/services/${service.slug}`),
        ogImage: siteUrl(req, `/images/${service.image}.jpg`),
        structuredData: localBusinessSchema(req),
        site,
        service,
        allServices: services,
    });
});

app.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Contact Us | MJP Security',
        description: 'Get in touch with MJP Security for a free consultation and quote. Call, WhatsApp, or send us your details and we will call you back.',
        canonicalUrl: siteUrl(req, '/contact'),
        ogImage: siteUrl(req, '/images/hero-armed-response.jpg'),
        structuredData: localBusinessSchema(req),
        site,
    });
});

// ---- Contact form submission ----
app.post('/api/contact', async (req, res) => {
    const { firstName, lastName, email, phone, company, service, message } = req.body || {};

    if (!firstName || !lastName || !email || !phone) {
        return res.status(400).json({ ok: false, error: 'Missing required fields.' });
    }

    const lead = {
        firstName,
        lastName,
        email,
        phone,
        company: company || '',
        service: service || '',
        message: message || '',
        receivedAt: new Date().toISOString(),
    };

    // Always persist the lead locally so nothing is lost, even before email is wired up.
    try {
        fs.appendFileSync(LEADS_LOG, JSON.stringify(lead) + '\n');
    } catch (err) {
        console.error('[leads] failed to write lead log:', err.message);
    }

    if (transporter) {
        try {
            await transporter.sendMail({
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                to: site.email,
                replyTo: email,
                subject: `New quote request from ${firstName} ${lastName}${service ? ' — ' + service : ''}`,
                text:
`New contact/quote request from the MJP Security website:

Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone}
Company: ${company || '—'}
Service of interest: ${service || '—'}

Message:
${message || '—'}
`,
            });
        } catch (err) {
            console.error('[mail] failed to send lead email:', err.message);
            return res.status(200).json({ ok: true, warning: 'saved-not-emailed' });
        }
    }

    res.json({ ok: true });
});

// ---- SEO: robots.txt & sitemap.xml ----
app.get('/robots.txt', (req, res) => {
    res.type('text/plain').send(
`User-agent: *
Allow: /

Sitemap: ${siteUrl(req, '/sitemap.xml')}
`
    );
});

app.get('/sitemap.xml', (req, res) => {
    const staticPaths = ['/', '/about', '/services', '/contact'];
    const servicePaths = services.map((s) => `/services/${s.slug}`);
    const urls = [...staticPaths, ...servicePaths];

    const body = urls
        .map((p) => `  <url><loc>${siteUrl(req, p)}</loc></url>`)
        .join('\n');

    res.type('application/xml').send(
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`
    );
});

// ---- 404 ----
app.use((req, res) => {
    res.status(404).render('404', {
        canonicalUrl: siteUrl(req, req.originalUrl),
        ogImage: siteUrl(req, '/images/hero-armed-response.jpg'),
        site,
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`MJP Security site running on port ${PORT}`);
});
