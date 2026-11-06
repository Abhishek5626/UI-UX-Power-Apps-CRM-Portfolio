import { useEffect, useId, useState, type ReactNode } from 'react'
import { PlayButton, playWire, prefersReducedMotion, useRun } from './caseStudyMotion.tsx'
import './vision-board.css'

type Step = { code: string; title: string; when: string; text: string; owner: string; part: string }

const icons = [
  'M7 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM10.5 10.5l3 3',
  'M6 2.5h4M7 2.5v4L3.5 12a1 1 0 0 0 .9 1.5h7.2a1 1 0 0 0 .9-1.5L9 6.5v-4M5.5 9.5h5',
  'M8 2.5a5.5 5.5 0 1 1-5.2 7.3M2.5 8h6.5M6.5 5.5 9 8l-2.5 2.5',
  'M8 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM3.5 10a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM12.5 10a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM8 6v2M3.5 10V8h9v2',
]
const PERSON = 'M8 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3.5 13.5c.5-2.5 2.2-3.8 4.5-3.8s4 1.3 4.5 3.8'
const gates = ['where orders start', '90% rep agreement', 'pass marks hold']
const STEP = 1300

function Icon({ path, size }: { path: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d={path} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function measure(board: HTMLElement) {
  const origin = board.getBoundingClientRect()
  const box = (element: Element) => {
    const r = element.getBoundingClientRect()
    const left = r.left - origin.left
    const top = r.top - origin.top
    return { left, right: left + r.width, top, bottom: top + r.height, cx: left + r.width / 2, cy: top + r.height / 2 }
  }
  const dots = [...board.querySelectorAll('.vb-dot')].map(box)
  const cards = [...board.querySelectorAll('.vb-card')].map(box)
  const stacked = dots[1].top > dots[0].bottom
  const spots = gates.map((_, i) => {
    const a = dots[i]
    const b = dots[i + 1]
    return stacked
      ? { d: `M ${a.cx} ${a.bottom + 4} V ${b.top - 4}`, word: [a.cx + 16, b.top - 24], left: true }
      : { d: `M ${a.right + 4} ${a.cy} H ${b.left - 4}`, word: [(a.right + b.left) / 2, a.cy], left: false }
  })
  const last = cards[3]
  const second = cards[1]
  let loop
  if (stacked) {
    const x = last.right + 16
    const y1 = last.cy
    const y2 = second.cy
    loop = { d: `M ${last.right + 4} ${y1} H ${x - 6} Q ${x} ${y1} ${x} ${y1 - 6} V ${y2 + 6} Q ${x} ${y2} ${x - 6} ${y2} H ${second.right + 6}`, word: [dots[2].cx + 150, dots[3].top - 24], left: true }
  } else {
    const y = last.bottom + 24
    const x1 = last.cx
    const x2 = second.cx
    loop = { d: `M ${x1} ${last.bottom + 4} V ${y - 8} Q ${x1} ${y} ${x1 - 8} ${y} H ${x2 + 8} Q ${x2} ${y} ${x2} ${y - 8} V ${second.bottom + 6}`, word: [(x1 + x2) / 2, y], left: false }
  }
  ;[...spots, loop].forEach((spot, i) => {
    board.querySelectorAll(`[data-vb-line="${i}"]`).forEach((line) => line.setAttribute('d', spot.d))
    board.querySelector<HTMLElement>(`[data-vb-light="${i}"]`)!.style.offsetPath = `path("${spot.d}")`
    const word = board.querySelector<HTMLElement>(`[data-vb-word="${i}"]`)!
    word.style.left = `${spot.word[0]}px`
    word.style.top = `${spot.word[1]}px`
    word.classList.toggle('is-left', spot.left)
  })
}

export function VisionBoard({ steps, children }: { steps: Step[]; children: ReactNode }) {
  const arrowId = `vb-arrow-${useId().replace(/\W/g, '')}`
  const [active, setActive] = useState<number | null>(null)

  const { rootRef, replay } = useRun<HTMLElement>((root) => {
    const board = root.querySelector<HTMLElement>('.vb-board')!
    measure(board)
    if (prefersReducedMotion()) return []
    const run: Animation[] = []
    const cue = (delay: number, action: () => void) => {
      const animation = root.animate([], { delay, duration: 1 })
      animation.onfinish = action
      run.push(animation)
    }
    setActive(-1)
    steps.forEach((_, i) => cue(219 + STEP * i, () => setActive(i)))
    ;[700, 2000, 3300, 4600].forEach((start, i) => {
      const duration = i === 3 ? 1200 : 800
      run.push(
        ...playWire(start, {
          trace: board.querySelector<SVGPathElement>(`.fx-wire-trace[data-vb-line="${i}"]`)!,
          light: board.querySelector(`[data-vb-light="${i}"]`)!,
          word: board.querySelector(`[data-vb-word="${i}"]`)!,
          tone: 'var(--fx-ink)',
          duration,
          fadeAfter: 6800 - start - duration,
          fadeFor: 400,
        }).run,
      )
    })
    cue(7198, () => setActive(null))
    return run
  })

  useEffect(() => {
    const board = rootRef.current?.querySelector<HTMLElement>('.vb-board')
    if (!board) return
    const observer = new ResizeObserver(() => measure(board))
    observer.observe(board)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const running = active !== null

  return (
    <figure ref={rootRef} className="vb">
      <div className="vb-top">
        <ul className="vb-legend">
          <li>
            <span className="vb-gate-dot" />
            Gate: evidence, not a date
          </li>
          <li>
            <span className="vb-legend-person">
              <Icon path={PERSON} size={14} />
            </span>
            Owner
          </li>
          <li>
            <span className="vb-me-dot" />
            My part
          </li>
        </ul>
        <PlayButton label="Play the plan" onClick={replay} />
      </div>
      <div className="vb-board">
        <svg className="vb-wires" aria-hidden="true">
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path className="vb-arrow" d="M1 1 L7 4 L1 7" />
            </marker>
          </defs>
          {[0, 1, 2, 3].map((i) => (
            <path key={i} className="fx-wire" data-vb-line={i} markerEnd={`url(#${arrowId})`} />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <path key={i} className="fx-wire-trace" data-vb-line={i} pathLength={1} />
          ))}
        </svg>
        <ol className="vb-cols">
          {steps.map((step, i) => {
            const state = !running ? '' : active === i ? ' is-now' : active !== null && active > i ? ' is-past' : ' is-next'
            return (
              <li key={step.code} className={`vb-col${state}`}>
                <span className="vb-dot">{step.code}</span>
                <div className="vb-card">
                  <span className="vb-head">
                    <span className="vb-icon">
                      <Icon path={icons[i]} size={16} />
                    </span>
                    <span className="vb-titles">
                      <span className="vb-name">{step.title}</span>
                      <span className="vb-when">{step.when}</span>
                    </span>
                  </span>
                  <span className="vb-does">{step.text}</span>
                  <span className="vb-owner">
                    <Icon path={PERSON} size={14} />
                    {step.owner}
                  </span>
                  <span className="vb-me">
                    <span className="vb-me-label">My part</span>
                    <span className="vb-me-text">{step.part}</span>
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
        <div className="vb-layer" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span key={i}>
              <span className="fx-wire-light" data-vb-light={i} />
              <span className={i === 3 ? 'fx-word' : 'fx-word is-gate'} data-vb-word={i}>
                {i === 3 ? 'monthly review' : gates[i]}
              </span>
            </span>
          ))}
        </div>
      </div>
      <div className="vb-note">{children}</div>
    </figure>
  )
}
