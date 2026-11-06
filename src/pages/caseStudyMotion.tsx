import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import './case-study-motion.css'

// Timings measured from the reference's own animation calls.
export const ENTER = 'cubic-bezier(0.19, 1, 0.22, 1)'
export const TRAVEL = 'cubic-bezier(0.37, 0, 0.63, 1)'

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Dims an element until its turn. */
export const enter = (element: Element, delay: number, from = 0.35) =>
  element.animate([{ opacity: from }, { opacity: 1 }], { delay, duration: 250, easing: ENTER, fill: 'both' })

/** Flashes an element's outline; it needs the fx-step class for the outline to show. */
export const pulse = (element: Element, delay: number, duration = 1100, color = 'var(--fx-ink)') =>
  element.animate([{ outlineColor: color, offset: 0.25 }], { delay, duration, easing: 'ease-out' })

/** The light travelling along a straight wire; --rf-light-end sets the direction. */
export const travelLight = (element: Element, delay: number, duration: number) =>
  element.animate(
    [
      { opacity: 0 },
      { opacity: 1, offset: 0.12 },
      { opacity: 1, offset: 0.88 },
      { opacity: 0, transform: 'var(--rf-light-end)' },
    ],
    { delay, duration, easing: TRAVEL, fill: 'both' },
  )

/**
 * One wire's run, using the reference's keyframes: trace, light, label, then a ring
 * and outline as it arrives at 92%. Takes 600ms plus 5ms for every 3px, within 800 to 2000ms.
 */
export function playWire(
  start: number,
  {
    trace,
    light,
    ring: spot,
    word,
    target,
    tone,
    duration = Math.min(2000, Math.max(800, 600 + (trace.getTotalLength() * 5) / 3)),
    fadeAfter = 1100,
    fadeFor = 900,
  }: { trace: SVGPathElement; light: Element; ring?: Element; word?: Element; target?: Element; tone: string; duration?: number; fadeAfter?: number; fadeFor?: number },
) {
  const arrive = start + duration * 0.92
  const lit = { color: 'var(--fx-ink)', borderColor: tone }
  return {
    duration,
    run: [
      trace.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { delay: start, duration, easing: TRAVEL, fill: 'both' }),
      trace.animate([{ opacity: 1 }, { opacity: 0 }], { delay: start + duration + fadeAfter, duration: fadeFor, easing: 'ease-out', fill: 'both' }),
      light.animate(
        [
          { offsetDistance: '0%', opacity: 0 },
          { opacity: 1, offset: 0.12 },
          { opacity: 1, offset: 0.88 },
          { offsetDistance: '100%', opacity: 0 },
        ],
        { delay: start, duration, easing: TRAVEL, fill: 'both' },
      ),
      ...(word
        ? [
            word.animate(
              [
                { ...lit, offset: 250 / (duration + 1000) },
                { ...lit, offset: (duration + 250) / (duration + 1000) },
              ],
              { delay: start, duration: duration + 1000, easing: 'ease-in-out' },
            ),
          ]
        : []),
      ...(spot
        ? [
            spot.animate(
              [
                { opacity: 0, transform: 'scale(0.6)' },
                { opacity: 0.7, transform: 'scale(1)', offset: 0.2 },
                { opacity: 0, transform: 'scale(2.2)' },
              ],
              { delay: arrive, duration: 1000, easing: 'cubic-bezier(0.2, 0, 0, 1)', fill: 'both' },
            ),
          ]
        : []),
      ...(target ? [pulse(target, arrive, 1400, `color-mix(in oklab, ${tone} 45%, transparent)`)] : []),
    ],
  }
}

/** A small element popping into place. */
export const pop = (element: Element, delay: number) =>
  element.animate(
    [
      { opacity: 0, transform: 'scale(0.92)' },
      { opacity: 1, transform: 'scale(1)' },
    ],
    { delay, duration: 250, easing: ENTER, fill: 'both' },
  )

