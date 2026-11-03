import { ACCOUNTS, CHECKED } from './data/accounts.js';
import { CALL_KIT } from './data/callkit.js';
import { ORDER, ACTIONS, PROGRAMMES, LINKS, CONCENTRATION, QUALIFICATION, PLANLAB_SECURITY_URL } from './data/judgement.js';

/* ---------------- Helpers ---------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const byId = Object.fromEntries(ACCOUNTS.map((a) => [a.id, a]));
const ordered = ORDER.map((id) => byId[id]);
const rankOf = (id) => ORDER.indexOf(id) + 1;
const BADGE = { nget: 'NG', ssen: 'SS', balfour: 'BB', murphy: 'MU', mgroup: 'MG' };
const SHORT = { nget: 'NGET', ssen: 'SSEN', balfour: 'Balfour Beatty', murphy: 'Murphy', mgroup: 'M Group' };
const VIEWS = ['brief', 'overlap', 'call'];
const FILTERS = ['all', 'evidence', 'hypothesis', 'unknown'];
const CHECKED_LABEL = new Date(CHECKED + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

const PUBLISHERS = {
  'www.ofgem.gov.uk': 'Ofgem',
  'www.nationalgrid.com': 'National Grid',
  'www.ssen-transmission.co.uk': 'SSEN Transmission',
  'www.murphygroup.com': 'Murphy',
  'www.easterngreenlink1.co.uk': 'Eastern Green Link 1',
  'www.scottishpower.com': 'ScottishPower',
  'mgroupltd.com': 'M Group',
  'www.planlab.ai': 'Planlab',
};
const publisher = (url) => PUBLISHERS[new URL(url).hostname] || new URL(url).hostname;
// Readable titles for each source, taken from the words in its URL slug.
const TITLES = {
  'https://www.ofgem.gov.uk/sites/default/files/2025-12/material-scope-change-decision.pdf': 'Material scope change decision (PDF)',
  'https://www.nationalgrid.com/eastern-green-link-4-confirms-ps3bn-supply-chain-boost-support-uk-jobs-energy-security-and-reduce': 'Eastern Green Link 4 confirms £3bn supply chain boost',
  'https://www.ssen-transmission.co.uk/news/news--views/2026/6/ssen-transmission-awards-contract-to-deliver-main-construction-works-for-netherton-hub': 'Contract to deliver main construction works for Netherton Hub',
  'https://www.nationalgrid.com/next-phase-national-grids-electricity-transmission-partnership-boost-overhead-line-capacity': 'Next phase of the Electricity Transmission Partnership: overhead-line capacity',
  'https://www.murphygroup.com/construction-underway-on-subsea-electricity-superhighway/': 'Construction underway on subsea electricity superhighway',
  'https://www.easterngreenlink1.co.uk/news/main-foundation-piling-works-completed': 'Main foundation piling works completed',
  'https://www.scottishpower.com/w/-110m-investment-in-scotlands-grid': "£110m investment in Scotland's grid",
  'https://mgroupltd.com/news-insights/m-group-wins-110-million-scottishpower-contract/': 'M Group wins £110 million ScottishPower contract',
  'https://www.planlab.ai/qsra': 'QSRA',
  'https://www.planlab.ai/scenario-exploration': 'Scenario exploration',
  'https://www.planlab.ai/security': 'Security',
};
const slugTitle = (url) => {
  if (TITLES[url]) return TITLES[url];
  const u = new URL(url);
  const last = u.pathname.split('/').filter(Boolean).pop() || u.hostname;
  const pdf = /\.pdf$/i.test(last);
  const words = decodeURIComponent(last.replace(/\.pdf$/i, '')).replace(/^-+/, '').replace(/[-_]+/g, ' ').trim();
  const t = words.charAt(0).toUpperCase() + words.slice(1);
  return pdf ? `${t} (PDF)` : t;
};

const ICON = {
  doc: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.5h4l2 2v7H3z M7 1.5v2h2"/></svg>',
  ext: '<svg class="ext" viewBox="0 0 10 10" aria-hidden="true"><path d="M4 2H2v6h6V6 M6 2h2v2 M8 2L4.5 5.5"/></svg>',
  chev: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5L5 6.5 8 3.5"/></svg>',
  info: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.2"/><path d="M8 7.2v4 M8 4.8v.1"/></svg>',
};

const chip = (url, label) =>
  `<a class="chip" href="${esc(url)}" target="_blank" rel="noopener noreferrer" data-source="${esc(url)}">${ICON.doc}<span>${esc(label || publisher(url))}</span>${ICON.ext}<span class="sr-only"> (opens in a new tab)</span></a>`;

/* Sources index: one entry per URL, with every claim that cites it. */
const SOURCES = (() => {
  const map = new Map();
  for (const a of ACCOUNTS) {
    for (const e of a.evidence) {
      if (!map.has(e.url)) map.set(e.url, { url: e.url, date: e.date, kind: 'evidence', accounts: [], claims: [] });
      const s = map.get(e.url);
      if (!s.accounts.includes(a.id)) s.accounts.push(a.id);
      s.claims.push({ account: a.id, text: e.text });
    }
  }
  const product = [
    { url: CALL_KIT.productSources[0], note: 'Planlab QSRA page, cited in the call kit for product fit' },
    { url: CALL_KIT.productSources[1], note: 'Planlab scenario exploration page, cited in the call kit for product fit' },
    { url: PLANLAB_SECURITY_URL, note: 'Planlab security page (linked from the site navigation), cited for the security objection' },
  ].map((p) => ({ ...p, date: 'Product page', kind: 'product', accounts: ['nget'], claims: [] }));
  return { evidence: [...map.values()], product };
})();

