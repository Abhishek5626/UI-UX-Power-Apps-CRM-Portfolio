# Case study design system

Shared styles and components for case studies. Implemented in `src/pages/case-study-system.css` and used by Case Study 4. The three older case studies don't use it.

## Where each value comes from

| Label | Meaning |
|---|---|
| **Figma** | Read from Figma Dev Mode, node `182:17`. Exact |
| **Saga** | Computed style measured on the live reference page |
| **Repo** | Already in this codebase |
| **Proposal** | My recommendation. Not in either source |

Unlabelled values in the Figma tables below are Figma values.

### Sources

- **Figma:** "Portfolio 2026", node `182:17`, "Desktop - 4", 1440 × 3624. Read through the Dev Mode server: metadata, generated code, variables and motion.
- **Reference:** `surinder.design/saga/case` and its routes `research`, `proposal`, `trust`, `journeys`, `prototype`, `system`. Credited on the page to Surinder T. Light only: it ignores a dark colour-scheme preference and has no theme toggle.

### What Figma doesn't define

- **Variables:** none. `get_variable_defs` returns empty, so every colour is a hard-coded hex. The token names below are mine.
- **Motion and prototyping:** none. `get_motion_context` returns empty.
- **Hover, focus and active states:** none in this frame.
- **Dark mode:** none in this frame.
- **Phone layout:** none for this design. The phone frame next to it is an unrelated food-delivery screen.

Only node `182:17` was read in detail. Other frames on the canvas are out of this audit.

> **Content warning.** The Figma frame's copy is the reference site's text ("Agents take the order", "Saga Commerce"). Treat it as a layout placeholder. It should not ship as original work without being rewritten or credited.

## Typography

### Fonts

**Inter only**, weights 400 and 500 (Figma). Both are already loaded from Google Fonts (Repo).

```css
font-family: Inter, sans-serif;
```

Saga uses Fraunces, Geist and Departure Mono. **Don't adopt them**: Figma is the source of truth.

Letter spacing follows two rules in Figma: **-0.04em** on page content, and **-0.02em** on the TOC, pills and step text.

### Text styles

All Figma unless marked. Desktop values.

| Style | Size / line | Weight | Spacing | Colour | Used for |
|---|---|---|---|---|---|
| **H1** | 26 / 36 | 500 | -1.04px | `#403e3e` | Page title |
| **H2** | 22 / 28 | 500 | -0.88px | `#403e3e` | Section heading |
| **H3** | 18 / 24 | 500 | -0.72px | `#3e3d3d` | Summary card statement |
| **H4** | 14 / 22 | 500 | -0.56px | `#3e3d3d` | Role card title |
| **B1** | 14 / 24 | 400 | -0.56px | `#3e3d3d` | Page and section intro |
| **B2** | 14 / 22 | 400 | -0.56px | `#3e3d3d` | Summary card lead |
| **B3** | 12 / 18 | 400 | -0.48px | `#3e3d3d` | Card body text. `#645e5e` for bullets |
| Step title | 12 / 16 | 500 | -0.48px | `#3e3d3d` | Comparison steps and panel headings |
| Step body | 12 / 22 | 400 | -0.24px | `#494949` | Comparison text, assumption notes |
| Card label | 14 / 18 | 500 | -0.56px | `#3e3d3d` | Summary cell title |
| Side header | 14 / 24 | 500 | -0.56px | semantic | Tinted column heading |
| Role label | 12 / 18 | 500 | -0.48px | semantic | "Buyer" |
| Metadata title | 14 / normal | 500 | -0.56px | `#3e3d3d` | Top-right project line |
| Metadata | 12 / normal | 400 | -0.48px | `#3e3d3d` | Top-right sub-line |
| Tag and marker | 10 / 14 | 500 | -0.2px | `#6f6a6a` * | "North star", "Assumption", numbers |
| Status pill | 12 / 16 | 400 | -0.24px | `#3a3838` | "Shipped" |
| TOC item | 16 / normal | 500 | -0.32px | `#373737` | Section name |
| TOC subtitle | 14 / normal | 400 | -0.28px | `#757575` | Current section's description |
| TOC number | 14 / normal | 500 | -0.28px | `#373737` | Section number |
| Note label | 14 / 18 | 400 | -0.56px | `#3e3d3d` | "Why I decided this" |
| Note text | 14 / 24 | 400 | -0.56px | `#96611a` * | Decision note rows |
| Timing label | 12 / 18 | 500 | -0.48px | `#6e6e6e` * | "About an hour" |
| Timing text | 12 / 18 | 400 | -0.48px | `#6e6e6e` * | Timing description |
| Caption (Proposal) | 12 / 18 | 400 | -0.48px | `#494949`, centred | Under media. Not in Figma |
| Quote (Proposal) | 22 / 28 | 500 | -0.88px | `#403e3e` | Same as H2. Not in Figma |
| Strong (Proposal) | inherit | 500 | inherit | inherit | Inline emphasis. This frame has none, Saga uses 600 |

