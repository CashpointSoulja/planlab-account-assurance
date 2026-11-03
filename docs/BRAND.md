# Brand reference: Planlab

This file records what the public Planlab website looks like, so the account-assurance concept can sit natively in Planlab's product idiom. It is a reference, not a licence: the Planlab name, logo, typeface and imagery belong to Planlab and their owners.

The concept itself is labelled once, discreetly: **Independent concept by Ayo Ahmed, not affiliated with Planlab.**

## 1. Provenance and verification limits

| Item | Status |
|---|---|
| Source capture | `homepage.html`, `source.css`, `logo.svg`, `HafferXH-Regular.woff2`, `HafferXH-Medium.woff2`, `product-reference.png` and capture notes, saved from the live https://www.planlab.ai/ in a desktop browser on 3 November 2026 and supplied as a zip. |
| Build environment | The build environment's network policy blocks `www.planlab.ai` and `assets.planlab.ai`, so none of these files were re-fetched independently. Every value below is read from the captured files. |
| Where values come from | **CSS** = literal value in `source.css`. **HTML** = literal markup in `homepage.html`. **Pixel** = sampled from `product-reference.png` (1280 × 720). **Note** = from the capture notes, not otherwise checked. |
| Not captured | Product demo video `https://assets.planlab.ai/media/chat-time-impact/1080.mp4` and poster `…/poster.jpg`: URLs recorded only; not inspected. Hover and menu states; pages other than the homepage. |
| Local evidence | Raw capture kept in the git-ignored `source-evidence/`. SHA-256 hashes are in [reference/SOURCES.md](reference/SOURCES.md). |

## 2. Identity

**Logo.** A black pattern of three overlapping diamonds (`viewBox 0 0 49 24`, single path, `fill="black"`). In the site header, "Planlab" is set in HafferXH Medium to the right of it. Copy: [`assets/brand/planlab-logo.svg`](../assets/brand/planlab-logo.svg). (Source: CSS/HTML)

