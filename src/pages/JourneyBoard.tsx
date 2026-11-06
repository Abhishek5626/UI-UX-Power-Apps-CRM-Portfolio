import { useEffect, useId, useRef, useState } from 'react'
import { prefersReducedMotion } from './caseStudyMotion.tsx'
import './journey-board.css'

export type JourneyCard = {
  code: string
  title: string
  channel: string
  points: string[]
  /** Which point reads as the card's headline. */
  bold: number
  edge: string
  test?: string
  today?: boolean
  /** Each entry is one chip, and may name 2 cards, as in "B2, B3". */
  links?: string[]
  group?: string
  bands?: boolean
  why?: { title: string; decided: string; favour: string; watch: string }
}

const edges = [
  { text: 'catalogue, stock and prices', from: ['M1'], to: [['B2', 0], ['B3', 0]] },
  { text: 'rules and threshold', from: ['M2'], to: [['B1', 0], ['B4', -1]] },
  { text: 'case to the sales rep', from: ['B4'], to: [['M4', 0]] },
  { text: 'answer goes back', from: ['M5'], to: [['B4', 1]] },
  { text: 'quote and fulfil', from: ['B5', 'B6'], to: [['M6', 0]] },
  { text: 'feeds the review', from: ['B8'], to: [['M7', 0]] },
] as { text: string; from: string[]; to: [string, number][] }[]

const curve = (x1: number, y1: number, x2: number, y2: number) => {
  if (Math.abs(y1 - y2) < 1) return `M ${x1} ${y1} H ${x2}`
  const middle = (x1 + x2) / 2
  return `M ${x1} ${y1} C ${middle} ${y1} ${middle} ${y2} ${x2} ${y2}`
}

/** Every wire runs from a card's edge to its label, then on to the other side. */
function measure(board: HTMLElement) {
  if (getComputedStyle(board.querySelector('.jb-wires')!).display === 'none') return
  const origin = board.getBoundingClientRect()
  const card = (code: string) => {
    const rect = board.querySelector(`[data-card="${code}"]`)!.getBoundingClientRect()
    const edge = code[0] === 'B' ? rect.right : rect.left
    return { x: edge - origin.left, y: rect.top - origin.top + rect.height / 2, height: rect.height }
  }
  edges.forEach((edge, i) => {
    const sources = edge.from.map(card)
    const onLeft = edge.from[0][0] === 'B'
    const y = sources.reduce((sum, source) => sum + source.y, 0) / sources.length
    const label = board.querySelector<HTMLElement>(`[data-label="${i}"]`)!
    const near = sources[0].x + (onLeft ? 26 : -26)
    const far = near + (onLeft ? label.offsetWidth : -label.offsetWidth)
    label.style.left = `${Math.min(near, far)}px`
    label.style.top = `${y - label.offsetHeight / 2}px`
    const wires = [
      ...sources.map((source) => curve(source.x, source.y, near, y)),
      ...edge.to.map(([code, port]) => {
        const target = card(code)
        // Several wires share B4, so each lands on its own part of the edge.
        return curve(far, y, target.x, target.y + port * Math.min(64, target.height / 2 - 16))
      }),
    ]
    wires.forEach((d, wire) => board.querySelector(`[data-wire="${i}-${wire}"]`)!.setAttribute('d', d))
  })
}

