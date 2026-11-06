---
name: portfolio-type
description: >-
  The type and spacing system for Abhishek's portfolio: Fraunces headings, Geist body, mono labels, line heights,
  tracking, and the gaps between titles, text, containers and sections, plus a method for measuring any reference
  site's type by matching its text to the page. Use this whenever you add or change text, headings, font sizes,
  line height, letter spacing or the gaps around them, on the landing page or a case study, and whenever the user
  says something feels boring, flat or hard to read, or asks to match a site's fonts or spacing. Use it with
  portfolio-design, including for a new case study, even if the request only says "add a section".
---

# Portfolio type

Reading rhythm comes from contrast: a serif title, calm body text, small labels, and a strict gap between them. The Agentic AI case study felt boring when everything sat in one sans at 13px with tight tracking and uneven gaps. Keep that contrast.

## The rules

- **Fonts.** Fraunces for titles, Geist for everything else, JetBrains Mono for code and file names, Departure Mono for step codes and numbers. No other family on new work.
- **Sizes.** Use only the scale in `references/scale.md`. Body text inside containers is 15/23, not 13. Labels are 13/18.
- **Tracking.** `normal` everywhere, with -0.3px on Fraunces only. Tight tracking on sans body text is what made the old pages feel cramped.
- **Weight carries hierarchy.** Inside a container, a 600 name or lead-in over 400 text does more than a size change. Bold the sentence that matters and let the rest be soft.
- **Colour.** Primary `#191919` and soft `#616161`, through `--cs-text` and `--cs-text-soft` so dark mode works. Section text is soft; the bold lead-in is primary.
- **Spacing.** Title to its text is 8px. Text to container is 18px. Container to container is 24px. Section to section is 64px, or 40px on phones. A chapter opening is 12px between its lines and 18px to whatever follows it, including its first section heading.
- **Line length.** Section text stops at 636px and a chapter intro at 720px, so lines stay readable in a wide column.

## Where it lives

- `src/pages/case-study-type.css`: every case study size, loaded last so one file decides.
- `src/pages/landing-type.css`: the landing page's version, scoped to the landing page, its nav and its chat panel.
- `index.html`: loads Fraunces, Geist and JetBrains Mono from Google Fonts. `public/fonts/departure-mono.woff2` comes from the font's own repo.

Change a size in those files, not in a panel's stylesheet. Add a class to the map when a new element appears.

## New case studies

Build every new case study on the Agentic AI page's parts, even when the user gives another site as a reference. `src/pages/CaseStudy5.tsx` is the smallest example.

- **Shell and trail:** `.cs-system`, `.cs-shell`, `.cs-toc` with chapters as tabs, and `.cs-next`.
- **Type:** `.cs-h1` for a chapter title with `.cs-chapter-label`, `.cs-h2` for a section, `.cs-b1` for its text.
- **Order:** header, then body text, then the image, one above the other.
- **Gaps:** 18px from body text to the image or container below it, on every page. Only a new section heading after a container gets more space.

Take only content and section order from another site. The user rejected a page that copied a reference's top bar, sizes and side-by-side columns.

## Landing page limits

The landing page's cards have fixed heights, so its text can't grow freely. Check for clipped text after any size change, at 1536, 1100, 390 and 320. Fraunces runs wide, so on desktop the hero title is 40/44 to stay on one line, and project card titles are 20/24. Strategy detail text is 13/20 to fit its card. The testimonial's long quote already overflowed its surface before this type work.

## Measuring a reference

Don't judge a site's type by eye. Run `scripts/match-type.mjs <reference-url> <your-url> <your-root-selector>`. It matches each piece of the reference's text to the same text on your page, and prints your class with the reference's font, size, line height, weight and tracking. Where the text differs, use its role instead.

Before using a reference's fonts or icons:
- Load fonts from their own open source release, never the reference's files.
- Check the licence of each one.
- Never take a logo, or copy its sentences or claims.

## User decisions that outrank this file

The user's explicit requests win when they conflict with the reference: 46px side margins, `#fbfbfb` and `#020202` backgrounds, the glass badge, the glass navigation panel with numbers in circles. Don't undo these to match a reference more closely.

## Verify

- Run the build, then measure every tab or section at 1536, 1270 and 390 for size, gaps and sideways overflow.
- Look at the result too. A correct measurement can still clip text or crowd a card.
- Check that no text outside the scale appears, except the phone mock-up's own type.
