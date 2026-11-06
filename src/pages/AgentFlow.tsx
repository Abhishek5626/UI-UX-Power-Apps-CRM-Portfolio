import { useEffect, useId, type CSSProperties } from 'react'
import { Glyph, PlayButton, playWire, prefersReducedMotion, useRun } from './caseStudyMotion.tsx'
import './agent-flow.css'

const agents = [
  { id: 'setup', name: 'Setup agent', does: 'Turns the catalogue and past orders into rules and thresholds', forWho: 'For the merchant admin', note: 'A person approves every change it suggests', icon: 'model-builder' },
  { id: 'ordering', name: 'Ordering agent', does: 'Talks to the buyer and decides within the merchant’s rules', forWho: 'For the merchant', note: 'Takes voice, WhatsApp or email. The buyer’s agent checks the buyer’s rules and asks the approver, and stops go to a sales rep', icon: 'chat' },
  { id: 'fulfilment', name: 'Fulfilment agent', does: 'Holds stock, books the van and writes the order', forWho: 'For the merchant', note: 'Reads live stock and contract prices from the ERP', icon: 'transfer' },
  { id: 'review', name: 'Review agent', does: 'Sums up the month and suggests changes', forWho: 'For the merchant admin', note: 'Never touches a live order', icon: 'meter' },
]

export const agentIcons = Object.fromEntries(agents.map(({ id, icon }) => [id, icon]))

const nodes = [
  { id: 'admin', tone: 'merchant', name: 'Merchant admin', note: 'The only one who changes the merchant’s rules' },
  { id: 'buyer', tone: 'workshop', name: 'Buyer', note: 'Workshop lead, a Golf on the lift' },
  { id: 'buyerAgent', tone: 'workshop', name: 'Buyer’s agent', note: 'Keeps the buyer’s rules', agent: true },
  { id: 'approver', tone: 'workshop', name: 'Approver', note: 'Approves over the limit' },
  { id: 'rep', tone: 'merchant', name: 'Sales rep', note: 'Takes every stop' },
  { id: 'erp', tone: 'system', name: 'Merchant’s ERP', note: 'Live stock, contract price' },
]

const INK = 'var(--fx-ink)'
const WORKSHOP = 'var(--fx-workshop-fg)'
const MERCHANT = 'var(--fx-merchant-fg)'
const SYSTEM = 'var(--fx-ink-2)'

/** In route order. The phone layout keeps only the four wires between agents. */
const wires = [
  { word: 'voice, WhatsApp, email', tone: INK, to: 'ordering' },
  { word: 'buyer’s rules', tone: WORKSHOP, to: 'buyerAgent' },
  { word: 'order', tone: INK, to: 'fulfilment', phone: true },
  { word: 'written', tone: SYSTEM, to: 'erp' },
  { word: 'over the limit', tone: WORKSHOP, to: 'approver' },
  { word: 'under 70, hard rule', tone: MERCHANT, to: 'rep', withPrevious: true },
  { word: 'log', tone: INK, to: 'review', phone: true },
  { word: 'suggest', tone: INK, to: 'setup', phone: true },
  { word: 'a person approves', tone: MERCHANT, to: 'admin' },
  { word: 'rules', tone: INK, to: 'ordering', phone: true },
]

type Spot = { d: string; word: [number, number]; ring: [number, number] }