/* ---------------- Storage (per-viewer convenience only) ---------------- */
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch { /* ignore */ } },
};

/* ---------------- State and routing ---------------- */
const state = { id: ORDER[0], view: 'brief', filter: 'all' };

function readHash() {
  const m = location.hash.match(/^#\/([a-z]+)(?:\/([a-z]+))?(?:\?filter=([a-z]+))?$/);
  if (!m) return;
  if (byId[m[1]]) state.id = m[1];
  if (VIEWS.includes(m[2])) state.view = m[2];
  state.filter = FILTERS.includes(m[3]) ? m[3] : 'all';
}
function writeHash() {
  const f = state.view === 'brief' && state.filter !== 'all' ? `?filter=${state.filter}` : '';
  const h = `#/${state.id}/${state.view}${f}`;
  if (location.hash !== h) history.replaceState(null, '', h);
}

function go(patch, { focus } = {}) {
  const prevId = state.id;
  Object.assign(state, patch);
  if (patch.id && patch.id !== prevId && !('filter' in patch)) state.filter = 'all';
  writeHash();
  render();
  if (focus) focus();
}

/* ---------------- Rendering ---------------- */
function render() {
  const a = byId[state.id];
  const act = ACTIONS[a.id];
  document.title = `${SHORT[a.id]} · Account assurance`;

  // Breadcrumb
  $('#crumb-badge').textContent = BADGE[a.id];
  $('#crumb-account').textContent = a.name;
  $('#crumb-project').textContent = a.project;
  $('#account-menu-button').setAttribute('aria-label', `Account: ${a.name}. Switch account`);

  // Rail
  $$('#account-list .account').forEach((b) => b.setAttribute('aria-current', String(b.dataset.id === a.id)));
  $$('#account-list .account').forEach((b) => (b.tabIndex = b.dataset.id === a.id ? 0 : -1));
  const cur = document.querySelector(`#account-list .account[data-id="${a.id}"]`);
  const list = $('#account-list');
  if (cur && list.scrollWidth > list.clientWidth + 1) list.scrollLeft = Math.max(0, cur.parentElement.offsetLeft - list.offsetLeft - 6);
  $$('#account-menu [role="menuitemradio"]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.id === a.id)));

  // Header
  $('#report-eyebrow').textContent = `Account ${rankOf(a.id)} of 5 · checked ${CHECKED_LABEL}`;
  $('#account-title').textContent = a.name;
  const pill = $('#action-pill');
  pill.className = `pill ${act.tone}`;
  pill.textContent = act.action;
  $('#account-sub').textContent = `${a.seat} · ${a.project} · ${a.priority}`;

  // Tabs
  VIEWS.forEach((v) => {
    const tab = $(`#tab-${v}`);
    const on = v === state.view;
    tab.setAttribute('aria-selected', String(on));
    tab.tabIndex = on ? 0 : -1;
    $(`#panel-${v}`).hidden = !on;
  });

  renderBrief(a, act);
  renderOverlap(a);
  renderCall(a);
  renderPane(a);
  renderDrawer();
  $('#sources-count').textContent = String(a.evidence.length);
}

function latestDated(a) {
  const ds = a.evidence.filter((e) => /^\d{1,2} [A-Z][a-z]+ \d{4}$/.test(e.date)).map((e) => Date.parse(e.date + ' UTC'));
  if (!ds.length) return null;
  return new Date(Math.max(...ds)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function renderBrief(a, act) {
  const f = state.filter;
  const show = (kind) => f === 'all' || f === kind;
  const nEvidence = a.evidence.length;
  const nHyp = 2;
  const nUnknown = 3 + a.blockers.length;
  const sponsor = /sponsor|not verified purchasing owner/i.test(a.buyer);
  const latest = latestDated(a);

  const filterBar = `
    <div class="filter-row">
      <fieldset class="seg" id="evidence-filter">
        <legend class="sr-only">Filter the brief</legend>
        ${[['all', 'All', ''], ['evidence', 'Evidence', nEvidence], ['hypothesis', 'Hypotheses', nHyp], ['unknown', 'Unknowns and blockers', nUnknown]]
          .map(([v, l, n]) => `<label><input type="radio" name="filter" value="${v}" ${f === v ? 'checked' : ''}><span>${l}${n !== '' ? ` <em>${n}</em>` : ''}</span></label>`).join('')}
      </fieldset>
      <span class="muted">Ranking is my judgement, not a chance to close.</span>
    </div>`;

  const judgement = show('all') && f === 'all' ? `
    <section class="judgement block" data-kind="judgement" aria-labelledby="j-title">
      <header><span class="pill neutral">#${rankOf(a.id)} · My call</span><span class="pill ${act.tone}">${esc(act.action)}</span><h2 id="j-title">${esc(act.summary)}</h2></header>
      <ul>${act.why.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>
      <p class="route"><b>Stop or route:</b> ${esc(act.defer)}</p>
    </section>` : '';

  const kpis = f === 'all' ? `
    <div class="kpis" data-kind="summary">
      <div class="kpi"><small>Seat</small><b>${esc(a.seat)}</b><span>${esc(a.priority)}</span></div>
      <div class="kpi"><small>Public evidence</small><b>${nEvidence} ${nEvidence === 1 ? 'source' : 'sources'}</b><span>${latest ? `Latest dated ${latest}` : 'Undated'}</span></div>
      <div class="kpi"><small>Customer status</small><b>Unknown</b><span>Check Planlab CRM before outreach</span></div>
    </div>` : '';

  const evidence = show('evidence') ? `
    <section class="block" data-kind="evidence" aria-labelledby="ev-title">
      <h2 id="ev-title">What public sources say <span class="n">${nEvidence}</span></h2>
      <div>${a.evidence.map((e) => `
        <div class="item" data-kind="evidence">
          <span class="pill evidence">Evidence</span>
          <p>${esc(e.text)}</p>
          <div class="meta"><span>${esc(e.date)}</span>${chip(e.url, `${publisher(e.url)} · ${slugTitle(e.url)}`)}</div>
        </div>`).join('')}</div>
    </section>` : '';

  const hypothesis = show('hypothesis') ? `
    <section class="block" data-kind="hypothesis" aria-labelledby="hy-title">
      <h2 id="hy-title">What I'd test <span class="n">${nHyp}</span></h2>
      <div>
        <div class="item" data-kind="hypothesis">
          <span class="pill hypothesis">Hypothesis</span>
          <p>${esc(a.hypothesis)}</p>
        </div>
        <div class="item" data-kind="hypothesis">
          <span class="pill hypothesis">Question</span>
          <blockquote class="opener"><small>Opening question to test</small>${esc(a.opener)}</blockquote>
        </div>
      </div>
    </section>` : '';

  const unknowns = show('unknown') ? `
    <section class="block" data-kind="unknown" aria-labelledby="un-title">
      <h2 id="un-title">Unknowns and possible blockers <span class="n">${nUnknown}</span></h2>
      <div>
        <div class="item" data-kind="unknown"><span class="pill unknown">Unknown</span>
          <p><b>Buyer role.</b> ${esc(a.buyer)}${sponsor ? ' <span class="sponsor pill unknown">Named person is a sponsor, not a verified purchasing owner</span>' : ''}</p></div>
        <div class="item" data-kind="unknown"><span class="pill unknown">Unknown</span>
          <p><b>Existing customer or CRM status.</b> Unknown for all five accounts; check Planlab CRM before outreach.</p></div>
        <div class="item" data-kind="unknown"><span class="pill unknown">Unknown</span>
          <p><b>Needs, pain and tool stack.</b> Not established by any public source. I make no claim about them; they are for discovery.</p></div>
        ${a.blockers.map((b) => `<div class="item" data-kind="unknown"><span class="pill risk">Blocker</span><p>${esc(b)}</p></div>`).join('')}
      </div>
    </section>` : '';

  const overlap = f === 'all' ? `
    <p class="note flag" data-kind="overlap"><b>Overlap.</b> ${esc(a.overlap)} <button type="button" class="link-btn" data-goto-view="overlap">See the programme map</button></p>` : '';

  $('#panel-brief').innerHTML = filterBar + judgement + kpis + evidence + hypothesis + unknowns + overlap;
}

function renderOverlap(a) {
  const cell = (acc, prog) => {
    const l = LINKS.find((x) => x.account === acc && x.programme === prog);
    if (!l) return '<td><span class="sr-only">No link</span></td>';
    const label = { owner: 'Owner', contractor: 'Contractor', 'partner-verify': 'Partner · verify' }[l.role];
    return `<td><span class="role ${l.role}">${label}</span></td>`;
  };
  $('#panel-overlap').innerHTML = `
    <section class="block" aria-labelledby="ov-title">
      <h2 id="ov-title">${esc(CONCENTRATION.headline)}</h2>
      <ul class="points">${CONCENTRATION.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
    </section>
    <section class="block" aria-labelledby="mx-title">
      <h2 id="mx-title">Accounts by programme thread</h2>
      <div class="matrix-wrap" tabindex="0" role="region" aria-label="Programme table, scrolls sideways on small screens">
        <table class="matrix">
          <thead><tr><th scope="col">Account</th>${PROGRAMMES.map((p) => `<th scope="col">${esc(p.name)}<small>${esc(p.owner)}</small></th>`).join('')}</tr></thead>
          <tbody>${ordered.map((acc) => `<tr class="${acc.id === a.id ? 'is-current' : ''}"><th scope="row"><button type="button" class="link-btn" data-goto="${acc.id}">${esc(SHORT[acc.id])}</button></th>${PROGRAMMES.map((p) => cell(acc.id, p.id)).join('')}</tr>`).join('')}</tbody>
        </table>
      </div>
      <p class="legend"><span><span class="role owner">Owner</span> programme owner</span><span><span class="role contractor">Contractor</span> named in a dated source</span><span><span class="role partner-verify">Partner · verify</span> from my overlap notes, to verify</span></p>
    </section>
    <section class="block" aria-labelledby="cf-title">
      <h2 id="cf-title">Why I'd test contractor-side first <span class="pill hypothesis">Judgement, not verified</span></h2>
      <ul class="points">${CONCENTRATION.contractorFirst.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
    </section>
    <section class="block" aria-labelledby="or-title">
      <h2 id="or-title">My order, and what would change it</h2>
      <div class="matrix-wrap" tabindex="0" role="region" aria-label="Order table, scrolls sideways on small screens">
      <table class="order-table" style="min-width:520px">
        <thead><tr><th scope="col">#</th><th scope="col">Account</th><th scope="col">Call</th><th scope="col">Stop or route</th></tr></thead>
        <tbody>${ordered.map((acc, i) => `<tr><td>${i + 1}</td><td><button type="button" class="link-btn" data-goto="${acc.id}">${esc(SHORT[acc.id])}</button></td><td><span class="pill ${ACTIONS[acc.id].tone}">${esc(ACTIONS[acc.id].action)}</span></td><td>${esc(ACTIONS[acc.id].defer)}</td></tr>`).join('')}</tbody>
      </table>
      </div>
      <div><button type="button" class="btn" id="export-all">${'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v8 M4.5 6.5L8 10l3.5-3.5 M3 13h10"/></svg>'}<span>Export all five accounts (.md)</span></button></div>
    </section>`;
}

function renderCall(a) {
  const k = CALL_KIT;
  const other = a.id !== k.accountId ? `
    <div class="note info"><b>The worked call is for National Grid Electricity Transmission.</b> For ${esc(a.name)}, the opening question I'd test is: “${esc(a.opener)}” <button type="button" class="link-btn" data-goto="${k.accountId}" data-goto-keep-view>Open NGET</button></div>` : '';
  $('#panel-call').innerHTML = `
    ${other}
    <div class="banner">${ICON.info}<p>${esc(k.disclaimer)}</p></div>
    <section class="block" aria-labelledby="ck-why">
      <h2 id="ck-why">Why this account</h2>
      <ul class="points">${k.why.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>
      <div class="chips">${chip(k.whySource, 'Ofgem · Material scope change decision (PDF)')}</div>
    </section>
    <section class="block" aria-labelledby="ck-fit">
      <h2 id="ck-fit">Product fit, in Planlab's own public words</h2>
      <ul class="points">${k.productFit.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>
      <div class="chips">${chip(k.productSources[0], 'Planlab · QSRA')}${chip(k.productSources[1], 'Planlab · Scenario exploration')}</div>
    </section>
    <section class="block" aria-labelledby="ck-open">
      <h2 id="ck-open">30-second opening</h2>
      <blockquote class="script" id="opening-script">${esc(k.opening)}</blockquote>
      <div class="script-actions"><button type="button" class="btn" id="copy-opening"><svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5" y="5" width="8.5" height="8.5" rx="1.5"/><path d="M10.5 5V3.5A1.5 1.5 0 009 2H3.5A1.5 1.5 0 002 3.5V9a1.5 1.5 0 001.5 1.5H5"/></svg><span>Copy opening</span></button></div>
    </section>
    <section class="block" aria-labelledby="ck-disc">
      <h2 id="ck-disc">Discovery</h2>
      <ol class="discovery">${k.discovery.map((q) => `<li>${esc(q)}</li>`).join('')}</ol>
    </section>
    <section class="block" aria-labelledby="ck-obj">
      <h2 id="ck-obj">Objections</h2>
      <div>${k.objections.map((o) => `<details class="objection"><summary>${esc(o.label)} ${ICON.chev}</summary><p>${esc(o.reply)}${o.label === 'Security' ? ` ${chip(PLANLAB_SECURITY_URL, 'Planlab · Security')}` : ''}</p></details>`).join('')}</div>
    </section>
    <section class="block" aria-labelledby="ck-fu">
      <h2 id="ck-fu">Follow-up example <span class="pill unknown">Not sent</span></h2>
      <blockquote class="script">${esc(k.followUp)}</blockquote>
      <p class="muted">${esc(k.followUpRules)}</p>
    </section>
    <section class="block" aria-labelledby="ck-exp">
      <h2 id="ck-exp">Experiment and handoff <span class="pill hypothesis">Proposed, not results</span></h2>
      <p>${esc(k.experiment)}</p>
      <p>${esc(k.handoff)}</p>
    </section>`;
}

function renderPane(a) {
  const key = `aa:notes:${a.id}`;
  const saved = store.get(key) || '';
  $('#pane-body').innerHTML = `
    <div class="pane-section">
      <div class="status-line"><span>${esc(SHORT[a.id])}</span><span class="pill unknown">Not qualified</span></div>
      <p class="muted" style="font-size:11.5px">No conversation has happened, so every criterion is Unknown. Public research only frames the questions.</p>
    </div>
    <div class="pane-section">
      <h3>Criteria and the question that tests each</h3>
      <ul class="q-list">${QUALIFICATION.map((q) => `
        <li class="q-row"><span class="ring" aria-hidden="true"></span>
          <span class="q-title">${esc(q.criterion)} <span class="pill unknown">Unknown</span></span>
          <span class="q-ask">Ask: ${esc(q.ask)}</span></li>`).join('')}</ul>
    </div>
    <div class="pane-section">
      <h3>Rules</h3>
      <ul class="rules">${CALL_KIT.qualificationRules.map((r) => `<li>${esc(r)}</li>`).join('')}<li>Customer or CRM status: unknown for all five accounts. Check internally before any approach.</li></ul>
    </div>
    <div class="pane-section">
      <h3>First question for this account</h3>
      <p style="font-size:12.5px">${esc(a.opener)}</p>
    </div>
    <div class="pane-section notes">
      <label for="notes">Practice notes (hypothetical, stored only in this browser)</label>
      <textarea id="notes" spellcheck="true" placeholder="e.g. what I'd listen for on this account">${esc(saved)}</textarea>
      <div class="notes-foot"><span id="notes-status">${saved ? 'Saved in this browser' : 'Nothing saved'}</span><button type="button" class="btn-quiet" id="notes-clear">Clear</button></div>
    </div>`;
  const ta = $('#notes');
  let t;
  ta.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      const ok = ta.value ? store.set(key, ta.value) : (store.del(key), true);
      $('#notes-status').textContent = !ok ? 'Browser storage unavailable; notes not saved' : ta.value ? 'Saved in this browser' : 'Nothing saved';
    }, 250);
  });
  $('#notes-clear').addEventListener('click', () => {
    store.del(key);
    ta.value = '';
    $('#notes-status').textContent = 'Nothing saved';
    toast('Practice notes cleared');
    ta.focus();
  });
}

