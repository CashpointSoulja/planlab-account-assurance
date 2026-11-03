// Data integrity: the published data must say exactly what the verified research says.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

import { ACCOUNTS, CHECKED, CUSTOMER_STATUS } from '../site/data/accounts.js';
import { CALL_KIT } from '../site/data/callkit.js';
import { ORDER, ACTIONS, PROGRAMMES, LINKS, QUALIFICATION } from '../site/data/judgement.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const raw = JSON.parse(await readFile(join(root, 'research/accounts.json'), 'utf8'));
const rawKit = await readFile(join(root, 'research/CALL-KIT.md'), 'utf8');
const squash = (s) => String(s).replace(/\s+/g, '');

test('checked date and customer status match the research', () => {
  assert.equal(CHECKED, raw.checked);
  assert.equal(squash(CUSTOMER_STATUS), squash(raw.customerStatus));
});

test('every account field matches the research except for spacing', () => {
  assert.equal(ACCOUNTS.length, 5);
  assert.deepEqual(ACCOUNTS.map((a) => a.id), raw.accounts.map((a) => a.id));
  for (const [i, a] of ACCOUNTS.entries()) {
    const r = raw.accounts[i];
    for (const k of ['name', 'seat', 'project', 'priority', 'buyer', 'hypothesis', 'opener', 'overlap']) {
      assert.equal(squash(a[k]), squash(r[k]), `${a.id}.${k}`);
    }
    assert.deepEqual(a.blockers.map(squash), r.blockers.map(squash), `${a.id}.blockers`);
    assert.equal(a.evidence.length, r.evidence.length, `${a.id}.evidence length`);
    a.evidence.forEach((e, j) => {
      const re = r.evidence[j];
      assert.equal(squash(e.text), squash(re.text), `${a.id}.evidence[${j}].text`);
      assert.equal(squash(e.date), squash(re.date), `${a.id}.evidence[${j}].date`);
      assert.equal(e.url, re.url, `${a.id}.evidence[${j}].url`);
    });
  }
});

test('every evidence claim has an https source and a date', () => {
  for (const a of ACCOUNTS) {
    for (const e of a.evidence) {
      assert.match(e.url, /^https:\/\/[^\s]+$/, `${a.id} url`);
      assert.ok(e.date.length > 4, `${a.id} date`);
    }
  }
});

test('every call-kit string appears in the call-kit research except for spacing', () => {
  const src = squash(rawKit);
  const strings = [
    CALL_KIT.disclaimer, ...CALL_KIT.why, CALL_KIT.whySource, ...CALL_KIT.productFit, ...CALL_KIT.productSources,
    CALL_KIT.opening, ...CALL_KIT.discovery, ...CALL_KIT.objections.flatMap((o) => [o.label, o.reply]),
    CALL_KIT.qualificationIntro, ...CALL_KIT.qualification, ...CALL_KIT.qualificationRules,
    CALL_KIT.followUp, CALL_KIT.followUpRules, CALL_KIT.experiment, CALL_KIT.handoff,
  ];
  for (const s of strings) assert.ok(src.includes(squash(s)), `not in CALL-KIT.md: ${s.slice(0, 70)}`);
});

test('qualification questions are taken from the call-kit discovery list', () => {
  const src = squash(rawKit).toLowerCase();
  for (const q of QUALIFICATION) {
    assert.ok(src.includes(squash(q.ask).replace(/\?$/, '').toLowerCase()), q.ask);
    assert.ok(src.includes(squash(q.criterion).toLowerCase()), q.criterion);
  }
  assert.equal(QUALIFICATION.length, 6);
});

test('the judgement layer covers each account exactly once', () => {
  assert.deepEqual([...ORDER].sort(), ACCOUNTS.map((a) => a.id).sort());
  assert.deepEqual(Object.keys(ACTIONS).sort(), [...ORDER].sort());
  for (const l of LINKS) {
    assert.ok(ORDER.includes(l.account), l.account);
    assert.ok(PROGRAMMES.some((p) => p.id === l.programme), l.programme);
  }
  for (const id of ORDER) assert.ok(LINKS.some((l) => l.account === id), `${id} has a programme link`);
});

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

test('published text has no tool attribution, contact details or agent features', async () => {
  const files = [
    ...(await walk(join(root, 'site'))), ...(await walk(join(root, 'docs'))), ...(await walk(join(root, 'research'))),
    join(root, 'README.md'),
  ].filter((f) => /\.(md|html|js|css|json|txt|svg)$/.test(f) && !f.endsWith('OFL-Inter.txt'));
  const banned = [
    /co-authored-by:/i,
    /generated (with|by)\b/i,
    /(written|created|built|made|drafted) (with|by|using) (an? )?(ai|llm|assistant|language model|chatbot)\b/i,
    /\b(ai|llm|model)[- ]generated\b/i,
    /\bpowered by (an? )?(ai|llm|model)\b/i,
    /\b(session|model)[- ]id\b/i,
  ];
  const email = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
  const phone = /(?:\+44\s?|\b0)(?:\d\s?){9,10}\b/;
  for (const f of files) {
    const text = await readFile(f, 'utf8');
    for (const b of banned) assert.ok(!b.test(text), `${f} matches ${b}`);
    assert.ok(!email.test(text), `${f} contains an email address`);
    assert.ok(!phone.test(text), `${f} contains a phone number`);
    if (f.includes('/site/')) assert.ok(!/loopy|ask .* follow-up|project agent/i.test(text), `${f} imitates the product agent`);
  }
});

test('licensed brand fonts are not in the repository', () => {
  const tracked = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' });
  assert.ok(!/haffer/i.test(tracked), 'HafferXH font files must not be tracked');
  assert.ok(!/source-evidence\//.test(tracked), 'raw capture must not be tracked');
});
