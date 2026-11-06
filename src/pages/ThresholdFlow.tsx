import { useEffect, type CSSProperties } from 'react'
import { ENTER, PlayButton, enter, playWire, pop, prefersReducedMotion, useRun } from './caseStudyMotion.tsx'
import './threshold-flow.css'

const agents = [
  { name: 'Ordering agent', span: 2, checks: [{ name: 'Hard rules', short: 'Rules' }, { name: 'Threshold 85', short: 'Fit 85' }] },
  { name: 'Buyer’s agent', span: 1, workshop: true, checks: [{ name: 'Limit €300', short: '€300' }] },
  { name: 'Fulfilment agent', span: 1, checks: [{ name: 'Writes to the ERP', short: 'Order' }] },
]

const orders = [
  { name: 'Oil and air filters', fit: 'fit 100', detail: '8 parts, €96.40', gates: 3, outcome: 'Acts', tone: 'ok', why: 'Ordered, with undo for 10 minutes or until the van leaves.' },
  { name: 'Water pump and belt kit', fit: 'fit 90 and 100', detail: 'Golf in bay 2, €325.50', gates: 2, outcome: 'Asks', tone: 'ask', why: 'Over €300, so the approver decides in one tap.' },
  { name: 'Thermostat', fit: 'fit 70', detail: 'Polo, €58.20', gates: 1, outcome: 'Asks', tone: 'ask', why: 'Fit 70 is below 85, so the agent asks the buyer first.' },
  { name: 'Alternator', fit: 'fit 64', detail: 'Transit, €286.00', gates: 1, outcome: 'Hands over', tone: 'person', why: 'Fit 64 is below 70, so a sales rep decides.' },
  { name: 'Front brake pads', fit: 'fit 100', detail: 'Peugeot 308, €64.20', gates: 0, outcome: 'Stops', tone: 'rule', why: 'A safety part, so a sales rep decides at any fit.' },
]

/** Where on the eased travel (0 to 1) the light reaches a share of the wire's length, so each tick pops as it passes. */
function timeAtShare(share: number) {
  const curve = (t: number, a: number, b: number) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3
  let low = 0
  let high = 1
  for (let i = 0; i < 24; i++) {
    const t = (low + high) / 2
    if (curve(t, 0, 1) < share) low = t
    else high = t
  }
  return curve(low, 0.37, 0.63)
}

/** Each wire runs from the order to its outcome pill. */
function measure(board: HTMLElement) {
  const origin = board.getBoundingClientRect()
  const stacked = getComputedStyle(board.querySelector('.tf-in')!).display === 'none'
  return [...board.querySelectorAll('.tf-row')].map((row, i) => {
    const pill = row.querySelector('.fx-pill')!.getBoundingClientRect()
    const x1 = stacked ? 0 : row.querySelector('.tf-card')!.getBoundingClientRect().right - origin.left + 8
    const x2 = pill.left - origin.left
    const y = pill.top - origin.top + pill.height / 2
    const d = `M ${x1} ${y} H ${x2}`
    board.querySelectorAll(`[data-tf-line="${i}"]`).forEach((line) => line.setAttribute('d', d))
    board.querySelector<HTMLElement>(`[data-tf-light="${i}"]`)!.style.offsetPath = `path("${d}")`
    const ring = board.querySelector<HTMLElement>(`[data-tf-ring="${i}"]`)!
    ring.style.left = `${x2}px`
    ring.style.top = `${y}px`
    return { x1, x2, row }
  })
}