**Animated header mark.** The header renders the mark as three `24 × 24px` `div`s at `left: 0 / 12px / 24px`. Each is clipped to a diamond with `clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%)`, filled white and blended with `mix-blend-mode: difference`. It therefore reads near-black (#313232 sampled) on the white nav cell. (Source: HTML, Pixel)

**Product mark.** Inside the app mock, the same mark sits centred in the top bar, `48 × 24px`, colour `#0e0e10`. The agent and report icons use an 18px black circle (`#111`) with the mark rotated 45°. (Source: CSS)

**My usage decision.** The build spec puts the company logo top left, as in Planlab's own header, so the workspace reads as a Planlab-shaped account plan. I use the unmodified SVG there, next to the plain-type name "Account assurance". Wherever the logo appears, the single label "Independent concept by Ayo Ahmed, not affiliated with Planlab" is visible on the same screen. The logo is never recoloured, animated or combined into a new mark.

## 3. Typography

| Role | Family | Weight | Size / leading / tracking | Source |
|---|---|---|---|---|
| Hero H1 | HafferXH | 500 | `clamp(38px, 3.9vw, 62px)`, 50px at 1280; lh 1.2; `-0.035em` | CSS |
| Nav cells, CTA | HafferXH | 500 | 16px | CSS |
| Product body | HafferXH | 400 | 12px, lh 1.45 | CSS |
| Product panel title | HafferXH | 500 | 19–20px, `-0.02em` | CSS |
| Product eyebrow | HafferXH | 500 | 10.5px uppercase, `+0.06em` | CSS |
| Capability chip | HafferXH | 500 | 13px/1, `-0.005em` | CSS |
| KPI value | HafferXH | 500 | 20px, `-0.02em` | CSS |
| Monospace (product theme) | Geist Mono | — | — | CSS |

- **Files.** The captured fonts are Haffer XH Regular (`usWeightClass 430`) and Haffer XH Medium (`570`) v4.000, © Displaay Type Foundry, "All rights reserved", with `fsType 8` (editable embedding). The site serves them as `HafferXH` 400 and as `haffer` 400/700, where 700 maps to the Medium file.
- **Licence decision.** The fonts are commercial ("All rights reserved"), and Planlab's web licence does not extend to my domain. So I do not commit, re-host or hotlink them. The concept declares `HafferXH` first, so it renders where the face is installed locally. It then falls back to Inter, an open-source font under the SIL Open Font License that I bundle, whose neutral grotesque proportions sit close to Haffer XH at product sizes, and then to `system-ui`.
- **Manrope.** `source.css` also declares Manrope through a Next.js font class. No element in the captured homepage uses that class, so Manrope is not part of the visible brand.

## 4. Colour

**Website scope** (`.pl-hero` custom properties):

| Token | Hex | Use | Contrast |
|---|---|---|---|
| ink / forest | `#07392d` | H1, primary CTA fill | 12.0:1 on page |
| CTA hover | `#0b4a3b` | | |
| accent / copper | `#b4652f` | Second line of the H1 | 4.05:1 on page: large text only |
| teal | `#1a5f5a` | Focus outline, glow | |
| blue / blue-2 | `#c6dfe9` / `#dcebf1` | Glows, surfaces | |
| peach | `#f7dac5` | Glows, CTA icon, product brand colour | |
| page | `#f4f8f8` | Page wash (Pixel) | |
| line / muted | `#e2eaec` / `#5f7a76` | | |

**Product scope** (`.st` app-stage custom properties and the `--rs-*` Reshaped theme):

| Token | Hex | Use |
|---|---|---|
| ink | `#0e2134` | Text, selected chip, AI button |
| teal | `#3d6585` | Icons, negative series |
| muted | `#5d6b79` | Secondary text (5.5:1 on white) |
| line | `#e3e7eb` | Dividers, tile borders |
| paper | `#f6f6f2` | Top bar (= `--rs-color-background-nav-bar`; Pixel confirms) |
| ground | `#eef0f2` | Canvas, plus a 1px `#0e213412` dot on a 16px grid |
| orange | `#e57528` | Active indicator, send pulse, spinner |
| link | `#0066cc` / `--rs` `#1a73e8` | Source chips |
| positive / green | `#1e7b4a` | Done check, OK pill |
| red / amber | `#c8442f` / `#a86f12` | Flags, caution pills |
| agent | `#8b31d6` | Reshaped agent colour: **not used** (no agent in this concept) |

**Status pills** (`.pill.ok/.cm/.bad/.na`): green on `#e5f3ea` (4.6:1), amber on `#fdf1dc` (3.8:1), red on `#fce9e5` (4.15:1), grey `#66717d` on `#eef1f2` (4.4:1). In the concept, these labels always carry a word, never colour alone.

## 5. Geometry

| Element | Spec | Source |
|---|---|---|
| Page gutter | 40px at 1280; 100 / 16 / 8px at other breakpoints | CSS |
| Header nav cell | white at 80% opacity, `backdrop-filter: blur(18px)`, radius 4px, 60px tall, padding 0 16px, 4px gaps | CSS (59px in Pixel) |
| Primary CTA | forest pill, 52px tall, padding 0 26px, 10px gap, 14px peach diamond icon, shadow `0 10px 24px -12px #07392db3` | CSS |
| Capability chips | 32px pill, `#ffffffd9`, 1px `#0e21341f` border, 18px navy icon circle; active = navy fill with orange icon; 8px gaps | CSS |
| App frame | 680 × 600 stage, radius 14px, ring `0 0 0 1px #0e21341a`, deep soft shadow | CSS |
| Top bar | 44px, paper, bottom border `#0e21341a`, 12px text; workspace badge (peach, `#7a3f12`, radius 3px, 8.5px) | CSS |
| Breadcrumb | `Riverside ⌄ / Phase 1 ⌄`, with "Projects" as an 8.5px muted subtitle under the crumb | CSS + Pixel |
| Top-bar buttons | 24px tall, white, `#0e213424` border, radius 6px, 11px/500; avatar 24px circle, peach with navy border | CSS |
| Report card | white, radius 10px, padding 18 × 20px, shadow `0 24px 60px -32px` plus 1px ring | CSS |
| Agent rail | 200px wide, radius 10px, 41px header ("Loopy" 12.5px/500 + muted "Project agent") | CSS |
| Source chip | `#06c` text, `#0ea5e94d` border, radius 4px, 10.5px/500, 11px stroke icon | CSS |
| Task row | 11.2px; 12px check circle `#1e7b4a` with white tick; pending = orange-topped spinner | CSS |
| Skeleton | 11px bars, radius 6px, 12px gaps, shimmer `#f0f2f4 → #e3e7eb` | CSS |
| KPI tile / note / doc row | radius 8px, 1px line border; flag note has a 3px red left rule on `#fdf0ec` | CSS |
| Table | header cells `#f4f5f7`, muted 10.5px, end caps radius 6px; rows divided `#eef1f4`; tabular figures | CSS |
| Segmented tabs | `#eef0f3` track, radius 9px, padding 3px; current tab white, radius 7px, shadow `0 1px 2px #0e21341f` | CSS |
| Unit grid | 4px base (`--rs-unit-x1…x10` = 4…40px); Reshaped radii 4 / 8 / 12px | CSS |

## 6. Atmosphere

- **Page.** A pale `#f4f8f8` wash under blurred radial glows (blue 95%, peach 85%, teal 16%), plus two soft blue diamonds rotated 45°. It is calm and airy, with no photography in the hero.
- **Product.** Dense and quiet: small type, paper top bar, dotted ground, white cards with hairline rings and long soft shadows. Colour is reserved for state.
- **Motion.** Easing `cubic-bezier(.65, 0, .2, 1)` with 0.2–0.75s transitions. Reduced motion is honoured (`.rm` disables animation).

## 7. What I take from this, and what I leave

**Take:** the product workspace shell (paper top bar, breadcrumb, dotted ground, white report card, narrow right rail), the type ramp, the pill status set, source chips, task-check rows, tables and the 4px grid.

**Leave:**
- the Planlab logo as identity;
- the agent's name and controls, the chat input and the AI button;
- streaming or "thinking" animations;
- any capability chips that imply product features.

The concept is a static research workspace and must not pretend to analyse anything live.

See [STYLE-GUIDE.md](STYLE-GUIDE.md) for how this maps onto the account-assurance build, and the [contact sheet](reference/contact-sheet.png) for the visual reference.
