import { useEffect, useId, useState, type CSSProperties } from 'react'
import { agentIcons } from './AgentFlow.tsx'
import { Glyph, PlayButton, playWire, prefersReducedMotion, useRun } from './caseStudyMotion.tsx'
import './order-path.css'

type Step = { code: string; title: string; hint: string; text: string; person?: boolean }
type Control = { code: string; title: string; text: string }

const columns: Record<string, string> = { M2: '1 / span 3', B1: '1', B2: '2', B3: '3', B4: '4', M5: '3 / span 3', B5: '5', B6: '6', M6: '5 / span 3', B7: '7', B8: '8', M7: '7 / span 2' }
const pills: Record<string, string> = { B2: 'ask', B5: 'person', B8: 'ok' }
const kinds: Record<string, { icon: string; agent?: boolean; person?: boolean }> = {
  M2: { icon: agentIcons.setup, agent: true },
  M5: { icon: 'M8 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3.5 13.500c.5-2.5 2.2-3.8 4.5-3.800s4 1.3 4.5 3.8', person: true },
  M6: { icon: agentIcons.fulfilment, agent: true },
  M7: { icon: agentIcons.review, agent: true },
}

const WORKSHOP = 'var(--fx-workshop-fg)'
const MERCHANT = 'var(--fx-merchant-fg)'
const INK = 'var(--fx-ink)'

/** The reference's route: the order splits at B4, and both parts meet again at B5. */
const route = [
  { from: 'M2', to: 'B1', tone: WORKSHOP, word: 'rules', base: true },
  { from: 'B1', to: 'B2', tone: WORKSHOP },
  { from: 'B2', to: 'B3', tone: WORKSHOP },
  { from: 'B3', to: 'B4', tone: WORKSHOP },
  { from: 'B4', to: 'B5', tone: WORKSHOP, word: 'orders', base: true, passes: true },
  { from: 'B4', to: 'M5', tone: MERCHANT, word: 'on a stop', base: true, withPrevious: true },
  { from: 'M5', to: 'B5', tone: WORKSHOP, word: 'answer', base: true },
  { from: 'B5', to: 'B6', tone: WORKSHOP },
  { from: 'B6', to: 'M6', tone: INK, word: 'order', base: true },
  { from: 'B6', to: 'B7', tone: WORKSHOP },
  { from: 'B7', to: 'B8', tone: WORKSHOP },
  { from: 'B8', to: 'M7', tone: INK, word: 'log', base: true },
]

type Spot = { d: string; tone: string; to: string; word?: [number, number]; ring: [number, number]; base?: boolean; passes?: boolean; withPrevious?: boolean }

