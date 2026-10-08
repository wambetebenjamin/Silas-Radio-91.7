#!/usr/bin/env node
/**
 * Image credit verification.
 *
 * Every photograph shipped in `public/images/**` must have a credit row in
 * `image-credits.md` (and every credit row must point at a file that exists).
 * Runs with zero dependencies: it parses PNG/JPEG headers itself for dimensions.
 *
 * Usage: node scripts/verify-images.mjs [--strict]
 *   default  → warn on divergence, always exit 0
 *   --strict → exit 1 on any divergence (use in CI / before a release)
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, posix } from 'node:path';

const STRICT = process.argv.includes('--strict');
const ROOT = process.cwd();
const IMAGES_DIR = join(ROOT, 'public', 'images');
const CREDITS = join(ROOT, 'image-credits.md');
const EXT = /\.(jpe?g|png|webp|avif)$/i;

/** Dimensions from PNG or JPEG headers — no dependencies. */
function dimensions(file) {
  const buf = readFileSync(file);
  // PNG: IHDR width/height are big-endian uint32s at byte 16
  if (buf.length > 24 && buf.toString('ascii', 1, 4) === 'PNG') {
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20), kind: 'PNG' };
  }
  // JPEG: walk the segment markers to the first SOFn frame header
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset < buf.length - 9) {
      if (buf[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buf[offset + 1];
      const size = buf.readUInt16BE(offset + 2);
      // SOF0/1/2/3, 5..7, 9..11, 13..15 carry the frame dimensions
      if (
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf)
      ) {
        return { h: buf.readUInt16BE(offset + 5), w: buf.readUInt16BE(offset + 7), kind: 'JPEG' };
      }
      offset += 2 + size;
    }
  }
  return null;
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (EXT.test(entry.name)) out.push(full);
  }
  return out;
}

const shipped = walk(IMAGES_DIR).sort();
const credits = readFileSync(CREDITS, 'utf8');

// Credit rows look like: | `presenters/presenter-mary.jpg` | Pexels | https://… |
const credited = new Set();
for (const match of credits.matchAll(/^\|\s*`([^`]+\.(?:jpe?g|png|webp|avif))`/gim)) {
  credited.add(match[1].replace(/^\/+/, ''));
}

const missingCredit = [];
const strayCredit = [];
const rows = [];

for (const file of shipped) {
  const rel = relative(IMAGES_DIR, file).split('\\').join(posix.sep);
  // The generated sprite sheets / icons are tool output, not photography
  const isPhotograph = !/stopmotion-|sprite|pattern|og-|icon/i.test(rel);
  const dim = dimensions(file);
  const sizeKb = Math.round(statSync(file).size / 1024);
  rows.push({ rel, dim, sizeKb, isPhotograph });
  if (isPhotograph && !credited.has(rel)) missingCredit.push(rel);
}

const shippedSet = new Set(shipped.map((f) => relative(IMAGES_DIR, f).split('\\').join(posix.sep)));
for (const rel of credited) if (!shippedSet.has(rel)) strayCredit.push(rel);

console.log('Silas Radio 91.7 — image credit verification\n');
const pad = (v, n) => String(v).padEnd(n);
for (const r of rows) {
  console.log(
    '  ',
    pad(r.rel, 42),
    pad(r.dim ? `${r.dim.w}×${r.dim.h}` : 'unknown', 12),
    pad(`${r.sizeKb} kB`, 10),
    r.isPhotograph ? (credited.has(r.rel) ? 'credited' : 'MISSING CREDIT') : 'generated asset',
  );
}

const totalKb = rows.reduce((sum, r) => sum + r.sizeKb, 0);
const photos = rows.filter((r) => r.isPhotograph).length;
console.log(`\n  ${shipped.length} images (${photos} photographs), ${totalKb} kB total`);
console.log(`  ${credited.size} credit rows in image-credits.md`);

let problems = 0;
if (missingCredit.length) {
  problems += missingCredit.length;
  console.log('\n  ✗ shipped without a credit row:');
  for (const rel of missingCredit) console.log('     -', rel);
}
if (strayCredit.length) {
  problems += strayCredit.length;
  console.log('\n  ✗ credit row points at a missing file:');
  for (const rel of strayCredit) console.log('     -', rel);
}

if (problems === 0) {
  console.log('\nEvery shipped photograph has a credit entry, and every entry resolves. ✓');
} else if (STRICT) {
  console.log(`\n${problems} problem(s) found — failing (--strict).`);
  process.exitCode = 1;
} else {
  console.log(`\n${problems} problem(s) found — pass --strict to fail the run.`);
}
