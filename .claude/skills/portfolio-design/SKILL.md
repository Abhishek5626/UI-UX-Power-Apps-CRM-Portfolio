---
name: portfolio-design
description: >-
  The design system for Abhishek's portfolio: tokens, type, spacing, components and the Figma-to-code workflow. Use this whenever you build or change any visual part of this repo, including the landing page, a new case study, a Figma frame, cards, sections, tables, colours or spacing, even if the request only says "add a section", "match this frame" or "fix the design". Also use it before adding a colour, font size or radius. For animation, use portfolio-motion as well.
---

# Portfolio design system

One system across the landing page and every case study. A value should come from a token here, so that a new page looks related to the others without anyone comparing them by eye.

## Scope, for now

- **New work:** upcoming case studies and any new landing page work follow this skill.
- **Existing case studies:** don't restyle or migrate Case Studies 1 to 4 unless the user asks. That pass is planned as its own job.
- **Landing page changes:** the landing page has its own tokens and look, listed below. Share the `--theme-*` foundation, and don't import case study components into it.

## Order of authority

When sources disagree, the higher one wins:

1. A Figma frame the user points to for that section.
2. What the user says in chat.
3. The tokens in `references/tokens.md`.
4. `docs/case-study-design-system.md`, for component specs and where a value came from.
5. The reference site `surinder.design/saga/case`, for behaviour and structure only.

The Figma file is "Portfolio 2026", key `nF4TDYzTe7viciKXiqcZxJ`. `references/figma-map.md` lists every frame and the section it belongs to.

## Rules

Each one came from a correction or a real defect.

- **Same as the design, or say so.** When the user gives a design, match it. "Close" has been rejected as half done. List every remaining difference plainly, and why it exists.
- **Nothing invented.** Don't add elements, copy or decoration that the design doesn't contain. If something is missing, ask for it or leave a labelled placeholder.
- **Ask for assets first.** Before a build that needs icons or images, tell the user which ones, because they can supply them from Figma. Drawn stand-ins must be reported as stand-ins.
- **Fonts.** The Agentic AI case study uses Geist, Fraunces, JetBrains Mono and Departure Mono at the reference's sizes, by the user's request, all set in `src/pages/case-study-type.css`. Load fonts from their open source releases, never a reference site's files. Landing fonts as listed in `references/tokens.md`.
- **Facts.** Don't present figures or claims from a reference site as true of the user's work. Use the user's Figma text or repo text. Otherwise write finished original copy, never placeholder text, and label anything assumed as a concept or a target.
- **Reference text.** Don't copy a reference site's sentences into the build. Text the user wrote in their own Figma frames is theirs to use, verbatim.
- **Reuse before adding.** Look in `references/components.md` first. A new token or component is a decision, so report it.
- **Light and dark.** Every colour needs a dark value, through `--cs-*` or `--theme-*`. A literal hex with no dark override is a bug unless it's a fixed status colour.
- **Accessibility.** AA contrast, visible focus, real buttons and links, 44px touch targets on phones, and a working layout at 320px.
- **Landing-only effects.** The card nudge and dark card surface belong to the landing page only. The user reverted them from case studies.
- **Git.** Don't commit, push or deploy unless asked. Keep `.env`, `dist`, `node_modules` and `.claude/launch.json` out of commits.

## Building from a Figma frame

1. **Read it.** Dev Mode runs at `http://127.0.0.1:3845/mcp`. The app's Figma connector may be a stale stub, so use `scripts/figma-mcp.mjs`:
   ```bash
   node scripts/figma-mcp.mjs call get_metadata '{"nodeId":"236:2004"}' frame.txt
   node scripts/figma-mcp.mjs call get_design_context '{"nodeId":"236:2562","forceCode":true,"excludeScreenshot":true}' 236-2562.txt
   node scripts/figma-mcp.mjs call get_screenshot '{"nodeId":"236:2562"}' 236-2562-s.txt
   ```
   Image links in that output expire, so run the converter or download images straight after reading a frame.
   Read the output offline and keep only what you need, because these files are large. Layer names are often not the visible text, so match frames to sections using the text inside the generated code.
2. **Check the width.** The case study column is 931px. A frame at 931 can be built to exact size. A wider one has to reflow: columns narrow and text wraps. Tell the user which is which. Reflow keeps the arrangement: don't turn a row of 4 into a 2 × 2 grid, because the user rejected that. Use the reference's type sizes, and tighten spacing if it's needed to fit.
3. **Choose how to build.**
   - Exact-fit or small frames: write plain TSX and CSS by hand.
   - Large static frames: `scripts/figma_to_css.py` converts Dev Mode code to TSX and plain CSS. Fixed widths flex and fixed heights become minimums.
   - Frames with absolute layout: hand-write them in normal flow. The converter gives them zero height.
   - Interactive frames (sliders, tabs): restyle the working component. A static copy would lose the behaviour.
4. **Apply tokens.** Map Figma values to tokens using the snapping table in `references/tokens.md`, and report anything that doesn't map.
5. **Wire in, delete what it replaces,** including data and CSS that nothing uses any more.
6. **Verify.** Measure the element against the frame, and view your render beside the Figma export. Check 1440, 1200, 390 and 320, reduced motion and dark mode. Run `npm run build`. Report only checks you ran, and say which you only measured and which you looked at.

## Traps

- `.cs-system p` resets margin and padding, so write `.cs-system .my-class` for rules on `p`, `ol`, `ul` and `h*`.
- Other case study stylesheets stay loaded after navigating. Before adding a `.cs-*` class, grep `case-study.css`, `case-study-1.css` and `case-study-2.css`.
- Tailwind's reset is absent, so converted code needs `border-width: 0` first, or a one-sided border draws the others at 3px.
- Case studies live in a drawer that scrolls `.project-drawer-scroll`, not the window. Use it as the scroll root.
- `/#/case-study-N` works in production. The direct path `/case-study-N` returned a 404 when last checked, as there's no `vercel.json` rewrite.

## Chat in a case study

Add a case study to the chat with one entry in `askStudies` in `src/components/AskDock.tsx` and one in `STUDIES` in `api/ask.ts`, written from what the page says. Suggested questions go straight to outcomes, time and results.

## Type and spacing

Use the `portfolio-type` skill for fonts, sizes, line height, tracking and the gaps around text.

## Reference files

- `references/tokens.md`: colour, type, spacing, radius, breakpoints, landing tokens and the snapping table. Read before writing CSS.
- `references/components.md`: what exists and where. Read before building anything new.
- `references/figma-map.md`: every frame, its link and its section. Read when working from Figma.
