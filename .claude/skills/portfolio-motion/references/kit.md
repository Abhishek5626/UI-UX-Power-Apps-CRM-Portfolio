# Motion kit

Code: `src/pages/caseStudyMotion.tsx`. Styles: `src/pages/case-study-motion.css`.

## API

| Export | Does |
|---|---|
| `ENTER` | `cubic-bezier(0.19, 1, 0.22, 1)`, for things arriving |
| `TRAVEL` | `cubic-bezier(0.37, 0, 0.63, 1)`, for things moving along a path |
| `prefersReducedMotion()` | Reads the media query |
| `enter(el, delay, from = 0.35)` | Fade up from dimmed, 250ms |
| `pop(el, delay)` | Scale 0.92 to 1 with a fade, 250ms |
| `pulse(el, delay, duration = 1100, color)` | Outline flash. The element needs `.fx-step` |
| `travelLight(el, delay, duration)` | Light along a straight wire. `--rf-light-end` sets direction |
| `playWire(start, { trace, light, ring, word, target, tone, duration, fadeAfter, fadeFor })` | A full wire: trace, light, label highlight, arrival ring, target outline, then the trace fades. Returns `{ run, duration }` |
| `useRun(build)` | Builds a paused run, plays it once at 25% in view, and returns `{ rootRef, replay, stop, status, togglePause }` |
| `PlayButton({ label, pause, onClick })` | The pill control |
| `Beats({ steps, children })` | Elements rise in one after another, with no control |
| `useReveal(rootRef, chapter)` | Sections fade and rise 12px on arrival, 500ms |

CSS classes: `.fx-play`, `.fx-step`, `.fx-wire`, `.fx-wire-trace`, `.fx-wire-light`, `.fx-wire-ring`, `.fx-word`, `.fx-pill`, `.fx-reveal`, `.af-status`. Wire colour comes from `--wire-ink`.

## Measured timings

From the reference's own calls.

| Effect | Timing |
|---|---|
| Wire duration | `600 + length × 5/3` ms, clamped 800 to 2000. Tighter panels use their own clamp |
| Next wire | Previous end plus 500ms, or 1000ms on the long Journeys path |
| Trace fade | 900ms ease-out, 1100ms after arrival |
| Arrival | At 92% of the wire |
| Ring | 1000ms, `cubic-bezier(0.2, 0, 0, 1)`, scale 0.6 to 2.2, peak 0.7 opacity at 20% |
| Card outline | 1100 or 1400ms ease-out, peak at 25% |
| Fixed-step flows | 1250ms (Research), 750ms (Trust rows), 1300ms (Vision), 450ms (decision table rows) |
| Hero beat | 250ms linear, 6px rise, at 200, 900, 1600ms |
| Dimmed state | 0.35 to 0.45 opacity |
| Caption swap | 200 to 400ms, blur 2px, rise 4px |
| Brand colour | 400ms ease-in-out |
| Hover | 150ms `cubic-bezier(0.2, 0, 0, 1)` |
| Chat | Typing dots 1200ms with 150ms stagger. Screen swap: out 560ms, in 500ms with 60ms delay |
| Breathing dot | 4s ease-in-out, scale 0.85 to 1 |

## Which panel to copy

| Need | Copy |
|---|---|
| Row of cards with straight wires and a loop | `ResearchFlow.tsx` |
| Numbered steps, trace, light, gate pill | `FirstTest.tsx` |
| Routed wires between cards, with phone variant | `AgentFlow.tsx` |
| Wires ending at different lengths, gates popping as the light passes | `ThresholdFlow.tsx` |
| Pause and Resume, selection following the run, click to take over | `OrderPath.tsx` |
| Moving caption, fan-out wires, flashing layers | `SystemFlow.tsx` |
| State swap travelling along a chain, faster each pass | `TokenStory.tsx` |
| Something assembling itself as lights arrive | `SkillRun.tsx` |
| Fixed-position dots and a shared trace fade | `VisionBoard.tsx` |
| Rows lighting in turn with rings on key marks | `TeamMap.tsx` |
| Multi-step scripted story with phones and chat | `VoicePath.tsx` |
