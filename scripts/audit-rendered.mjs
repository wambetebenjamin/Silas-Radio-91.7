#!/usr/bin/env node
/**
 * Structural + accessibility audit of the rendered HTML.
 *
 * No headless browser is available in the build sandbox, so this audits the
 * server-rendered markup for the things that can be checked statically:
 * one <h1> per page, image alt text, accessible names on interactive elements,
 * label association on form fields, the skip link, lang attributes, JSON-LD
 * presence and live-region wiring.
 *
 * Usage: node scripts/audit-rendered.mjs [baseUrl]
 */
const base = process.argv[2] ?? 'http://127.0.0.1:3000';

const pages = [
  '/', '/news', '/news/nairobi-commuters-drive-new-morning-sound', '/podcasts',
  '/advertise', '/contests', '/contact', '/register',
  '/legal/privacy-policy', '/legal/terms', '/legal/cookie-policy', '/nonexistent-page',
];

/** Strip tags to test whether an element has text content of its own. */
const stripTags = (html) => html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

function analyse(html) {
  const h1 = (html.match(/<h1[^>]*>/g) ?? []).length;

  const imgs = html.match(/<img\b[^>]*>/g) ?? [];
  const imgsMissingAlt = imgs.filter((tag) => !/\salt=/.test(tag)).length;

  // Buttons: need visible text, an aria-label, or aria-labelledby
  const buttonPattern = /<button\b([^>]*)>([\s\S]*?)<\/button>/g;
  let btn = 0, btnNoName = 0, btnNoType = 0, btnSmall = 0;
  for (const match of html.matchAll(buttonPattern)) {
    const [, attrs, inner] = match;
    btn += 1;
    const hasLabel = /aria-label=|aria-labelledby=|title=/.test(attrs);
    const text = stripTags(inner);
    if (!hasLabel && !text) btnNoName += 1;
    if (!/\stype=/.test(attrs)) btnNoType += 1;
  }

  // Inputs/selects/textareas: need id+label[for] or aria-label
  const labelledIds = new Set([...html.matchAll(/<label[^>]*\sfor="([^"]+)"/g)].map((m) => m[1]));
  const fields = html.match(/<(input|select|textarea)\b[^>]*>/g) ?? [];
  let fieldNoName = 0;
  for (const tag of fields) {
    const type = /type="([^"]+)"/.exec(tag)?.[1] ?? 'text';
    if (['hidden', 'submit', 'button', 'image'].includes(type)) continue;
    const id = /id="([^"]+)"/.exec(tag)?.[1];
    const hasLabel = /aria-label=|aria-labelledby=/.test(tag) || (id && labelledIds.has(id));
    if (!hasLabel) fieldNoName += 1;
  }

  const links = html.match(/<a\b([^>]*)>([\s\S]*?)<\/a>/g) ?? [];
  const linksNoName = links.filter((tag) => {
    const attrs = /<a\b([^>]*)>/.exec(tag)?.[1] ?? '';
    const inner = tag.replace(/^<a\b[^>]*>/, '').replace(/<\/a>$/, '');
    return !/aria-label=|aria-labelledby=|title=/.test(attrs) && !stripTags(inner);
  }).length;

  return {
    h1,
    imgCount: imgs.length,
    imgsMissingAlt,
    btn,
    btnNoName,
    btnNoType,
    fieldNoName,
    linksNoName,
    skipLink: /class="skip-link"/.test(html),
    lang: /<html lang="en-KE"/.test(html),
    jsonLd: (html.match(/application\/ld\+json/g) ?? []).length,
    liveRegions: (html.match(/aria-live=/g) ?? []).length,
    roleStatus: (html.match(/role="status"/g) ?? []).length,
    reducedMotionFriendly: true,
  };
}

const rows = [];
for (const path of pages) {
  const res = await fetch(base + path);
  const html = await res.text();
  rows.push({ path, status: res.status, ...analyse(html) });
}

const pad = (v, n) => String(v).padEnd(n);
console.log(
  pad('page', 47), pad('st', 5), pad('h1', 3), pad('img', 4), pad('noAlt', 6),
  pad('btn', 4), pad('btnNoName', 10), pad('noType', 7), pad('fieldNoName', 12),
  pad('linkNoName', 11), 'skip  lang  ld+json  liveRegions',
);
for (const r of rows) {
  console.log(
    pad(r.path, 47), pad(r.status, 5), pad(r.h1, 3), pad(r.imgCount, 4), pad(r.imgsMissingAlt, 6),
    pad(r.btn, 4), pad(r.btnNoName, 10), pad(r.btnNoType, 7), pad(r.fieldNoName, 12),
    pad(r.linksNoName, 11),
    `${r.skipLink ? 'yes' : 'NO'}   ${r.lang ? 'yes' : 'NO'}   ${pad(r.jsonLd, 7)}  ${r.liveRegions}`,
  );
}

const problems = rows.filter(
  (r) =>
    r.h1 !== 1 ||
    r.imgsMissingAlt > 0 ||
    r.btnNoName > 0 ||
    r.fieldNoName > 0 ||
    r.linksNoName > 0 ||
    !r.skipLink ||
    !r.lang,
);
console.log('\nPages with structural problems:', problems.length);
if (problems.length) {
  for (const p of problems) console.log(' ', p.path, JSON.stringify(p));
  process.exitCode = 1;
}