export function ThresholdFlow() {
  const { rootRef, replay } = useRun<HTMLElement>((root) => {
    const board = root.querySelector<HTMLElement>('.tf-board')!
    const lines = measure(board)
    const reduced = prefersReducedMotion()
    const origin = board.getBoundingClientRect()
    const run: Animation[] = []
    lines.forEach(({ x1, x2, row }, i) => {
      run.push(
        row.querySelector('.tf-card')!.animate(
          [
            { opacity: 0, transform: 'translateX(-8px)' },
            { opacity: 1, transform: 'none' },
          ],
          { delay: 100 + 750 * i, duration: 250, easing: ENTER, fill: 'both' },
        ),
      )
      const start = 400 + 750 * i
      const length = x2 - x1
      const duration = Math.max(800, 600 + (length * 5) / 3)
      const arrive = start + duration * 0.92
      if (!reduced) {
        const wire = board.querySelector<SVGPathElement>(`.tf-wire[data-tf-line="${i}"]`)!
        run.push(wire.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { delay: start, duration, easing: 'cubic-bezier(0.37, 0, 0.63, 1)', fill: 'both' }))
        run.push(
          ...playWire(start, {
            trace: board.querySelector<SVGPathElement>(`.fx-wire-trace[data-tf-line="${i}"]`)!,
            light: board.querySelector(`[data-tf-light="${i}"]`)!,
            ring: board.querySelector(`[data-tf-ring="${i}"]`)!,
            tone: 'var(--fx-ink)',
            duration,
          }).run,
        )
      }
      row.querySelectorAll('.tf-gate').forEach((gate) => {
        const r = gate.getBoundingClientRect()
        const share = (r.left + r.width / 2 - origin.left - x1) / length
        run.push(pop(gate, start + duration * timeAtShare(share)))
      })
      run.push(pop(row.querySelector('.fx-pill')!, arrive), enter(row.querySelector('.tf-why')!, arrive + 80, 0))
    })
    return run
  })

  useEffect(() => {
    const board = rootRef.current?.querySelector<HTMLElement>('.tf-board')
    if (!board) return
    const observer = new ResizeObserver(() => measure(board))
    observer.observe(board)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  let checkNumber = 0
  return (
    <figure ref={rootRef} className="tf">
      <PlayButton onClick={replay} />
      <div className="tf-board">
        <svg className="tf-wires" aria-hidden="true">
          {orders.map((order, i) => (
            <g key={order.name}>
              <path className="tf-wire" data-tf-line={i} pathLength={1} />
              <path className="fx-wire-trace" data-tf-line={i} pathLength={1} />
            </g>
          ))}
        </svg>
        <div className="tf-head">
          <p className="tf-in">Orders in</p>
          {agents.map((agent) => (
            <div key={agent.name} className={agent.workshop ? 'tf-agent is-workshop' : 'tf-agent'} style={{ gridColumn: `span ${agent.span}` }}>
              <span className="tf-agent-name">
                <span className="af-status" aria-hidden="true" />
                {agent.name}
              </span>
              {agent.checks.map((check) => {
                checkNumber += 1
                return (
                  <span key={check.name} className="tf-check" style={{ '--col': checkNumber + 1 } as CSSProperties}>
                    <span className="tf-check-num">{checkNumber}</span>
                    <span className="tf-check-name">{check.name}</span>
                    <span className="tf-check-short">{check.short}</span>
                  </span>
                )
              })}
            </div>
          ))}
        </div>
        <ol className="tf-rows">
          {orders.map((order) => (
            <li key={order.name} className="tf-row">
              <div className="tf-card">
                <span className="tf-part">{order.name}</span>
                <span className="tf-fit">{order.fit}</span>
                <span className="tf-detail">{order.detail}</span>
              </div>
              {Array.from({ length: order.gates }, (_, gate) => (
                <span key={gate} className="tf-gate" style={{ gridColumn: gate + 2 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" role="img" aria-label="Passes">
                    <path d="M2.5 6.5 5 9l4.5-5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              ))}
              <span className="tf-result" style={{ gridColumn: `${order.gates + 2} / -1` }}>
                <span className={`fx-pill is-${order.tone}`}>{order.outcome}</span>
              </span>
              <span className="tf-why" style={{ gridColumn: `${order.gates + 2} / -1` }}>
                {order.why}
              </span>
            </li>
          ))}
        </ol>
        <p className="tf-key">Checks 1 and 2 belong to the ordering agent, 3 to the buyer’s agent, and the fulfilment agent writes the order at 4.</p>
        <div className="tf-layer" aria-hidden="true">
          {orders.map((order, i) => (
            <div key={order.name}>
              <span className="fx-wire-light" data-tf-light={i} />
              <span className="fx-wire-ring" data-tf-ring={i} />
            </div>
          ))}
        </div>
      </div>
    </figure>
  )
}
