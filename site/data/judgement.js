// My judgement layer. Nothing here is sourced evidence: it is how I would order
// and route the five accounts, reasoned only from the facts in accounts.js.
// The order is a call I make and can defend, not a computed chance to close.

export const ORDER = ['murphy', 'balfour', 'mgroup', 'nget', 'ssen'];

export const ACTIONS = {
  murphy: {
    action: 'Prioritise',
    tone: 'evidence',
    summary: 'One named package with a dated, public change of phase.',
    why: [
      'Murphy holds a single, named package (the 400kV substation at Hawthorn Pit on EGL1), and the public project update gives a current phase: piling complete, foundations progressing before buildings and electrical installation.',
      'A contractor planning team on one package is a smaller, more reachable first conversation than owner-level procurement.',
      'What learning here gives me: whether contractor planners own their package programme or work to one issued by NGET or the joint venture.',
    ],
    defer: 'Stop or route if NGET or the joint venture owns the integrated schedule and tools.',
  },
  balfour: {
    action: 'Prioritise',
    tone: 'evidence',
    summary: 'Two dated awards in June 2026 across two owners.',
    why: [
      'Two public awards within days of each other (SSEN Netherton main works on 25 June 2026, the National Grid overhead-line partnership on 23 June 2026) put two owners\' programmes in one Power T&D division.',
      'Talking to Balfour first also tells me how to approach Netherton without two uncoordinated calls into one programme.',
    ],
    defer: 'Stop or route if the client issues and controls the programmes, or if group IT and procurement make a small test impractical.',
  },
  mgroup: {
    action: 'Test',
    tone: 'hypothesis',
    summary: 'Clear scope; first confirm who owns the programme.',
    why: [
      'The Strathaven to Smeaton award is specific (£110m, more than 70km of overhead line), and M Group named the divisional managing director.',
      'The first question is whether overhead-lines planners own the programme or SP Energy Networks issues it. If it is issued, contractor tooling may be limited.',
    ],
    defer: 'Stop if the conversation reaches field dispatch rather than project controls.',
  },
  nget: {
    action: 'Strategic, slower',
    tone: 'unknown',
    summary: 'Strongest public trigger; hardest route in.',
    why: [
      'Ofgem\'s December 2025 decision is the clearest public trigger in the set, and NGET also owns the ecosystem that three of the four other accounts sit in.',
      'It is also likely the slowest route: critical-infrastructure security and procurement review, a QSRA that could be owned by a joint venture or consultant, and a source that is now historic.',
      'I worked the full call on this account because it is where a careless opener does the most damage. Respecting the team\'s work matters more here than anywhere else.',
    ],
    defer: 'Check existing customer and CRM status before any approach, and learn from contractor-side conversations first.',
  },
  ssen: {
    action: 'Defer behind Balfour',
    tone: 'risk',
    summary: 'Live trigger, but the same programme as Balfour.',
    why: [
      'Netherton moving into main works is a live trigger, but it is the same programme as the Balfour account, not a second independent opportunity.',
      'Owner procurement may be slow, and current tools and access requirements are unknown.',
    ],
    defer: 'Come back after Balfour conversations show who owns the integrated programme, and do not treat provisional inquiry dates as completed events.',
  },
};

// Programme threads the five accounts touch, from the evidence and overlap notes.
export const PROGRAMMES = [
  { id: 'ng-frameworks', name: 'National Grid frameworks', note: 'Overhead-line partnership and substation framework', owner: 'National Grid' },
  { id: 'egl1', name: 'EGL1 · Hawthorn Pit', note: '400kV substation package', owner: 'National Grid' },
  { id: 'egl34', name: 'EGL3 / EGL4 / Grimsby to Walpole', note: 'Ofgem decision, EGL4 supply chain', owner: 'National Grid' },
  { id: 'netherton', name: 'Netherton Hub', note: 'Main construction works', owner: 'SSEN Transmission' },
  { id: 'strathaven', name: 'Strathaven to Smeaton', note: '400kV overhead line', owner: 'SP Energy Networks' },
];

// role: owner | contractor | partner-verify
export const LINKS = [
  { account: 'nget', programme: 'ng-frameworks', role: 'owner' },
  { account: 'nget', programme: 'egl1', role: 'owner' },
  { account: 'nget', programme: 'egl34', role: 'owner' },
  { account: 'murphy', programme: 'ng-frameworks', role: 'contractor' },
  { account: 'murphy', programme: 'egl1', role: 'contractor' },
  { account: 'balfour', programme: 'ng-frameworks', role: 'contractor' },
  { account: 'balfour', programme: 'netherton', role: 'contractor' },
  { account: 'mgroup', programme: 'ng-frameworks', role: 'partner-verify' },
  { account: 'mgroup', programme: 'strathaven', role: 'contractor' },
  { account: 'ssen', programme: 'netherton', role: 'owner' },
];

export const CONCENTRATION = {
  headline: 'Five account names, three programme threads.',
  points: [
    'Four of the five accounts sit inside the National Grid ecosystem: NGET as owner, and Murphy, Balfour Beatty and M Group as framework partners (M Group\'s place to be verified).',
    'Netherton Hub appears twice: SSEN Transmission as owner and Balfour Beatty as main works contractor.',
    'Only Strathaven to Smeaton sits outside both. Its owner, SP Energy Networks, is not one of the five accounts.',
  ],
  contractorFirst: [
    'Owner procurement on critical national infrastructure may be slow and security-heavy (both are flagged as blockers), and buyer roles are unverified.',
    'A contractor planning team on one named package can say quickly whether it owns its programme, what it uses and what a dated event looks like. That is a small, cheap test of the angle.',
    'If contractors work to client-issued programmes, I learn that early and route the owner conversation better, rather than spending the owner\'s attention on an untested pitch.',
  ],
};

// Qualification criteria (call kit) mapped to the discovery question that tests each.
export const QUALIFICATION = [
  { id: 'owner', criterion: 'Named programme and relevant schedule owner', ask: 'Which named programme and schedule outcomes do you own?' },
  { id: 'tool', criterion: 'Actual tool/workflow', ask: 'How are contractor schedules and risk assumptions brought together, and what tools do you use?' },
  { id: 'event', criterion: 'Dated event', ask: 'What\'s the next dated planning/reporting event where a faster comparison would matter?' },
  { id: 'constraint', criterion: 'Constraint in their own words', ask: 'When an assumption changes, how long does a useful scenario re-run take? Is that actually a problem?' },
  { id: 'stakeholder', criterion: 'Sensible next stakeholder', ask: 'Who reviews outputs?' },
  { id: 'security', criterion: 'Known security/procurement route', ask: 'What security/procurement route would any trial need?' },
];

// Supporting links that are not account evidence.
export const PLANLAB_SECURITY_URL = 'https://www.planlab.ai/security';
