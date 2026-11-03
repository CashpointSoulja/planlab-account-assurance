// Static build: copies site/ plus brand tokens and logo into dist/.
// No bundler, no network, no secrets.
import { cp, rm, mkdir, writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

await rm(dist, { recursive: true, force: true });
await mkdir(join(dist, 'assets'), { recursive: true });
await cp(join(root, 'site'), dist, { recursive: true });
await cp(join(root, 'assets/tokens/tokens.css'), join(dist, 'assets/tokens.css'));
await cp(join(root, 'assets/brand/planlab-logo.svg'), join(dist, 'assets/planlab-logo.svg'));

// Cloudflare Pages response headers (also harmless on other static hosts).
await writeFile(join(dist, '_headers'), `/*
  Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self'; connect-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'
  Referrer-Policy: no-referrer
  X-Content-Type-Options: nosniff
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  X-Robots-Tag: noindex
`);

const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
console.log(`Built ${pkg.name} into dist/`);
