// scripts/indexnow/setup-key.mjs
// Generate an IndexNow key and place {key}.txt into the project's public/ (or dist/) root.
// Usage:
//   node scripts/indexnow/setup-key.mjs                  -> generates a random key and writes public/{key}.txt
//   node scripts/indexnow/setup-key.mjs --key abc123     -> uses given key string
//   node scripts/indexnow/setup-key.mjs --out dist       -> write into dist/ instead of public/
// Notes:
//   - File name must be {KEY}.txt
//   - File CONTENT must be exactly the key string (no spaces/newlines)

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function arg(k, d=null) {
  const i = process.argv.indexOf(`--${k}`);
  if (i>=0 && process.argv[i+1]) return process.argv[i+1];
  return d;
}

const outDir = arg('out', fs.existsSync('public') ? 'public' : 'dist');
let key = arg('key', '');
if (!key) key = crypto.randomBytes(16).toString('hex'); // 32-char hex

const file = path.join(outDir, `${key}.txt`);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(file, key, 'utf8');

console.log(`[setup-key] wrote ${file}`);
console.log(`[setup-key] export INDEXNOW_KEY=${key}`);