/** Every wire's shape, using the reference's rules against the cards as they are laid out now. */
function measure(board: HTMLElement) {
  const origin = board.getBoundingClientRect()
  const box = (id: string) => {
    const r = board.querySelector(`[data-af="${id}"]`)!.getBoundingClientRect()
    const left = r.left - origin.left
    const top = r.top - origin.top
    return { left, right: left + r.width, top, bottom: top + r.height, cx: left + r.width / 2, cy: top + r.height / 2 }
  }
  const [setup, ordering, fulfilment, review] = agents.map(({ id }) => box(id))
  const phone = getComputedStyle(board.querySelector('.af-around')!).display === 'none'
  let spots: (Spot | null)[]

  if (phone) {
    const drop = (a: ReturnType<typeof box>, b: ReturnType<typeof box>): Spot => ({
      d: `M ${a.cx} ${a.bottom} L ${a.cx} ${b.top}`,
      word: [a.cx, (a.bottom + b.top) / 2],
      ring: [a.cx, b.top],
    })
    const x = review.right + 18
    const loop: Spot = {
      d: `M ${review.right} ${review.cy} H ${x - 10} Q ${x} ${review.cy} ${x} ${review.cy - 10} V ${setup.cy + 10} Q ${x} ${setup.cy} ${x - 10} ${setup.cy} H ${setup.right}`,
      word: [x, (review.cy + setup.cy) / 2],
      ring: [setup.right, setup.cy],
    }
    spots = wires.map(({ word }) => (word === 'order' ? drop(ordering, fulfilment) : word === 'log' ? drop(fulfilment, review) : word === 'suggest' ? loop : word === 'rules' ? drop(setup, ordering) : null))
  } else {
    const node = Object.fromEntries(nodes.map(({ id }) => [id, box(id)]))
    const bottom = ordering.bottom
    const nodeTop = node.buyer.top
    const gap = nodeTop - bottom
    const rail = bottom + 18
    const vertical = (x: number, from: number, to: number, share: number): Spot => ({
      d: `M ${x} ${from} L ${x} ${to}`,
      word: [x, bottom + gap * share],
      ring: [x, to],
    })
    const arc = (a: ReturnType<typeof box>, b: ReturnType<typeof box>): Spot => {
      const x1 = a.cx + 14
      const x2 = b.cx - 14
      const peak = a.top - (13.6 + (x2 - x1) * 0.3908)
      return { d: `M ${x1} ${a.top} Q ${(x1 + x2) / 2} ${peak} ${x2} ${a.top}`, word: [(x1 + x2) / 2, (a.top + peak) / 2], ring: [x2, a.top] }
    }
    const branch = (a: ReturnType<typeof box>, b: ReturnType<typeof box>): Spot => {
      const x1 = a.right - 20
      return {
        d: `M ${x1} ${bottom} V ${rail - 8} Q ${x1} ${rail} ${x1 + 8} ${rail} H ${b.cx - 8} Q ${b.cx} ${rail} ${b.cx} ${rail + 8} V ${nodeTop}`,
        word: [b.cx, (rail + nodeTop) / 2],
        ring: [b.cx, nodeTop],
      }
    }
    const x1 = node.buyerAgent.cx + 14
    const x2 = node.approver.cx - 14
    const under = node.buyerAgent.bottom + 13.6 + (x2 - x1) * 0.3908
    const top = 24
    const fromX = review.cx + 34
    const toX = setup.cx - 34
    spots = [
      vertical(node.buyer.cx, nodeTop, bottom, 0.28),
      vertical(node.buyerAgent.cx, bottom, nodeTop, 0.72),
      arc(ordering, fulfilment),
      branch(fulfilment, node.erp),
      { d: `M ${x1} ${node.buyerAgent.bottom} Q ${(x1 + x2) / 2} ${under} ${x2} ${node.buyerAgent.bottom}`, word: [(x1 + x2) / 2, (node.buyerAgent.bottom + under) / 2], ring: [x2, node.buyerAgent.bottom] },
      branch(ordering, node.rep),
      arc(fulfilment, review),
      {
        d: `M ${fromX} ${review.top} V ${top + 12} Q ${fromX} ${top} ${fromX - 12} ${top} H ${toX + 12} Q ${toX} ${top} ${toX} ${top + 12} V ${review.top}`,
        word: [(fromX + toX) / 2, top],
        ring: [toX, review.top],
      },
      vertical(setup.cx, bottom, nodeTop, 0.5),
      arc(setup, ordering),
    ]
  }

  spots.forEach((spot, i) => {
    const group = board.querySelector<HTMLElement>(`[data-af-wire="${i}"]`)!
    const lines = board.querySelectorAll<SVGPathElement>(`[data-af-line="${i}"]`)
    group.style.display = spot ? '' : 'none'
    lines.forEach((line) => {
      line.style.display = spot ? '' : 'none'
      if (spot) line.setAttribute('d', spot.d)
    })
    if (!spot) return
    group.querySelector<HTMLElement>('.fx-wire-light')!.style.offsetPath = `path("${spot.d}")`
    const word = group.querySelector<HTMLElement>('.fx-word')!
    word.style.left = `${spot.word[0]}px`
    word.style.top = `${spot.word[1]}px`
    const ring = group.querySelector<HTMLElement>('.fx-wire-ring')!
    ring.style.left = `${spot.ring[0]}px`
    ring.style.top = `${spot.ring[1]}px`
  })
  return spots
}

