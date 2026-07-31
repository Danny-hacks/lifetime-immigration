/*
 * Lifetime Immigration — static site build
 *
 * Assembles pages from src/pages/*.html into plain static HTML at the project
 * root, using src/layout.html as the shell and src/partials/*.html for the
 * shared header and footer. Also emits sitemap.xml and robots.txt.
 *
 * No dependencies. Run:  node build.js
 *
 * Page sources begin with a JSON block in an HTML comment:
 *
 *   <!--{
 *     "title": "...",
 *     "description": "...",
 *     "nav": "services",          marks the matching top-level nav item current
 *     "ogImage": "img/x.jpg",     social share image (defaults to the logo)
 *     "priority": "0.8"           optional sitemap priority
 *   }-->
 */
'use strict';

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://www.lifetimeimmigration.com';
const SRC = path.join(__dirname, 'src');
const OUT = __dirname;

const read = p => fs.readFileSync(p, 'utf8');

// --- load partials ---------------------------------------------------------
const partials = {};
for (const file of fs.readdirSync(path.join(SRC, 'partials'))) {
  if (file.endsWith('.html')) {
    partials[path.basename(file, '.html')] = read(path.join(SRC, 'partials', file));
  }
}

const layout = read(path.join(SRC, 'layout.html'));

// --- structured data -------------------------------------------------------
// Organization plus one LocalBusiness per office. Addresses and numbers match
// src/partials/footer.html — keep them in step.
const OFFICES = [
  {
    name: 'Lifetime Immigration — Canada',
    street: '29 Pagebrook Drive',
    locality: 'Etobicoke', region: 'ON', postcode: 'M9P 1P4', country: 'CA',
    phone: '+1-647-223-6314',
  },
  {
    name: 'Lifetime Immigration — Mauritius',
    street: "2nd Floor, Popular Printing Building, 12 Leoville L'Homme Street",
    locality: 'Port Louis', region: '', postcode: '', country: 'MU',
    phone: '+230-5-251-9739',
  },
];

function schemaFor(meta) {
  const graph = [{
    '@type': 'Organization',
    '@id': SITE_URL + '/#organization',
    name: 'Lifetime Immigration',
    url: SITE_URL,
    logo: SITE_URL + '/img/logo.png',
    email: 'info@lifetimeimmigration.com',
    description:
      'Regulated Canadian Immigration Consultants with over 20 years of experience, ' +
      'with offices in Etobicoke, Ontario and Port Louis, Mauritius.',
    sameAs: [
      'https://www.facebook.com/LifetimeImmigration/',
      'https://www.instagram.com/lifetimeimmigration_/',
    ],
  }];

  // The offices only belong on pages that are actually about the business.
  if (meta.localBusiness) {
    OFFICES.forEach((o, i) => {
      graph.push({
        '@type': 'ProfessionalService',
        '@id': SITE_URL + '/#office-' + (i + 1),
        name: o.name,
        parentOrganization: { '@id': SITE_URL + '/#organization' },
        url: SITE_URL + '/contact.html',
        telephone: o.phone,
        email: 'info@lifetimeimmigration.com',
        address: {
          '@type': 'PostalAddress',
          streetAddress: o.street,
          addressLocality: o.locality,
          addressRegion: o.region || undefined,
          postalCode: o.postcode || undefined,
          addressCountry: o.country,
        },
      });
    });
  }

  return '<script type="application/ld+json">' +
    JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }) +
    '</script>\n';
}

// --- helpers ---------------------------------------------------------------
function parseFrontMatter(src, file) {
  const m = src.match(/^\s*<!--(\{[\s\S]*?\})-->\s*/);
  if (!m) throw new Error(`${file}: missing leading <!--{ ... }--> metadata block`);
  try {
    return { meta: JSON.parse(m[1]), body: src.slice(m[0].length) };
  } catch (e) {
    throw new Error(`${file}: metadata is not valid JSON — ${e.message}`);
  }
}

function includePartials(html) {
  return html.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, name) => {
    if (!(name in partials)) throw new Error(`unknown partial: ${name}`);
    return partials[name];
  });
}

// Mark the current top-level nav item. Links opt in with data-nav="key".
function markCurrentNav(html, key) {
  if (!key) return html.replace(/\s*data-nav="[\w-]+"/g, '');
  return html.replace(/<a([^>]*?)\s*data-nav="([\w-]+)"([^>]*?)>/g, (m, a, navKey, c) => {
    if (navKey !== key) return `<a${a.trimEnd()}${c}>`;
    const tag = `<a${a}${c}>`;
    const withClass = /class="/.test(a + c)
      ? tag.replace(/class="/, 'class="is-current ')
      : tag.replace('<a', '<a class="is-current"');
    return withClass.replace('>', ' aria-current="page">');
  });
}

function fill(html, meta) {
  return html.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    meta[key] === undefined ? '' : String(meta[key]));
}

// --- build -----------------------------------------------------------------
const pagesDir = path.join(SRC, 'pages');
const pages = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html')).sort();
const built = [];

for (const file of pages) {
  const { meta, body } = parseFrontMatter(read(path.join(pagesDir, file)), file);

  meta.slug = file === 'index.html' ? '' : file;
  meta.siteUrl = SITE_URL;
  meta.ogImage = meta.ogImage || 'img/logo.png';
  meta.schema = schemaFor(meta);

  let html = layout.replace('{{body}}', () => body);
  html = includePartials(html);
  html = fill(html, meta);
  html = markCurrentNav(html, meta.nav);

  const banner = `<!-- Generated by build.js from src/pages/${file} — do not edit directly -->\n`;
  fs.writeFileSync(path.join(OUT, file), banner + html);
  built.push({ file, priority: meta.priority || (file === 'index.html' ? '1.0' : '0.8') });
  console.log('  ' + file.padEnd(26) + (meta.title || '').slice(0, 54));
}

// --- sitemap + robots ------------------------------------------------------
const today = new Date().toISOString().slice(0, 10);
const sitemap =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  built.map(({ file, priority }) => {
    const loc = SITE_URL + '/' + (file === 'index.html' ? '' : file);
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n` +
           `    <priority>${priority}</priority>\n  </url>`;
  }).join('\n') +
  '\n</urlset>\n';
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sitemap);

fs.writeFileSync(path.join(OUT, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

console.log(`\nBuilt ${built.length} page${built.length === 1 ? '' : 's'}, sitemap.xml, robots.txt.`);
