# Test results

Run on 3 November 2026 with Node v22.23.4 and Playwright 1.63.0 (headless Chromium), against the built `dist/`.

```bash
npm test
```

## Result: 25 passed, 0 failed (11.0s)

```
ok 1 - checked date and customer status match the research
ok 2 - every account field matches the research except for spacing
ok 3 - every evidence claim has an https source and a date
ok 4 - every call-kit string appears in the call-kit research except for spacing
ok 5 - qualification questions are taken from the call-kit discovery list
ok 6 - the judgement layer covers each account exactly once
ok 7 - published text has no tool attribution, contact details or agent features
ok 8 - licensed brand fonts are not in the repository
ok 9 - all five account switches update the rail, breadcrumb, title, URL and evidence
ok 10 - deep links open the right account and view; bad hashes fall back
ok 11 - evidence filter shows only the chosen kind and is linkable
ok 12 - every named sponsor is labelled as sponsor, not purchasing owner
ok 13 - sources drawer lists, opens and closes sources with keyboard support
ok 14 - evidence source chips open the cited URL in a new tab
ok 15 - call kit renders the worked NGET example and routes other accounts to it
ok 16 - overlap view shows concentration and its links switch accounts
ok 17 - keyboard: rail arrows, tab arrows, breadcrumb menu
ok 18 - export downloads a Markdown brief with sources and the unofficial label
ok 19 - print: button calls print, print layout hides chrome and prints source URLs
ok 20 - practice notes persist locally per account and can be cleared
ok 21 - no horizontal page overflow at 320px for every account and view
ok 22 - no horizontal page overflow at 390px for every account and view
ok 23 - no horizontal page overflow at 768px for every account and view
ok 24 - no horizontal page overflow at 1024px for every account and view
ok 25 - no horizontal page overflow at 1440px for every account and view
# tests 25
# pass 25
# fail 0
```

## What the tests cover

- **Facts unchanged.** Every account field and every call-kit string equals the supplied research once whitespace is removed, so only spacing was changed.
- **Account switches.** All five accounts are switched by click and by arrow keys, plus the breadcrumb menu. Each switch updates the title, breadcrumb, `aria-current`, URL, evidence count and source links.
- **Evidence filter.** Each of the four filter states shows only its kind, and the state is kept in the URL.
- **Source opening.** Drawer links and evidence chips open the exact cited URL in a new tab with `noopener noreferrer`. The test stubs off-site pages, so no request leaves the machine.
- **Call kit.** Discovery and objections render, the security objection expands, copy-to-clipboard works, and other accounts route to NGET.
- **Print and export.** Print is triggered; the print layout hides the chrome and prints full URLs; a PDF renders. Markdown exports contain every source URL and the unofficial label.
- **Layouts.** There is no horizontal page overflow at 320, 390, 768, 1024 and 1440px for all 15 account and view combinations. The drawer and menu fit at 320 and 390px, and the top-bar buttons keep accessible names when their labels are hidden.

## Bugs the tests caught and I fixed

| Bug | Cause | Fix |
|---|---|---|
| Page scrolled sideways at 320, 390 and 768px | Visually-hidden helper text inside table cells was absolutely positioned with no positioned ancestor, so it escaped the table's scroll container | Positioned the scroll containers; added an overflow test for every account and view |
| The sponsor label overflowed at 320px | The pill could not wrap | It now wraps inline |
| The undated Murphy source showed as "Latest dated 3 Nov 2026" | The browser's lenient date parsing read "checked 3 November 2026" | Only strict "D Month YYYY" dates count as dated |
| Top-bar buttons lost their names on narrow screens | Labels were hidden with `display: none` | Visually hidden instead; test added |

## Accessibility audit

axe-core 4.10.2 checked 30 page states (5 accounts × 3 views × 1440 and 390px) against WCAG 2.0 A/AA, 2.1 AA and best practice.

- **First run:** one moderate issue: the programme-table scroll region and its section shared one label, creating duplicate landmarks.
- **After the fix:** no violations across 30 page states.

axe-core was used as a one-off check and is not a project dependency.

## Visual inspection

I inspected screenshots at 1440, 390 and 320px and the print preview (see [screenshots](screenshots/)). The inspection led to fixes for a truncated account breadcrumb, stretched evidence pills, the mobile account strip not scrolling to the current account, and the "See the programme map" button printing.

## What I could not verify from here

- **Source links.** The build environment's network policy blocks all eleven cited hosts (Ofgem, National Grid, SSEN Transmission, Murphy, Eastern Green Link 1, ScottishPower, M Group and planlab.ai). Each request returned no response (`000`), so I could not confirm here that the links resolve to the intended content. The account research was independently verified before it was supplied. Run `npm run check:links` from an open network to re-check.
- **Brand capture.** planlab.ai was also blocked, so the brand values come from the browser capture supplied on 3 November 2026. See [BRAND.md](BRAND.md).