export function AgentFlow() {
  const arrowId = `af-arrow-${useId().replace(/\W/g, '')}`
  const { rootRef, replay } = useRun<HTMLElement>((root) => {
    const board = root.querySelector<HTMLElement>('.af-board')!
    const spots = measure(board)
    const run: Animation[] = []
    const reduced = prefersReducedMotion()
    let start = 400
    let next = 400
    wires.forEach((wire, i) => {
      if (!spots[i] || reduced) return
      if (!wire.withPrevious) start = next
      const group = board.querySelector(`[data-af-wire="${i}"]`)!
      const played = playWire(start, {
        trace: board.querySelector<SVGPathElement>(`.fx-wire-trace[data-af-line="${i}"]`)!,
        light: group.querySelector('.fx-wire-light')!,
        ring: group.querySelector('.fx-wire-ring')!,
        word: group.querySelector('.fx-word')!,
        target: board.querySelector(`[data-af="${wire.to}"]`)!,
        tone: wire.tone,
      })
      run.push(...played.run)
      next = Math.max(next, start + played.duration + 500)
    })
    return run
  })

  useEffect(() => {
    const board = rootRef.current?.querySelector<HTMLElement>('.af-board')
    if (!board) return
    const observer = new ResizeObserver(() => measure(board))
    observer.observe(board)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <figure ref={rootRef} className="af">
      <PlayButton onClick={replay} />
      <div className="af-board">
        <svg className="af-wires" aria-hidden="true">
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path className="af-arrow" d="M0 0 L6 3 L0 6 z" />
            </marker>
          </defs>
          {wires.map((wire, i) => (
            <path key={wire.word} className="fx-wire" data-af-line={i} markerEnd={`url(#${arrowId})`} />
          ))}
          {wires.map((wire, i) => (
            <path key={wire.word} className="fx-wire-trace" data-af-line={i} pathLength={1} style={{ '--wire-ink': wire.tone } as CSSProperties} />
          ))}
        </svg>
        <ol className="af-agents">
          {agents.map((agent) => (
            <li key={agent.id} className="af-agent fx-step" data-af={agent.id}>
              <span className="af-icon" aria-hidden="true">
                <Glyph icon={agent.icon} />
              </span>
              <span className="af-name">
                <span className="af-status" aria-hidden="true" />
                {agent.name}
              </span>
              <span className="af-does">{agent.does}</span>
              <span className="af-for">{agent.forWho}</span>
              <span className="af-note">{agent.note}</span>
            </li>
          ))}
        </ol>
        <ul className="af-around">
          {nodes.map((node) => (
            <li key={node.id} className={`af-node fx-step is-${node.tone} at-${node.id}`} data-af={node.id}>
              <span className="af-node-name">
                {node.agent ? <span className="af-status" aria-hidden="true" /> : null}
                {node.name}
              </span>
              <span className="af-node-note">{node.note}</span>
            </li>
          ))}
        </ul>
        <div className="af-layer" aria-hidden="true">
          {wires.map((wire, i) => (
            <div key={wire.word} data-af-wire={i} style={{ '--wire-ink': wire.tone } as CSSProperties}>
              <span className="fx-wire-light" />
              <span className="fx-wire-ring" />
              <span className="fx-word">{wire.word}</span>
            </div>
          ))}
        </div>
      </div>
    </figure>
  )
}