\* Darkened from Figma's colour to meet AA. See [Contrast](#contrast).

**Phone sizes (Proposal, none in Figma):** H1 22/30, H2 20/26, H3 16/22. Body styles stay the same, since they're already small. Use `text-wrap: balance` on H1 and H2.

## Layout

All Figma unless marked.

| Token | Value | Notes |
|---|---|---|
| Frame | 1440 | Page padding 72 sides, 54 top, 162 bottom |
| TOC width | 319 | Padding 8 top, 8 sides, 18 bottom. Item gap 34 |
| Shell gap | 46 | TOC to content |
| Content width | 931 | Fills the remainder |
| Section gap | 46 | Between sections. Saga uses 64 |
| Header stack | 34 | Title block to media |
| Title stack | 14 | Status, H1 and intro |
| Inside a section | 32 | Heading to content |
| Heading to intro | 12 | |
| Column gap | 32 | Two-column role layout |
| Column header to cards | 18 | |
| Card grid gap | 14 | Three-cell summary |
| Card padding | 12-16 | 16 summary, 14 role, 12 cells |
| Text measure | 563-691 | Intro paragraphs don't run full width |
| Media height | 297 | Placeholder only |
| Phone margin (Proposal) | 16 | Saga |
| Phone section gap (Proposal) | 32 | Scaled from 46 |

**Spacing scale, from values Figma uses most:** 4, 6, 8, 10, 12, 14, 18, 22, 24, 32, 34, 46.

**Radius:**

| Radius | Used for |
|---|---|
| 18 | TOC panel, media, summary card |
| 16 | Current TOC row |
| 12 | Cards, side headers, comparison panels |
| 8 | Decision note rows |
| 99 | Pills, number markers |
| 2 | Small "North star" tag |

**Breakpoints (Repo):** collapse the two-column shell below **1200px**, where Case Study 2 already changes layout. Phone rules apply below **810px**.

Content is fixed at 931 in Figma. The summary card is 929, a 2px mismatch in the frame, so build it fluid at 100%.

## Colour tokens

Light values are Figma, except four inks darkened for contrast. Figma has no variables, so the names are mine. **Every dark value is a Proposal**, built on the portfolio's existing tokens so the theme toggle keeps working.

```css
.cs-system {
  --cs-page: #f6f6f6;
  --cs-toc: #edf3f2;
  --cs-toc-current: #fcfdfd;
  --cs-surface: #ffffff;
  --cs-surface-soft: #f9fbfd;
  --cs-chip: #f4f4f4;
  --cs-media: #e2dcdc;

  --cs-heading: #403e3e;
  --cs-text: #3e3d3d;
  --cs-text-soft: #494949;
  --cs-text-muted: #645e5e;
  --cs-text-faint: #757575;
  --cs-marker: #6f6a6a; /* Figma #878181 */

  --cs-border: #efefef;
  --cs-border-soft: #f6f6f6;
  --cs-divider: #e3e3e3;

  --cs-side-a: #e7f0fb;
  --cs-side-a-ink: #1f64bd;
  --cs-side-b: #f9eae6;
  --cs-side-b-ink: #ad4b2f; /* Figma #c0573a */
  --cs-note: #fff9f1;
  --cs-note-ink: #96611a; /* Figma #9f681d */
  --cs-before: #fff5f5;
  --cs-after: #f6fff5;
  --cs-timing-ink: #6e6e6e; /* Figma #7c7c7c */

  --cs-focus: #403e3e; /* Proposal */
}

html[data-theme="dark"] .cs-system {
  /* All Proposal */
  --cs-page: var(--theme-page);
  --cs-toc: var(--theme-surface);
  --cs-toc-current: var(--theme-chip);
  --cs-surface: var(--theme-surface);
  --cs-surface-soft: var(--theme-surface-raised);
  --cs-chip: var(--theme-chip);
  --cs-media: var(--theme-chip);

  --cs-heading: var(--theme-text);
  --cs-text: var(--theme-text);
  --cs-text-soft: var(--theme-text-muted);
  --cs-text-muted: var(--theme-text-muted);
  --cs-text-faint: var(--theme-text-muted);
  --cs-marker: #bdbdbd;

  --cs-border: var(--theme-border);
  --cs-border-soft: var(--theme-border);
  --cs-divider: var(--theme-border);

  --cs-side-a: #18233a;
  --cs-side-a-ink: #8db7f2;
  --cs-side-b: #331e1a;
  --cs-side-b-ink: #f0a48f;
  --cs-note: #2b2318;
  --cs-note-ink: #f0bd6b;
  --cs-before: #2a1a1a;
  --cs-after: #18261a;
  --cs-timing-ink: var(--theme-text-muted);

  --cs-focus: #ffffff;
}
```