function measure(root: HTMLElement, steps: Step[]) {
  const board = root.querySelector<HTMLElement>('.op-board')!
  const origin = board.getBoundingClientRect()
  const item = (code: string) => {
    const li = board.querySelector(`[data-op="${code}"]`)!
    const m = li.querySelector('.op-marker')!.getBoundingClientRect()
    const n = li.querySelector('.op-node')!.getBoundingClientRect()
    return { x: m.left + m.width / 2 - origin.left, y: m.top + m.height / 2 - origin.top, top: n.top - origin.top, right: n.right - origin.left, cy: n.top + n.height / 2 - origin.top }
  }
  const stacked = getComputedStyle(root.querySelector('.op-side')!).display === 'none'
  let spots: Spot[]
  let track: string

  if (stacked) {
    const points = steps.map(({ code }) => item(code))
    track = `M ${points[0].x} ${points[0].y} V ${points[points.length - 1].y}`
    spots = steps.slice(1).map(({ code }, i) => ({
      d: `M ${points[i].x} ${points[i].y} V ${points[i + 1].y}`,
      tone: code[0] === 'M' ? MERCHANT : WORKSHOP,
      to: code,
      ring: [points[i + 1].x, points[i + 1].y],
    }))
  } else {
    const dot = (code: string) => item(code)
    const b1 = dot('B1')
    const b8 = dot('B8')
    track = `M ${b1.x} ${b1.y} H ${b8.x}`
    spots = route.map((wire) => {
      const shared = { tone: wire.tone, to: wire.to, base: wire.base, passes: wire.passes, withPrevious: wire.withPrevious }
      const a = item(wire.from)
      const b = item(wire.to)
      if (wire.from === 'M2') return { ...shared, d: `M ${b.x} ${a.top} V ${b.y + 7}`, word: [b.x, (a.top + b.y + 7) / 2], ring: [b.x, b.y] }
      if (wire.from === 'M5') return { ...shared, d: `M ${a.right} ${a.cy} H ${b.x} V ${b.y + 7}`, word: [b.x, (a.cy + b.y + 7) / 2 - 2], ring: [b.x, b.y] }
      if (wire.to[0] === 'M') return { ...shared, d: `M ${a.x} ${a.y + 6} V ${b.top}`, word: [a.x, (a.y + 6 + b.top) / 2], ring: [a.x, b.top] }
      return { ...shared, d: `M ${a.x} ${a.y} H ${b.x}`, word: wire.word ? [(a.x + b.x) / 2, a.y] : undefined, ring: [b.x, b.y] }
    })
  }

  root.querySelector('.op-track')!.setAttribute('d', track)
  route.forEach((_, i) => {
    const spot = spots[i]
    const group = board.querySelector<HTMLElement>(`[data-op-wire="${i}"]`)!
    const base = board.querySelector<SVGPathElement>(`.fx-wire[data-op-line="${i}"]`)!
    const trace = board.querySelector<SVGPathElement>(`.fx-wire-trace[data-op-line="${i}"]`)!
    group.style.display = spot ? '' : 'none'
    trace.style.display = spot ? '' : 'none'
    base.style.display = spot?.base ? '' : 'none'
    if (!spot) return
    base.setAttribute('d', spot.d)
    trace.setAttribute('d', spot.d)
    trace.style.setProperty('--wire-ink', spot.tone)
    group.style.setProperty('--wire-ink', spot.tone)
    group.querySelector<HTMLElement>('.fx-wire-light')!.style.offsetPath = `path("${spot.d}")`
    const ring = group.querySelector<HTMLElement>('.fx-wire-ring')!
    ring.style.left = `${spot.ring[0]}px`
    ring.style.top = `${spot.ring[1]}px`
    const word = group.querySelector<HTMLElement>('.fx-word')
    if (word && spot.word) {
      word.style.left = `${spot.word[0]}px`
      word.style.top = `${spot.word[1]}px`
    }
  })
  return spots
}

