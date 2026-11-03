// Checks that every cited source URL answers with a success status.
// Run from a network that can reach the publishers: npm run check:links
import { ACCOUNTS } from '../site/data/accounts.js';
import { CALL_KIT } from '../site/data/callkit.js';
import { PLANLAB_SECURITY_URL } from '../site/data/judgement.js';

const urls = [...new Set([
  ...ACCOUNTS.flatMap((a) => a.evidence.map((e) => e.url)),
  CALL_KIT.whySource, ...CALL_KIT.productSources, PLANLAB_SECURITY_URL,
])];

let failed = 0;
for (const url of urls) {
  let line;
  try {
    const res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (link check)' }, signal: AbortSignal.timeout(20000) });
    line = `${res.ok ? 'OK  ' : 'FAIL'} ${res.status} ${url}${res.redirected ? ` -> ${res.url}` : ''}`;
    if (!res.ok) failed++;
  } catch (e) {
    failed++;
    line = `FAIL ${e.cause?.code || e.name} ${url}`;
  }
  console.log(line);
}
console.log(`\n${urls.length - failed}/${urls.length} sources answered OK`);
process.exitCode = failed ? 1 : 0;
