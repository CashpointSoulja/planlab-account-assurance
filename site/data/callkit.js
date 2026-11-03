// Worked call kit for National Grid Electricity Transmission, normalised from
// research/CALL-KIT.md. Only spacing has been changed; tests/data.test.mjs proves
// each string appears in the source once whitespace is removed.

export const CALL_KIT = {
  accountId: 'nget',
  title: 'Worked account: National Grid Electricity Transmission',
  disclaimer: "Role-play only. No outreach has been sent. 'From Planlab' lines are a practice script for use only after authorisation to represent Planlab, not a claim that Ayo works there today.",
  why: [
    "Ofgem's 9 December 2025 decision on EGL3, EGL4 and Grimsby–Walpole questioned QSRA assumptions and noted that fastest delivery scenarios and acceleration opportunities were not modelled.",
    "This is a public regulatory finding, not evidence of a current software gap or a licence to criticise the team's work.",
    'The first discovery test is who owns the scenario analysis and whether repeat runs are actually a constraint.',
    'Strategic relevance is high; near-term accessibility is unknown and procurement may be slow.',
  ],
  whySource: 'https://www.ofgem.gov.uk/sites/default/files/2025-12/material-scope-change-decision.pdf',
  productFit: [
    'Planlab says its QSRA maps risks to programme activities, runs Monte Carlo and outputs P50/P80.',
    'It loads risks from OPC or Excel.',
    'Scenario exploration creates what-if copies, leaving live plan untouched.',
  ],
  productSources: ['https://www.planlab.ai/qsra', 'https://www.planlab.ai/scenario-exploration'],
  opening: "Hi [name], it's Ayo from Planlab. This is a cold call. Can I have 30 seconds, then you tell me if it's relevant? I read Ofgem's December decision on the Lincolnshire projects and the point about testing acceleration scenarios. Planlab helps planning teams compare schedule options. Who owns those scenario assumptions and re-runs in your team?",
  discovery: [
    'Which named programme and schedule outcomes do you own?',
    'How are contractor schedules and risk assumptions brought together, and what tools do you use?',
    'When an assumption changes, how long does a useful scenario re-run take? Is that actually a problem?',
    "What's the next dated planning/reporting event where a faster comparison would matter?",
    'Who reviews outputs, and what security/procurement route would any trial need?',
  ],
  objections: [
    { label: 'Already have tools/consultants', reply: "Makes sense. I'm not assuming you need another tool. Is there any part of repeat scenario work that still takes longer than you'd like, or is the current setup working well?" },
    { label: 'Security', reply: "Fair concern. Planlab's public security page lists ISO 27001 and Cyber Essentials Plus, with SOC 2 Type II in progress. Your security team would need to verify the controls and requirements with the product team. I wouldn't promise approval." },
    { label: 'Not my job', reply: 'Who owns programme scenarios or project controls on that work?' },
    { label: 'No capacity', reply: "Understood. Is there a planning event later when a short conversation would be useful, or should I leave it there?" },
  ],
  qualificationIntro: 'Proposed qualification, to validate with Carlos',
  qualification: [
    'Named programme and relevant schedule owner',
    'actual tool/workflow',
    'dated event',
    'constraint in their own words',
    'sensible next stakeholder',
    'known security/procurement route',
  ],
  qualificationRules: [
    'If any are unknown, record unknown instead of turning it into a qualified meeting.',
    'Client-issued programmes and existing customer/vendor threads may be reasons to stop or route internally, not automatic failures.',
  ],
  followUp: 'Thanks for the conversation. The useful question seems to be [their stated constraint], ahead of [their dated event]. A first discussion would test whether schedule scenario work could help, not replace your planners\' judgement. Would [agreed next step] make sense?',
  followUpRules: 'Do not fill placeholders from public guesses. No autopilot sequence or unsolicited contact from this artifact.',
  experiment: 'Suggested first-week test after hiring: agree accounts/CRM exclusions with Carlos; verify buyer roles; test two specific call angles across comparable accounts; record connects, relevant conversations, objections, qualified next steps and reasons for no-fit. These are proposed measures, not results or targets already achieved.',
  handoff: 'Handoff records programme, role, tools, event, constraint in prospect\'s words, decision participants, security/procurement, next step and unresolved questions.',
};