function sourceCard(s) {
  const claims = s.claims.length
    ? `<div class="s-used">${s.accounts.map((id) => `<span class="tag">${esc(SHORT[id])}</span>`).join('')}</div>`
    : `<p class="muted" style="font-size:11.5px">${esc(s.note)}</p>`;
  return `<div class="source" data-url="${esc(s.url)}">
      <div class="s-top"><span class="s-pub">${esc(publisher(s.url))}</span><span class="s-date">${esc(s.date)}</span></div>
      <span>${esc(slugTitle(s.url))}</span>
      ${claims}
      <span class="s-url">${esc(s.url)}</span>
      <a class="open" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Open source<span class="sr-only"> (opens in a new tab)</span> ↗</a>
    </div>`;
}

function renderDrawer() {
  const scope = $('#drawer-scope input:checked').value;
  const a = byId[state.id];
  const ev = scope === 'all' ? SOURCES.evidence : SOURCES.evidence.filter((s) => s.accounts.includes(a.id));
  const prod = scope === 'all' || a.id === CALL_KIT.accountId ? SOURCES.product : [];
  $('#drawer-sub').textContent = scope === 'all'
    ? `${SOURCES.evidence.length} account sources across five accounts. Checked ${CHECKED_LABEL}.`
    : `${ev.length} ${ev.length === 1 ? 'source' : 'sources'} for ${a.name}. Checked ${CHECKED_LABEL}.`;
  $('#drawer-body').innerHTML =
    `<h3>Account evidence</h3>${ev.map(sourceCard).join('')}` +
    (prod.length ? `<h3>Planlab product pages (call kit)</h3>${prod.map(sourceCard).join('')}` : '');
}

