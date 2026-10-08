#!/usr/bin/env node
/**
 * Font integrity guard.
 *
 * The Silas Radio design source (Colorlib "DJoz") ships seven WOFF files that
 * must be reproduced byte-for-byte in public/fonts/. This script re-hashes them
 * against the values recorded in DESIGN-INSPECTION.md §4.
 *
 *   node scripts/verify-fonts.mjs           # report
 *   node scripts/verify-fonts.mjs --strict  # exit 1 on any mismatch
 */
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** @type {Record<string, { bytes: number, sha256: string, family: string }>} */
const EXPECTED = {
  'Now-Thin.woff': { bytes: 19260, family: "'Now Thin'", sha256: '3e8a3515b9ad3d4f9c6ee83c42335e4dddca1bee2fe888192871457540bf11ff' },
  'Now-Light.woff': { bytes: 19560, family: "'Now Light'", sha256: '88b22aed1437566fe8cb1a94036e9a45bf65b94859e0140033a4c75ab74d3c7d' },
  'Now-Regular.woff': { bytes: 19652, family: "'Now Regular'", sha256: 'd71c433c59cfea5290738e562bee4bdfd4c546267a4d65cd9f7550af91531a88' },
  'Now-Medium.woff': { bytes: 19872, family: "'Now Medium'", sha256: 'd6c617f85f63b61a3832330e6902b0a1a3a6635f67fc32491c00f4a93b5f1214' },
  'Now-Bold.woff': { bytes: 19980, family: "'Now Bold'", sha256: '9c7bfc456cb67cd13a7bfaf29df2440cb762ee462aad032268fc64fc6642e5fc' },
  'Now-Black.woff': { bytes: 19948, family: "'Now Black'", sha256: '0064e3c2b5c6e79f1c20e9f44a39fd951608eee46e9462a6a1ccf3dc67e73c69' },
  'Rockville Solid.woff': { bytes: 187052, family: "'Rockville Solid Regular'", sha256: '203667f2092abfd06c3d3c86078a9b9a9ea8368ce7158726996e37726c3b1cb8' },
};

const strict = process.argv.includes('--strict');
let failures = 0;

console.log('Silas Radio 91.7 — font integrity check (7 files)\n');
for (const [file, expect] of Object.entries(EXPECTED)) {
  const abs = join(root, 'public', 'fonts', file);
  if (!existsSync(abs)) {
    console.log(`  MISSING  ${file}`);
    failures++;
    continue;
  }
  const buf = readFileSync(abs);
  const sha = createHash('sha256').update(buf).digest('hex');
  const okBytes = buf.byteLength === expect.bytes;
  const okSha = sha === expect.sha256;
  if (okBytes && okSha) {
    console.log(`  OK       ${file.padEnd(22)} ${buf.byteLength} bytes  ${sha.slice(0, 16)}…  ${expect.family}`);
  } else {
    console.log(`  MISMATCH ${file} — bytes ${buf.byteLength}/${expect.bytes}, sha ${sha.slice(0, 16)}…/${expect.sha256.slice(0, 16)}…`);
    failures++;
  }
}
console.log(failures === 0 ? '\nAll 7 design-source fonts reproduced exactly.' : `\n${failures} font file(s) diverged from the design source.`);
if (strict && failures > 0) process.exit(1);