/**
 * Builds a paused run on mount, so the dimmed first state shows straight away.
 * Plays once on arrival, and never by itself for people who prefer less motion.
 * When the run ends, the stylesheet's resting state takes over.
 */
export function useRun<T extends HTMLElement>(build: (root: T) => Animation[]) {
  const rootRef = useRef<T>(null)
  const runRef = useRef<Animation[]>([])
  const observerRef = useRef<IntersectionObserver>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'paused'>('idle')

  const stop = () => {
    observerRef.current?.disconnect()
    runRef.current.forEach((animation) => animation.cancel())
    setStatus('idle')
  }
  const prepare = (root: T) => {
    const run = build(root)
    runRef.current = run
    run.forEach((animation) => animation.pause())
    if (!run.length) return
    const end = (animation: Animation) => animation.effect?.getComputedTiming().endTime ?? 0
    const last = run.reduce((a, b) => (Number(end(b)) >= Number(end(a)) ? b : a))
    const lastCue = last.onfinish
    last.onfinish = (event) => {
      lastCue?.call(last, event)
      run.forEach((animation) => animation.cancel())
      setStatus('idle')
    }
  }
  const replay = () => {
    stop()
    if (!rootRef.current) return
    prepare(rootRef.current)
    runRef.current.forEach((animation) => animation.play())
    setStatus('running')
  }
  // Only what was mid-run: play() on a finished animation would start it over.
  const togglePause = () => {
    const paused = status === 'paused'
    runRef.current
      .filter((animation) => animation.playState === (paused ? 'paused' : 'running'))
      .forEach((animation) => (paused ? animation.play() : animation.pause()))
    setStatus(paused ? 'running' : 'paused')
  }

  useEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return
    prepare(root)
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        runRef.current.forEach((animation) => animation.play())
        setStatus('running')
      },
      { threshold: 0.25 },
    )
    observer.observe(root)
    observerRef.current = observer
    return stop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { rootRef, replay, stop, status, togglePause }
}

export function PlayButton({
  label = 'Play the flow',
  pause,
  onClick,
}: {
  label?: string
  pause?: boolean
  onClick: () => void
}) {
  return (
    <button className="fx-play" type="button" onClick={onClick}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path
          d={pause ? 'M3.5 2v8M8.5 2v8' : 'M3 1.75v8.5L10 6 3 1.75Z'}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </button>
  )
}

/** The reference's hero beat: existing elements rise in one after another, once, with no control. */
export function Beats({ steps, children }: { steps: string; children: ReactNode }) {
  const { rootRef } = useRun<HTMLDivElement>((root) =>
    [...root.querySelectorAll(steps)].map((step, i) =>
      step.animate([{ opacity: 0, transform: 'translateY(6px)', offset: 0 }], { delay: 200 + 700 * i, duration: 250, fill: 'both' }),
    ),
  )
  return (
    <div ref={rootRef} className="fx-run">
      {children}
    </div>
  )
}

/** Fades each section of a chapter in as it arrives. */
export function useReveal(rootRef: RefObject<HTMLElement | null>, chapter: string) {
  useLayoutEffect(() => {
    const sections = rootRef.current?.querySelectorAll('.cs-chapter > *')
    if (!sections) return
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-in')
        observer.unobserve(entry.target)
      }
    })
    sections.forEach((section) => {
      section.classList.add('fx-reveal')
      observer.observe(section)
    })
    return () => observer.disconnect()
  }, [rootRef, chapter])
}

/** A reference icon by name, or a hand-drawn path where the reference draws its own. */
export function Glyph({ icon }: { icon: string }) {
  if (icon.startsWith('M'))
    return (
      <svg className="fx-glyph" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d={icon} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  return <span className="fx-glyph is-mask" style={{ maskImage: `url(/case-study-4/icons/${icon}.svg)` }} />
}