function Card({ card, id }: { card: JourneyCard; id: string }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  const jump = (code: string) => {
    const target = document.getElementById(`${id}-${code}`)
    target?.scrollIntoView({ block: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    target?.focus({ preventScroll: true })
  }

  return (
    <article id={`${id}-${card.code}`} data-card={card.code} className="jb-card" tabIndex={-1}>
      {card.group ? <p className="jb-group">{card.group}</p> : null}
      <header className="jb-head">
        <span className="jb-chip">{card.code}</span>
        <h5 className="jb-card-title">{card.title}</h5>
        <span className="jb-channel">{card.channel}</span>
        {card.why ? (
          <button type="button" className="jb-why" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)}>
            Why
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M2 3.5 5 6.5l3-3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : null}
      </header>
      <ul className="jb-points">
        {card.points.map((point, i) => (
          <li key={point} className={i === card.bold ? 'is-bold' : undefined}>
            {point}
          </li>
        ))}
      </ul>
      {card.bands ? (
        <ul className="jb-bands">
          <li className="is-acts">From 85: orders</li>
          <li className="is-asks">From 70: asks</li>
          <li className="is-hands">Under 70: sales rep</li>
        </ul>
      ) : null}
      <p className="jb-edge">
        <span className="jb-mark" aria-hidden="true">!</span>
        <span>
          <span className="jb-sr">Edge case: </span>
          {card.edge}
        </span>
      </p>
      <div className="jb-foot">
        {card.today ? <span className="jb-tag is-today">Builds on Saga today</span> : <span className="jb-tag">Test: {card.test}</span>}
        {card.links?.map((link) => (
          <span key={link} className="jb-chip">
            {link.split(', ').map((code, i) => (
              <span key={code}>
                {i > 0 ? ', ' : null}
                <button type="button" className="jb-link" onClick={() => jump(code)}>
                  {code}
                </button>
              </span>
            ))}
          </span>
        ))}
        <a className="jb-run" href="#cs-prototype">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M2.5 1.5v7L8.5 5z" stroke="currentColor" strokeLinejoin="round" />
          </svg>
          Run this step
        </a>
      </div>
      {card.why ? (
        <div id={panelId} className={open ? 'jb-panel is-open' : 'jb-panel'}>
          <div className="jb-panel-inner">
            <p className="jb-why-title">{card.why.title}</p>
            <dl className="jb-why-parts">
              <div>
                <dt>Why I decided this</dt>
                <dd>{card.why.decided}</dd>
              </div>
              <div>
                <dt>In Saga’s favour</dt>
                <dd>{card.why.favour}</dd>
              </div>
              <div>
                <dt>Watch out</dt>
                <dd>{card.why.watch}</dd>
              </div>
            </dl>
          </div>
        </div>
      ) : null}
    </article>
  )
}

export function JourneyBoard({ buyer, merchant, id }: { buyer: JourneyCard[]; merchant: JourneyCard[]; id: string }) {
  const boardRef = useRef<HTMLDivElement>(null)
  const markerId = useId()
  const [lit, setLit] = useState<number | null>(null)

  useEffect(() => {
    const board = boardRef.current!
    measure(board)
    document.fonts.ready.then(() => measure(board))
    const observer = new ResizeObserver(() => measure(board))
    observer.observe(board)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="jb">
      <p className="jb-legend">
        <span className="jb-legend-title">How to read the cards</span>
        <span className="jb-legend-item">
          <span className="jb-tag">Test: replay</span> An assumption, and the study that tests it
        </span>
        <span className="jb-legend-item">
          <span className="jb-tag is-today">Builds on Saga today</span> Uses ERP data Saga already reads
        </span>
        <span className="jb-legend-item">
          <span className="jb-chip">M2</span> The other side of a handover
        </span>
      </p>
      <div ref={boardRef} className="jb-board">
        <section className="jb-col is-buyer" aria-labelledby={`${id}-buyer`}>
          <header className="jb-col-head">
            <p className="jb-side">
              <span className="jb-side-pill">Workshop side</span> B1 to B8
            </p>
            <h4 id={`${id}-buyer`} className="jb-title">Buyer journey</h4>
            <p className="jb-sub">
              A part fails and the car is on the lift. <strong>The buyer orders by voice, WhatsApp or email,</strong> with
              an agent of its own.
            </p>
          </header>
          {buyer.map((card) => (
            <Card key={card.code} card={card} id={id} />
          ))}
        </section>
        <section className="jb-col is-merchant" aria-labelledby={`${id}-merchant`}>
          <header className="jb-col-head">
            <p className="jb-side">
              <span className="jb-side-pill">Merchant side</span> M1 to M7
            </p>
            <h4 id={`${id}-merchant`} className="jb-title">Merchant journey</h4>
            <p className="jb-sub">
              <strong>The merchant sets the rules once,</strong> takes the cases the agent should not decide, and tunes
              every month.
            </p>
          </header>
          {merchant.map((card) => (
            <Card key={card.code} card={card} id={id} />
          ))}
        </section>
        <svg className="jb-wires" aria-hidden="true">
          <defs>
            <marker id={markerId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path className="jb-head-mark" d="M0 0 L6 3 L0 6 z" />
            </marker>
          </defs>
          {edges.map((edge, i) => (
            <g key={edge.text} className={lit === i ? 'is-lit' : undefined}>
              {edge.from.map((_, wire) => (
                <path key={wire} data-wire={`${i}-${wire}`} />
              ))}
              {edge.to.map((_, wire) => (
                <path key={wire} data-wire={`${i}-${edge.from.length + wire}`} markerEnd={`url(#${markerId})`} />
              ))}
            </g>
          ))}
        </svg>
        {edges.map((edge, i) => (
          <span
            key={edge.text}
            data-label={i}
            className="jb-label"
            onMouseEnter={() => setLit(i)}
            onMouseLeave={() => setLit(null)}
          >
            {edge.text}
          </span>
        ))}
      </div>
    </div>
  )
}