/* ---------------- Export ---------------- */
function briefMarkdown(a) {
  const act = ACTIONS[a.id];
  const L = [];
  L.push(`## ${rankOf(a.id)}. ${a.name}`, '');
  L.push(`- Seat: ${a.seat}`, `- Project: ${a.project}`, `- Priority note: ${a.priority}`, `- My call: ${act.action}. ${act.summary}`, '');
  L.push('### Why', ...act.why.map((w) => `- ${w}`), `- Stop or route: ${act.defer}`, '');
  L.push('### Evidence', ...a.evidence.map((e) => `- [Evidence] ${e.text} (${e.date}) Source: ${e.url}`), '');
  L.push('### Hypothesis to test', `- [Hypothesis] ${a.hypothesis}`, `- Opening question: ${a.opener}`, '');
  L.push('### Unknowns and possible blockers', `- [Unknown] Buyer role: ${a.buyer}`, '- [Unknown] Existing customer or CRM status: unknown; check Planlab CRM before outreach.', '- [Unknown] Needs, pain and tool stack: not established by public sources.', ...a.blockers.map((b) => `- [Blocker] ${b}`), '');
  L.push('### Overlap', `- ${a.overlap}`, '');
  L.push('### Qualification (all Unknown until a real conversation)', ...QUALIFICATION.map((q) => `- [Unknown] ${q.criterion}. Ask: ${q.ask}`), '');
  return L.join('\n');
}
const HEADER = () => [
  '# Account assurance: UK electricity transmission',
  '',
  `Independent concept by Ayo Ahmed, not affiliated with Planlab. Public sources checked ${CHECKED_LABEL}. No prospect contact has occurred. The order is my judgement, not a chance to close.`,
  '',
].join('\n');

