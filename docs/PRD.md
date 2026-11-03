# Product requirements: account assurance workspace

## Problem

I read the Founding SDR role as three jobs: research live projects, understand who owns the programme, and earn a useful conversation. A candidate can claim to do that. I want to show it, on one real segment, in a form a hiring team can check line by line.

This is a candidate's account plan. It is not Planlab's CRM and not a confirmed ideal customer profile.

## Users

| User | Need |
|---|---|
| Hiring team | Judge research quality, honesty about unknowns and call craft quickly, and check any claim against its source |
| Me, preparing a call | Find the evidence, the question to test, the blockers and the qualification gaps for one account in under a minute |

## Scope

- **In:**
  - five candidate accounts in UK electricity transmission (two owners, three contractors), with dated public evidence;
  - explicit programme concentration (NGET, Murphy and M Group share frameworks; SSEN and Balfour Beatty share Netherton);
  - a ranking that is my judgement, with why I'd prioritise or defer;
  - one worked call kit (NGET);
  - proposed qualification criteria;
  - export and print.
- **Out:**
  - prospect contact and outreach sequences;
  - AI chat or simulated analysis;
  - sign-in;
  - paid APIs or services;
  - a database;
  - CRM status, which is unknown and must be checked internally.

## Requirements

| # | Requirement | How it is met |
|---|---|---|
| R1 | Every evidence claim shows a source URL, source date and checked date | Source chip and date on every evidence item; checked date in the header and drawer; data tests enforce URL and date |
| R2 | Evidence is separate from hypotheses, unknowns and blockers | Four labelled kinds with a filter. Pills always carry words. |
| R3 | Named people are sponsors, not purchasing owners | A "sponsor, not a verified purchasing owner" label wherever a person is named; browser test |
| R4 | Concentration is visible | Overlap view with an accounts × programme matrix; overlap note on every brief; rail summary |
| R5 | Ranking is explained, not computed | "My call" block per account with why and stop/route conditions; no scores or probabilities |
| R6 | One worked call | Call kit view (NGET); other accounts route to it and show their own opening question |
| R7 | Qualification stays honest | Six criteria, all Unknown; the rule "record unknown instead of turning it into a qualified meeting" is shown |
| R8 | No dead controls | Account rail, breadcrumb menu, tabs, filter, drawer, source links, copy, export, print and notes are all covered by browser tests |
| R9 | Works from 320px to 1440px+, keyboard and print | Responsive layouts tested for overflow at 320, 390, 768, 1024 and 1440px; arrow-key rail, tabs and menu; skip link; print stylesheet |
| R10 | Free static hosting, no secrets | Plain static build; Cloudflare Pages config; strict CSP headers |
| R11 | The current project status beats stale updates | The Murphy evidence uses the current EGL1 update (piling complete) and warns against pitching the older July delay |

## Success measures

- **For the hiring conversation:** a reviewer can open any claim's source in one click, and can name the next question for any account without asking me.
- **For a real first week (proposed, not results):** connects, relevant conversations, objections heard, qualified next steps, and recorded reasons for no-fit, as in the call kit's experiment.
