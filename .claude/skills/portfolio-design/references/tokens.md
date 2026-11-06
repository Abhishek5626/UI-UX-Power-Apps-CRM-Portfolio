# Tokens

The token names live in `src/index.css` (`--theme-*`), `src/pages/case-study-system.css` (`--cs-*`), `src/pages/case-study-motion.css` (`--fx-*`) and `src/pages/landing.css` (`--landing-*`). Use the variable in code, and treat the values here as a guide for mapping.

## Foundation: `--theme-*`

Shared by every page, and switched by `html[data-theme="dark"]`.

| Token | Light | Dark |
|---|---|---|
| `--theme-page` | `#f0f0f0` | `#000000` |
| `--theme-surface` | `#ffffff` | `#161616` |
| `--theme-surface-raised` | `#f3f3f3` | `#141414` |
| `--theme-chip` | `#ebebeb` | `#2a2a2a` |
| `--theme-text` | `#121212` | `#ffffff` |
| `--theme-text-muted` | `#666666` | `#9e9e9e` |
| `--theme-border` | `#ebebeb` | `#2a2a2a` |
| `--theme-accent` | `#00c950` | see `src/index.css` |

Colour changes use `--theme-duration` (400ms) and `--theme-ease`.

## Case study colours: `--cs-*`

| Token | Light | Use |
|---|---|---|
| `--cs-page` | `#f6f6f6` | Page |
| `--cs-toc` / `--cs-toc-current` | `#edf3f2` / `#fcfdfd` | Contents panel |
| `--cs-surface` | `#fff` | Cards |
| `--cs-surface-soft` | `#f9fbfd` | Summary cards |
| `--cs-chip` | `#f4f4f4` | Markers, chips |
| `--cs-border` / `--cs-divider` | `#efefef` / `#e3e3e3` | Hairlines |
| `--cs-heading` | `#403e3e` | H1, H2 |
| `--cs-text` | `#3e3d3d` | Body |
| `--cs-text-soft` / `--cs-text-muted` | `#494949` / `#645e5e` | Secondary |
| `--cs-side-a` / `-ink` | `#e7f0fb` / `#1f64bd` | Workshop side |
| `--cs-side-b` / `-ink` | `#f9eae6` / `#ad4b2f` | Merchant side |
| `--cs-note` / `-ink` | `#fff9f1` / `#96611a` | Notes, assumptions |
| `--cs-before` / `--cs-after` | `#fff5f5` / `#f6fff5` | Before and after |
| `--cs-positive` | `#1b561a` | Positive text |

Status pills use `.fx-pill` with `is-ok`, `is-ask`, `is-person` or `is-rule`, which have dark values already.

## Type: Inter in case studies

| Style | Size / line | Weight | Spacing |
|---|---|---|---|
| H1 | 26 / 36 | 500 | -1.04px |
| H2 | 22 / 28 | 500 | -0.88px |
| H3 | 18 / 24 | 500 | -0.72px |
| H4 | 14 / 22 | 500 | -0.56px |
| B1 | 14 / 24 | 400 | -0.56px |
| B2 | 14 / 22 | 400 | -0.56px |
| B3 | 12 / 18 | 400 | -0.48px |
| Step title | 12 / 16 | 500 | -0.48px |
| Card label | 14 / 18 | 500 | -0.56px |
| Tag, marker | 10 / 14 | 500 | -0.2px |

Phone: H1 22/30, H2 20/26, H3 16/22. Full list in `docs/case-study-design-system.md`.

### Open decision: the panels use a second scale

The animated panels and many newer Figma frames use 13 / 15 / 18 / 28 with tight or no tracking, which differs from the 10 / 12 / 14 / 18 / 22 / 26 scale above. Both are live in Case Study 4.

Don't silently pick one. Until the user decides, follow the frame you've been given. Raise this before the system is applied across the existing case studies.

## Snapping Figma values

Some frames contain near-duplicates that look like hand or tool drift. For **new** work, snap them and report it. For a frame the user asked to match exactly, keep the frame's value and report the drift.

| Figma values | Snap to |
|---|---|
| Text 12.3, 12.5 | 12 or 13, whichever scale the frame uses |
| Text 14.5, 14.75 | 14 or 15, whichever scale the frame uses |
| Ink `#202020`, `#202120`, `#202221`, `#222423`, `#1d1f1e` | `--fx-ink`, or `--cs-heading` in the 10 to 26 scale |
| Grey `#646665`, `#656766`, `#686868`, `#6c6e6c`, `#666868` | `--fx-ink-2` or `--cs-text-muted` |
| Hairline `#e2e7e5`, `#e3e7e4`, `#dee4e1`, `#d8e0de` | `--fx-border` or `--cs-divider` |
| Amber tag `#fdeed0`, `#fff0cd`, `#fbeed3` with `#8a5600`, `#946008`, `#8a5a00` | `.fx-pill.is-ask` |
| Radius 17, 18, 20 | 16 or 18, by nearest role below |

This table is a proposal drawn from how often each value appears in the frames. The user hasn't approved it yet.

## Spacing

4, 6, 8, 10, 12, 14, 16, 18, 22, 24, 32, 34, 46, plus 48, 56 and 72 for wire gutters in diagrams.

| Use | Value |
|---|---|
| Page padding | 72 sides desktop, 24 under 1200, 16 under 810 |
| Contents panel | 319 wide, 46 gap to content |
| Content column | 931 at 1440 |
| Between chapters' sections | 46 (32 on phones) |
| Heading to content | 32 |
| Heading to intro | 12 |
| Card grid gap | 14 |
| Card padding | 12 to 16 |
| Text measure | 563 to 691 |

## Radius

| Value | Use |
|---|---|
| 18 | Contents panel, media, summary card |
| 16 | Panels and diagram cards |
| 12 | Cards |
| 8 | Small rows |
| 99 | Pills, markers |

## Breakpoints

- Under 1200: the shell becomes one column, and the contents panel moves to the top.
- Under 810: phone layout.
- Use container queries for panels whose width depends on the shell, as the diagrams do.

## Landing page

Tokens are in `src/pages/landing.css` and build on `--theme-*`.

| Token | Value |
|---|---|
| `--landing-gap` | 24 |
| `--landing-gutter` | 42, then 28, then 20 |
| `--landing-surface-pad` | 14 |
| Card radius | 18 |

Fonts: "PP Mori" for large headings (46px), "Editor's Note" for the serif accent, Aeonik or "Aeonik Pro" for labels and the loader, Inter as the fallback. Check `src/pages/landing.css` for the exact stack before using one. Glass surfaces use `--landing-glass` and `--theme-glass-*`.