function download(name, text) {
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast(`Downloaded ${name}`);
}

/* ---------------- UI plumbing ---------------- */
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.append(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

function buildRail() {
  $('#account-list').innerHTML = ordered.map((a, i) => `
    <li><button type="button" class="account" data-id="${a.id}" aria-current="false">
      <span class="rank" aria-hidden="true">${i + 1}</span>
      <span class="a-name">${esc(a.name)}</span>
      <span class="a-project">${esc(a.project)}</span>
      <span class="a-tags"><span class="tag">${esc(a.seat)}</span><span class="tag">${esc(ACTIONS[a.id].action)}</span></span>
    </button></li>`).join('');
  $('#account-menu').innerHTML = ordered.map((a, i) => `
    <li role="none"><button type="button" role="menuitemradio" aria-checked="false" data-id="${a.id}" tabindex="-1">
      <i class="ws-badge" aria-hidden="true">${BADGE[a.id]}</i><span>${i + 1}. ${esc(a.name)}</span></button></li>`).join('');
}

/* Account menu (breadcrumb) */
const menuBtn = () => $('#account-menu-button');
const menu = () => $('#account-menu');
function openMenu() {
  menu().hidden = false;
  menuBtn().setAttribute('aria-expanded', 'true');
  ($('[aria-checked="true"]', menu()) || $('[role="menuitemradio"]', menu())).focus();
}
function closeMenu(returnFocus = true) {
  if (menu().hidden) return;
  menu().hidden = true;
  menuBtn().setAttribute('aria-expanded', 'false');
  if (returnFocus) menuBtn().focus();
}

/* Drawer */
let drawerOpener = null;
function openDrawer(opener) {
  drawerOpener = opener || document.activeElement;
  renderDrawer();
  $('#sources-drawer').hidden = false;
  $('#scrim').hidden = false;
  $('#sources-button').setAttribute('aria-expanded', 'true');
  $('#drawer-close').focus();
}
function closeDrawer() {
  if ($('#sources-drawer').hidden) return;
  $('#sources-drawer').hidden = true;
  $('#scrim').hidden = true;
  $('#sources-button').setAttribute('aria-expanded', 'false');
  (drawerOpener && document.contains(drawerOpener) ? drawerOpener : $('#sources-button')).focus();
}

function bind() {
  // Rail: click and roving arrow keys
  $('#account-list').addEventListener('click', (e) => {
    const b = e.target.closest('.account');
    if (b) go({ id: b.dataset.id });
  });
  $('#account-list').addEventListener('keydown', (e) => {
    const items = $$('#account-list .account');
    const i = items.indexOf(document.activeElement);
    if (i < 0) return;
    const keys = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: items.length - 1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const n = (keys[e.key] + items.length) % items.length;
    go({ id: items[n].dataset.id }, { focus: () => $$('#account-list .account')[n].focus() });
  });

  // Breadcrumb account menu
  menuBtn().addEventListener('click', () => (menu().hidden ? openMenu() : closeMenu()));
  menuBtn().addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); openMenu(); }
  });
  menu().addEventListener('click', (e) => {
    const b = e.target.closest('[role="menuitemradio"]');
    if (!b) return;
    closeMenu(false);
    go({ id: b.dataset.id }, { focus: () => menuBtn().focus() });
  });
  menu().addEventListener('keydown', (e) => {
    const items = $$('[role="menuitemradio"]', menu());
    const i = items.indexOf(document.activeElement);
    if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }
    if (e.key === 'Tab') { closeMenu(false); return; }
    const keys = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: items.length - 1 };
    if (e.key in keys) { e.preventDefault(); items[(keys[e.key] + items.length) % items.length].focus(); }
  });
  document.addEventListener('click', (e) => {
    if (!menu().hidden && !e.target.closest('.crumb-account')) closeMenu(false);
  });

  // Tabs
  const tablist = $('[role="tablist"]');
  tablist.addEventListener('click', (e) => {
    const t = e.target.closest('[role="tab"]');
    if (t) go({ view: t.id.replace('tab-', '') });
  });
  tablist.addEventListener('keydown', (e) => {
    const i = VIEWS.indexOf(state.view);
    const keys = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: VIEWS.length - 1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const v = VIEWS[(keys[e.key] + VIEWS.length) % VIEWS.length];
    go({ view: v }, { focus: () => $(`#tab-${v}`).focus() });
  });

  // Delegated panel actions
  document.addEventListener('change', (e) => {
    if (e.target.name === 'filter') {
      const v = e.target.value;
      go({ filter: v }, { focus: () => $(`#evidence-filter input[value="${v}"]`).focus() });
    }
    if (e.target.name === 'scope') renderDrawer();
  });
  document.addEventListener('click', async (e) => {
    const g = e.target.closest('[data-goto]');
    if (g) {
      const patch = { id: g.dataset.goto };
      if (!g.hasAttribute('data-goto-keep-view') && state.view === 'overlap') patch.view = 'brief';
      go(patch, { focus: () => $('#account-title').scrollIntoView({ block: 'nearest' }) });
      $('#report').focus({ preventScroll: true });
      return;
    }
    const gv = e.target.closest('[data-goto-view]');
    if (gv) { go({ view: gv.dataset.gotoView }, { focus: () => $(`#tab-${gv.dataset.gotoView}`).focus() }); return; }
    if (e.target.closest('#export-all')) {
      download('account-plan-uk-transmission.md', HEADER() + '\n' + ordered.map(briefMarkdown).join('\n'));
      return;
    }
    if (e.target.closest('#copy-opening')) {
      toast((await copyText(CALL_KIT.opening)) ? 'Opening copied' : 'Copy unavailable; select the text instead');
    }
  });
  $('#overlap-card').addEventListener('click', () => go({ view: 'overlap' }, { focus: () => $('#tab-overlap').focus() }));

  // Top bar actions
  $('#sources-button').addEventListener('click', (e) => openDrawer(e.currentTarget));
  $('#drawer-close').addEventListener('click', closeDrawer);
  $('#scrim').addEventListener('click', closeDrawer);
  $('#print-button').addEventListener('click', () => window.print());
  $('#export-button').addEventListener('click', () => {
    const a = byId[state.id];
    download(`account-brief-${a.id}.md`, HEADER() + '\n' + briefMarkdown(a));
  });

  // Drawer focus trap and Escape
  document.addEventListener('keydown', (e) => {
    if ($('#sources-drawer').hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); closeDrawer(); return; }
    if (e.key === 'Tab') {
      const f = $$('#sources-drawer button, #sources-drawer a[href], #sources-drawer input:checked');
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  window.addEventListener('hashchange', () => { readHash(); render(); });
}

buildRail();
readHash();
bind();
writeHash();
render();
document.documentElement.dataset.ready = 'true';
