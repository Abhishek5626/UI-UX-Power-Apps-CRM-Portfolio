---
name: portfolio-motion
description: >-
  How to build and match web animations in Abhishek's portfolio: the shared motion kit, measured timings, wire and light diagrams, playback controls, and the method for copying an animation from a reference site frame by frame. Use this whenever you add, change, fix or compare any animation, transition, autoplay, play or pause control, hover motion or diagram in this repo, even if the request only says "make it move", "match this animation" or "it doesn't look the same". Use it with portfolio-design. It covers live website motion, not rendered videos.
---

# Portfolio motion

Animations here run on the browser's Web Animations API and CSS, through one small kit. There's no animation library, and adding one needs a real reason.

## Reuse first

Tokens are limited and the same pieces keep recurring, so look in `src/pages/caseStudyMotion.tsx` before writing anything. `references/kit.md` lists what it provides and which panel shows each pattern. If two panels need the same behaviour, move it to the kit.

## Matching a reference

The user judges by whether it's the same, and has rejected versions that approximated the motion on existing cards as half done. A still screenshot can't tell you an animation, so measure it.

1. **Inspect one animation.** `scripts/inspect-animation.mjs <url> <CSS-module-name> "<play button text>"` logs every `element.animate` call with its delay, duration, easing, fill and keyframes, plus CSS animations and the module's CSS rules. Note initial state, end state, replay, mid-run click, hover, phone and reduced motion.
2. **Say what you couldn't observe,** rather than guessing. An effect that never fired stays unconfirmed.
3. **Match the structure too.** If the reference's layout is what makes the motion read, approximating it on other cards won't look the same. Rebuild it, and say which old section it replaces.
4. **List needed assets before building,** so the user can supply them from Figma.
5. **Build with the kit and the measured numbers.** Fit durations to your own layout using the reference's rule, not its literal lengths.
6. **Compare frame by frame.** Capture the reference and your build at the same moments, side by side, at 1440 and 390. Compare the animation call count too. Fix what differs and report what's left.
7. **Stop after one animation** when the user is reviewing one by one.

## Rules

- **Motion properties.** Prefer `transform` and `opacity`. Colour, outline and `stroke-dashoffset` are fine for short runs. Don't animate layout properties.
- **Reduced motion.** Match the reference where it's known: usually no autoplay, the finished state at rest, and Play plus travelling parts hidden with `display: none`. Check this for each panel.
- **Controls.** Use a real `<button>`, keyboard operable, with 44px height on phones. A click mid-run restarts from the beginning unless the panel has Pause.
- **One run at a time.** Cancel the old run before building a new one. `useRun` does this.
- **State changes during a run.** Make them cues inside the run, so they restart and pause with it. See below.
- **Final state.** When a run ends, the stylesheet's resting state takes over. Don't leave `fill: both` holding the end state.
- **Live site only.** The `huashu-motion` skill makes rendered videos from GSAP compositions. It isn't for this site's runtime animation.

## Pattern: a panel with a run

```tsx
const { rootRef, replay } = useRun<HTMLElement>((root) => {
  measure(root)
  if (prefersReducedMotion()) return []
  const run: Animation[] = []
  const cue = (delay: number, action: () => void) => {
    const animation = root.animate([], { delay, duration: 1 })
    animation.onfinish = action
    run.push(animation)
  }
  run.push(enter(root.querySelector('.card')!, 200))
  cue(4912, () => setNow(null))
  return run
})
```

Empty animations act as timers, so a Pause holds them too. Plain `setTimeout` would keep firing.

## Traps

- `useRun` sets `onfinish` on the last-ending animation. If that animation is a cue, its action has to still run. The kit chains it now, so keep that in place if you edit `prepare`.
- Don't use `Element.animate` on a `display: none` element, and remember wires are hidden on some phone layouts, so `measure` has to handle them.
- Measure wire paths with a `ResizeObserver`, and again before each run, or they drift when the shell changes width.
- Traces need `pathLength={1}` with `stroke-dasharray: 1`, and arrowheads go on the base wire, not the trace.
- `offset-path` needs a `path("...")` string, set in the same pixel space as the wires' SVG.
- `getTotalLength()` depends on layout, so call it after `measure`.
- `IntersectionObserver` uses the viewport here at `threshold: 0.25`. On very tall panels 25% may never fit, so lower it.
- Capture by scrolling first: `useReveal` hides sections until they've been in view, and the drawer's bottom blur can make the last lines look wrong in screenshots.

## Reference file

`references/kit.md`: the kit's API, measured timings and which panel to copy for each pattern. Read before building.
