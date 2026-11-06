import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react'
import {
  employment,
  statedExperienceYears,
  timelineEnd,
} from './workExperienceContent.ts'
import './work-experience.css'

/*
  Exposure-style ticker, after Smooth UI's Exposure Slider (MIT, Eduardo
  Calvo — https://github.com/educlopez/smoothui): a draggable row of notches
  that springs under the pointer, snaps to the nearest notch, shades notches
  by distance from the centre, and reports the value in a progress ring.
  Rebuilt without the motion library: one rAF spring, direct style writes.
*/

const presentYears = Number(statedExperienceYears)
const yearMs = 365.25 * 24 * 60 * 60 * 1000
const careerStart = Date.UTC(2021, 4, 1)
/** One notch per 0.1 year; the last notch is "Present". */
const notchYears = 0.1
const lastNotch = Math.ceil(presentYears / notchYears)
const notchPitch = 13 // 3px notch + 10px gap, as in the reference
const springStiffness = 300 / 0.5 // reference: stiffness 300, mass 0.5
const springDamping = 30 / 0.5 // reference: damping 30

type Span = {
  company: string
  role: string
  start: number
  end: number
}

const spans: Span[] = employment.map((span) => ({
  company: span.company,
  role: span.role,
  start: Date.parse(`${span.start}T00:00:00Z`),
  end: Date.parse(`${span.end}T00:00:00Z`),
}))

type Position = {
  notch: number
  years: number
  amount: string
  year: number
  company: string
  role: string
  summary: string
  atPresent: boolean
}

const notches = Array.from({ length: lastNotch + 1 }, (_, index) => index)

const clampNotch = (notch: number) => Math.min(lastNotch, Math.max(0, notch))

const yearsAt = (notch: number) =>
  notch >= lastNotch ? presentYears : Math.round(notch * notchYears * 100) / 100

function readNotch(notch: number): Position {
  const index = clampNotch(Math.round(notch))
  const years = yearsAt(index)
  const atPresent = index >= lastNotch
  const point = atPresent ? timelineEnd : careerStart + years * yearMs
  const matches = spans.filter((span) => point >= span.start && point <= span.end)
  const year = new Date(point).getUTCFullYear()
  const amount = atPresent ? statedExperienceYears : years.toFixed(1)
  const company = matches.map((span) => span.company).join(' · ')
  const role = matches.length
    ? matches.map((span) => span.role).join(' · ')
    : 'No role listed for this date'
  const summary = matches.length
    ? `${matches.map((span) => `${span.role} at ${span.company}`).join(', ')}, ${amount} years, ${year}`
    : `No role listed for this date, ${amount} years, ${year}`
  return { notch: index, years, amount, year, company, role, summary, atPresent }
}

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