export function OrderPath({ steps, control, summary }: { steps: Step[]; control: Control[]; summary: string }) {
  const arrowId = `op-arrow-${useId().replace(/\W/g, '')}`
  const [on, setOn] = useState<string | null>(null)

  const { rootRef, replay, stop, status, togglePause } = useRun<HTMLElement>((root) => {
    const spots = measure(root, steps)
    const board = root.querySelector('.op-board')!
    const reduced = prefersReducedMotion()
    const run: Animation[] = []
    // Empty animations act as cues, so they pause and restart with the run.
    const cue = (delay: number, action: () => void) => {
      const animation = root.animate([], { delay, duration: 1 })
      animation.onfinish = action
      run.push(animation)
    }
    cue(400, () => setOn(steps[0].code))
    let start = 1400
    let next = 1400
    let end = 0
    spots.forEach((spot, i) => {
      if (!spot.withPrevious) start = next
      const trace = board.querySelector<SVGPathElement>(`.fx-wire-trace[data-op-line="${i}"]`)!
      const duration = Math.min(2000, Math.max(800, 600 + (trace.getTotalLength() * 5) / 3))
      if (!reduced) {
        const group = board.querySelector(`[data-op-wire="${i}"]`)!
        run.push(
          ...playWire(start, {
            trace,
            light: group.querySelector('.fx-wire-light')!,
            ring: group.querySelector('.fx-wire-ring')!,
            word: group.querySelector('.fx-word') ?? undefined,
            tone: spot.tone,
            duration,
          }).run,
        )
      }
      if (!spot.passes) cue(start + duration * 0.92, () => setOn(spot.to))
      end = Math.max(end, start + duration + 2000)
      next = Math.max(next, start + duration + 1000)
    })
    cue(end - 2, () => setOn(null))
    return run
  })

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new ResizeObserver(() => measure(root, steps))
    observer.observe(root.querySelector('.op-board')!)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const current = steps.find(({ code }) => code === on)

  return (
    <figure ref={rootRef} className="op">
      <div className="op-controls">
        {status === 'idle' ? (
          <PlayButton label="Play the order" onClick={replay} />
        ) : (
          <PlayButton label={status === 'paused' ? 'Resume' : 'Pause'} pause={status === 'running'} onClick={togglePause} />
        )}
      </div>
      <div className="op-board">
        <p className="op-side is-workshop">Workshop side</p>
        <svg className="op-wires" aria-hidden="true">
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path className="op-head" d="M0 0 L6 3 L0 6 z" />
            </marker>
          </defs>
          <path className="op-track" />
          {route.map((wire, i) => (
            <path key={`${wire.from}${wire.to}`} className="fx-wire" data-op-line={i} markerEnd={`url(#${arrowId})`} />
          ))}
          {route.map((wire, i) => (
            <path key={`${wire.from}${wire.to}`} className="fx-wire-trace" data-op-line={i} pathLength={1} />
          ))}
        </svg>
        <ol className="op-nodes">
          {steps.map((step) => {
            const kind = kinds[step.code]
            const merchant = step.code[0] === 'M'
            return (
              <li
                key={step.code}
                className={`op-item${merchant ? ' is-merchant' : ' is-workshop'}${kind?.person ? ' is-person' : ''}${step.person ? ' is-open' : ''}`}
                data-op={step.code}
                style={{ '--col': columns[step.code] } as CSSProperties}
              >
                <span className="op-marker" aria-hidden="true" />
                <button
                  type="button"
                  className="op-node"
                  data-on={on === step.code ? '' : undefined}
                  aria-pressed={on === step.code}
                  onClick={() => {
                    stop()
                    setOn(step.code)
                  }}
                >
                  {merchant ? <span className="op-side-tag">Merchant side</span> : null}
                  <span className="op-node-top">
                    <span className="op-code">{step.code}</span>
                    {step.person ? (
                      <>
                        <svg className="op-star" viewBox="0 0 16 16" aria-hidden="true">
                          <path d="M8 1.5 10 5.500l4.5.7-3.3 3.1.8 4.400L8 11.600l-4 2.1.8-4.400L1.5 6.2 6 5.500Z" />
                        </svg>
                        <span className="visually-hidden">A person stays in control.</span>
                      </>
                    ) : null}
                    {kind ? (
                      <span className="op-kind" aria-hidden="true">
                        <Glyph icon={kind.icon} />
                      </span>
                    ) : null}
                  </span>
                  <span className="op-name">
                    {kind?.agent ? <span className="af-status" aria-hidden="true" /> : null}
                    {step.title}
                  </span>
                  {merchant ? <span className="op-note">{step.hint}</span> : <span className={`fx-pill op-pill is-${pills[step.code] ?? 'none'}`}>{step.hint}</span>}
                </button>
                <span className="op-line">{step.text}</span>
              </li>
            )
          })}
        </ol>
        <p className="op-side is-merchant">Merchant side</p>
        <div className="op-layer" aria-hidden="true">
          {route.map((wire, i) => (
            <div key={`${wire.from}${wire.to}`} data-op-wire={i}>
              <span className="fx-wire-light" />
              <span className="fx-wire-ring" />
              {wire.word ? <span className="fx-word">{wire.word}</span> : null}
            </div>
          ))}
        </div>
      </div>
      <p className="op-caption">
        {current ? <span className="op-code">{current.code}</span> : <span className="op-caption-label">The order</span>}
        <span className="op-caption-text">{current ? current.text : summary}</span>
      </p>
      <div className="op-control">
        <p className="op-control-label">
          <svg className="op-star" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 1.5 10 5.500l4.5.7-3.3 3.1.8 4.400L8 11.600l-4 2.1.8-4.400L1.5 6.2 6 5.500Z" />
          </svg>
          Where people stay in control
        </p>
        <ul className="op-cells">
          {control.map((item) => (
            <li key={item.code} className="op-cell">
              <p className="op-cell-head">
                <span className="op-code">{item.code}</span>
                {item.title}
              </p>
              <p className="op-cell-text">
                <strong>{item.text.slice(0, item.text.indexOf('. ') + 1)}</strong>
                {item.text.slice(item.text.indexOf('. ') + 1)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  )
}