### Contrast

Measured against WCAG AA, which asks for 4.5:1 on text this small.

**Adopted fixes.** These Figma pairs fell short, so the system uses darker inks. Update Figma to match, or the two will drift:

| Figma pair | Ratio | System uses | New ratio |
|---|---|---|---|
| `#878181` marker on `#f4f4f4` | 3.48 | `#6f6a6a` | 4.84 |
| `#878181` tag on `#ffffff` | 3.83 | `#6f6a6a` | 5.32 |
| `#c0573a` on `#f9eae6` | 3.85 | `#ad4b2f` | 4.69 |
| `#7c7c7c` on `#fff5f5` | 3.90 | `#6e6e6e` | 4.77 |
| `#7c7c7c` on `#f6fff5` | 4.08 | `#6e6e6e` | 4.99 |
| `#9f681d` on `#fff9f1` | 4.49 | `#96611a` | 4.99 |

**Passing:** all headings and body text (9:1 or higher), `#757575` TOC subtitle (4.52), `#645e5e` bullets (6.35), `#1f64bd` on `#e7f0fb` (5.05).

**Dark pairs, all passing:** white text on the surface (18.1), muted text (6.75), marker `#bdbdbd` on chip (7.64), side A (7.6), side B (7.76), note (8.99), muted on before (6.22) and after (5.89).

### Interactive states (Proposal)

Figma has none.

| State | Treatment |
|---|---|
| Hover | Surface shifts one step, 200ms (Saga: 0.2s on TOC rows) |
| Focus | 2px `--cs-focus` outline, 2px offset, matching the How I Work dialog (Repo) |
| Current | `--cs-toc-current`, with `aria-current` |
| Reduced motion | No smooth scrolling, no transitions on position |

## Components

**Observed** means it's in the reference. **Recommended** means I'm adding it. **Figma** means it's in frame `182:17`, with its values.

### `CaseToc`: sticky table of contents

Purpose: orientation and jumping within a long page. Figma, and Observed with one big difference.

**Figma:** panel 319 wide, `--cs-toc`, radius 18. Current row: `--cs-toc-current`, radius 16, padding 18, number and text 22 apart, subtitle 6 below the name. Other rows are 34 apart. The footer link ("Earlier work") has no number. All rows currently read "Situation", which is placeholder text.

**Observed:** the Saga sidebar is **not a scroll tracker**. Each item is a separate route, marked `aria-current="page"`, and the marker didn't move while scrolling. It also isn't `position: sticky`: it stays still because the content column is the scroller.

**Recommended:** in-page tracking, since one page per chapter would be much more content.

- **Structure:** `nav` with `aria-label`, ordered list, rows of number + name + optional subtitle, optional footer link.
- **Sticky:** `position: sticky; top: 24px`, inside the scroller.
- **Active section:** an `IntersectionObserver` with `.project-drawer-scroll` as its root. The current link gets `aria-current="location"`.
- **Phone:** Saga shows all items wrapped in a static panel at the top. Recommended: the same, static and not sticky, so it never covers content.
- **Keyboard:** native links in tab order, visible focus. Focus moves to the target heading on activation.
- **States:** default, hover, current, focus.
- **Configurable:** items, subtitles, footer link, numbered or not.

> **In this repo:** case studies are routed by hash (`#/case-study-1`), but `href="#section"` is safe: `ProjectDrawer` intercepts in-page links, moves focus to the target and scrolls it into view. Scrolling happens in `.project-drawer-scroll`, not the window, and its 88px `scroll-padding-top` already clears the drawer's controls, so sections need no scroll margin.

### `CaseHeader`: page header

Figma. Status pill (reuse `ShippedBadge`, Repo), H1, B1 intro at most 563 wide, with right-aligned metadata opposite. Stack the metadata under the title on phones (Proposal).

### `SectionHeader`: heading and numbered marker