export function WorkExperienceCard() {
  const scaleRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<SVGCircleElement>(null)
  /** Ticker offset in notches: `target` follows input, `shown` springs to it. */
  const motionRef = useRef({ target: lastNotch, shown: lastNotch, velocity: 0, frame: 0, last: 0 })
  const dragRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startNotch: lastNotch,
    moved: false,
  })
  const [position, setPosition] = useState(() => readNotch(lastNotch))

  // Shade notches by distance from the centre, like the reference: the
  // centre notch is full height in the accent, neighbours clip from the top
  // and fade.
  const paint = (shown: number) => {
    const track = trackRef.current
    if (track) {
      track.style.transform = `translate3d(${-shown * notchPitch}px, 0, 0)`
      const items = track.children
      for (let index = 0; index < items.length; index += 1) {
        const notch = items[index] as HTMLElement
        const distance = Math.abs(index - shown)
        const opacity =
          distance <= 1 ? 1 - 0.4 * distance : Math.max(0.3, 0.6 - 0.15 * (distance - 1))
        const clip = distance <= 1 ? 30 * distance : Math.min(50, 30 + 20 * (distance - 1))
        notch.style.opacity = String(opacity)
        notch.style.clipPath = `inset(${clip}% 0 0)`
        notch.classList.toggle('is-center', distance < 0.5)
      }
    }
    const ring = ringRef.current
    if (ring) {
      const progress = Math.min(1, Math.max(0, yearsAt(shown) / presentYears))
      ring.style.strokeDasharray = `${progress} ${1 - progress}`
    }
  }

  const setTarget = (notch: number, immediate = false) => {
    const motion = motionRef.current
    const next = readNotch(notch)
    motion.target = Math.min(lastNotch, Math.max(0, notch))
    const scale = scaleRef.current
    if (scale) {
      scale.setAttribute('aria-valuenow', String(Math.round(next.years * 100) / 100))
      scale.setAttribute('aria-valuetext', next.summary)
    }
    setPosition((current) => (current.summary === next.summary ? current : next))

    if (immediate || window.matchMedia(reducedMotionQuery).matches) {
      motion.shown = motion.target
      motion.velocity = 0
      paint(motion.shown)
      return
    }
    if (motion.frame) return
    motion.last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.032, (now - motion.last) / 1000)
      motion.last = now
      const accel =
        springStiffness * (motion.target - motion.shown) - springDamping * motion.velocity
      motion.velocity += accel * dt
      motion.shown += motion.velocity * dt
      const settled =
        Math.abs(motion.target - motion.shown) < 0.002 && Math.abs(motion.velocity) < 0.01
      if (settled) motion.shown = motion.target
      paint(motion.shown)
      motion.frame = settled ? 0 : requestAnimationFrame(tick)
    }
    motion.frame = requestAnimationFrame(tick)
  }

  /** Snap the ticker to the nearest notch (on release, like the reference). */
  const snap = () => setTarget(Math.round(motionRef.current.target))

  useLayoutEffect(() => {
    setTarget(lastNotch, true)
  }, [])

  useEffect(() => {
    const motion = motionRef.current
    return () => cancelAnimationFrame(motion.frame)
  }, [])

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startNotch: motionRef.current.target,
      moved: false,
    }
    event.currentTarget.classList.add('is-dragging')
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag.active || event.pointerId !== drag.pointerId) return
    const delta = event.clientX - drag.startX
    if (Math.abs(delta) > 4) drag.moved = true
    // Dragging right reveals earlier notches, as with the camera ticker.
    setTarget(drag.startNotch - delta / notchPitch)
  }

  const stopDrag = (event: PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const drag = dragRef.current
    if (!drag.active || event.pointerId !== drag.pointerId) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    drag.active = false
    event.currentTarget.classList.remove('is-dragging')
    if (!cancelled && !drag.moved) {
      // A tap jumps to the tapped notch.
      const rect = event.currentTarget.getBoundingClientRect()
      const offset = event.clientX - (rect.left + rect.width / 2)
      setTarget(Math.round(drag.startNotch + offset / notchPitch))
      return
    }
    snap()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, number | 'start' | 'end'> = {
      ArrowLeft: -1,
      ArrowDown: -1,
      ArrowRight: 1,
      ArrowUp: 1,
      PageDown: -10,
      PageUp: 10,
      Home: 'start',
      End: 'end',
    }
    const step = steps[event.key]
    if (step === undefined) return
    event.preventDefault()
    const current = Math.round(motionRef.current.target)
    if (step === 'start') setTarget(0)
    else if (step === 'end') setTarget(lastNotch)
    else setTarget(clampNotch(current + step))
  }

  const reset = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setTarget(lastNotch)
  }

  const showLogo = position.company === 'KPMG India'

  return (
    <article className="work-experience" data-hover-tile="" data-repel="">
      <div className="work-experience-surface">
        <div className="work-experience-heading">
          <span className="project-card-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M8.3475 4.66667L11.6958 10.465M5.6525 4.66667H12.3492M4.305 7L7.65333 1.20167M5.6525 9.33333L2.30417 3.535M8.3475 9.33333H1.65083M9.695 7L6.34667 12.7983M12.8333 7C12.8333 10.2217 10.2217 12.8333 7 12.8333C3.77834 12.8333 1.16667 10.2217 1.16667 7C1.16667 3.77834 3.77834 1.16667 7 1.16667C10.2217 1.16667 12.8333 3.77834 12.8333 7Z"
                stroke="currentColor"
                strokeWidth="0.583333"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <h2 className="work-experience-label">Current</h2>
          <span className="work-experience-year">{position.year}</span>
          <button
            type="button"
            className="work-experience-reset"
            hidden={position.atPresent}
            aria-label="Reset to present"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={reset}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M2.5 8a5.5 5.5 0 1 0 1.2-3.4"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <path
                d="M2.4 2.8v2.6h2.6"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div
          ref={scaleRef}
          className="work-experience-scale"
          role="slider"
          tabIndex={0}
          aria-label="Years of experience"
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={presentYears}
          aria-valuenow={position.years}
          aria-valuetext={position.summary}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(event) => stopDrag(event, false)}
          onPointerCancel={(event) => stopDrag(event, true)}
          data-fisheye-drag-axis="x"
          onLostPointerCapture={(event) => {
            // The page's drag took over (a vertical drag began here): put
            // the ticker back so panning never scrubs it.
            const drag = dragRef.current
            if (!drag.active || event.pointerId !== drag.pointerId) return
            drag.active = false
            event.currentTarget.classList.remove('is-dragging')
            setTarget(drag.startNotch)
          }}
          onKeyDown={onKeyDown}
        >
          <div ref={trackRef} className="work-experience-track" aria-hidden="true">
            {notches.map((notch) => (
              <span key={notch} className="work-experience-notch" />
            ))}
          </div>
        </div>

        <div className="work-experience-footer">
          <div className="work-experience-role-block">
            <div className="work-experience-identity">
              {showLogo ? (
                <img
                  className="work-experience-logo"
                  src="/landing/kpmg.svg"
                  alt={position.company}
                  width={42}
                  height={17}
                />
              ) : (
                <p className="work-experience-company">{position.company}</p>
              )}
            </div>
            <p className="work-experience-role">{position.role}</p>
          </div>
          <div className="work-experience-ring" aria-hidden="true">
            <svg viewBox="0 0 100 100">
              <circle className="work-experience-ring-track" cx="50" cy="50" r="46" />
              <circle
                ref={ringRef}
                className="work-experience-ring-value"
                cx="50"
                cy="50"
                r="46"
                pathLength={1}
              />
            </svg>
            <span className="work-experience-total">
              <span className="work-experience-amount">{position.amount}</span>
              <span className="work-experience-unit">yr</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