Figma has H2 + B1, 12 apart. Observed in Saga, which adds a marker ("01 Situation").

- **Structure:** optional marker, H2, optional intro.
- **Responsive:** type steps down at 810px.
- **Interactive:** none. Needs `scroll-margin-top` of 16-24px (Saga).
- **Configurable:** marker, intro width.

### `DecisionNote`: suggestion or insight callout

Figma, Observed (`WhyNote`). Explains why a decision was made, which suits a case study well.

- **Figma:** white card, radius 12, padding 12. Header: 22px marker + note label, 8 apart. Then rows 10 apart: `--cs-note`, radius 8, padding 12, note text.
- **Saga:** one soft card with three columns divided by hairlines.
- **Responsive:** rows are already stacked, so nothing changes on phones.
- **Interactive:** none.
- **Configurable:** label, tag, number of rows.

### `Tag`: small marker

Figma, Observed. Marker text on white, padding 2 and 4, radius 2 ("North star"). Also a 22px round number marker on `--cs-chip`. Not interactive.

### `MediaFrame`: image or video with caption

Figma placeholder, Observed (`figure` and `figcaption`).

- **Structure:** `figure`, media, optional caption. Keep real `alt` text.
- **Figma:** full content width, 297 tall, radius 18.
- **Responsive:** fills the width. Set an aspect ratio to avoid layout shift.
- **Video (Recommended):** no autoplay under reduced motion. Keep controls reachable. Saga has no `video` or `img` on the routes surveyed: its figures are live diagrams.
- **Configurable:** ratio, caption, background.

### `SummaryCard`: north star and metrics

Figma, Observed. Headline claim plus three facts.

- **Figma:** `--cs-surface-soft`, 1px `--cs-border-soft`, radius 18, padding 16, gap 14. Tag, then H3 and B2 (8 apart), then three white cells 14 apart: padding 12, radius 12, number marker, card label, B3.
- **Responsive:** cells stack below 810px (Proposal).
- **Configurable:** cell count (2-4), tag.

### `MetricStat`: metric callout

Recommended, based on the existing stats tiles (Repo). Neither source has a large-number metric. Value, label, optional context. Use `Tag` to mark assumptions.

### `PullQuote`: quote

Recommended. **Neither source has one**: all surveyed routes have zero `blockquote` elements. Use `blockquote` and `cite`. Only build it when a case study has a real quote to show.

### `RoleColumns`: roles under tinted headers

Figma, Observed.

- **Figma:** two columns 32 apart. Header 52 tall, radius 12, padding 14, tinted with centred side header text, then cards 18 below. Card: white, 1px `--cs-border`, radius 12, padding 14/14/18, gap 10. Role label, H4 (6 apart), then bullets.
- **Responsive:** columns stack on phones (Proposal).
- **Configurable:** tone per column, cards per column.

### `ComparePanel`: before and after

Figma, Observed.

- **Figma:** two white panels side by side with no gap, outer corners radius 12. Each has a heading and step body text (padding 12), a tinted timing box (`--cs-before` or `--cs-after`, radius 12, padding 12), then step rows. Rows: 18 vertical padding, 1px `--cs-divider` below. Number marker 22, gap 12, step title and step body 6 apart.
- **Responsive:** columns stack on phones, so row alignment is lost and each side reads on its own (Saga).
- **Configurable:** steps, marker (number or check), timing box.

### `TextMedia`: common text-and-media layouts

Recommended, with stacked as Figma's only observed layout.

| Variant | Use | Phone |
|---|---|---|
| `stacked` | Heading, intro, then full-width media (Figma) | Same |
| `split` | Text beside media, 1:1 | Stacked |
| `offset` | Narrow text column, wider media | Stacked |

### `NextLink`: next chapter

Observed only. Recommended: reuse the existing `CaseStudyFooter` (Repo) rather than building another.

### Observed but not recommended yet

- **Fixed gradient background** (`Scene`): out of keeping with the portfolio's flat case study pages, and not in frame `182:17`.
- **`Term` tooltip:** needs careful touch and keyboard handling. Add it only if a case study needs it.
- **Interactive diagrams** (`TrustDial`, `AgentFlow`, `JourneyMap`): specific to that story, not general components.

## Using this later

Add tokens and components as each section needs them, so there's a real page to test them against. Unused CSS would ship to visitors and drift from this document.

Reuse what exists: `ShippedBadge`, `CaseStudyFooter`, `.project-drawer-scroll`, `--theme-*` tokens.

The three existing case studies have their own type scales and layouts. Don't migrate them as part of adding this system.
