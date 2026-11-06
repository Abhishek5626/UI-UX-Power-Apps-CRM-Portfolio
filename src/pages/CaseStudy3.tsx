import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from 'react'
import { CaseStudyFooter } from '../components/CaseStudyFooter.tsx'
import { ShippedBadge } from '../components/ShippedBadge.tsx'
import './case-study.css'

const themes = [
  {
    label: 'INTERVIEW THEME 1',
    text: 'Not able to track progress and dates',
    panels: [
      { src: '/case-study-3/theme-1.webp', color: '#2d4354' },
      { src: '/case-study-3/theme-2.webp', color: '#e8e8e8' },
    ],
  },
  {
    label: 'INTERVIEW THEME 2',
    text: 'Not able to see what is happening where',
    panels: [
      { src: '/case-study-3/theme-3.webp', color: '#4d3c2c' },
      { src: '/case-study-3/theme-4.webp', color: '#e8e8e8' },
    ],
  },
]

const shots = [
  '/case-study-3/research-1.webp',
  '/case-study-3/research-2.webp',
  '/case-study-3/research-3.webp',
  '/case-study-3/research-4.webp',
]

const stats = [
  { label: 'ERROR RATE DECREASED', value: '86%' },
  { label: 'ARR', value: '5,00,000000 RPS' },
  { label: 'TASK COMPLITION RATE', value: '82%' },
  { label: 'ADOPTION RATE', value: '90%' },
]

const questions = [
  'How much time should digitalization save?',
  'What are the biggest bottlenecks we want to remove?',
  'What does success look like?',
]

const personaQuestions = [
  'What are your Responsbilities?',
  'What are your Frustations?',
  'What are the current tools you use?',
]

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5.8 19.2h9.3c.5 0 1-.5.9-1-.3-1.5-1.3-4.2-4.6-4.2s-4.3 2.7-4.6 4.2c-.1.5.3 1 .9 1Z"
        fill="none"
        stroke="#292929"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M15.8 14c1.4.3 2.4 1.6 2.7 2.7.1.5-.3 1-.9 1h-.9"
        fill="none"
        stroke="#292929"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="9.5" cy="7.5" r="2.75" fill="none" stroke="#292929" strokeWidth="1.5" />
      <path
        d="M16.5 10.2c0-1.5-1.2-2.7-2.7-2.7"
        fill="none"
        stroke="#292929"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Split({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: ReactNode
}) {
  return (
    <div className="cs-split">
      <h2 id={id}>{title}</h2>
      <div className="cs-prose">{children}</div>
    </div>
  )
}

function CaptionRow({
  columns,
  left,
  right,
}: {
  columns: string
  left: ReactNode
  right: ReactNode
}) {
  return (
    <div
      className="deliverable-row"
      style={{ '--caption-columns': columns } as CSSProperties}
    >
      <p className="deliverable">{left}</p>
      <p className="deliverable">{right}</p>
    </div>
  )
}

const BODY = 242
const GRAVITY = 1400
/** Width two pieces need side by side, before they are scaled down to a phone. */
const PHONE_ROW_WIDTH = 540
const PHONE_STAGE_PADDING = 16
const PHONE_BOARDS = '(max-width: 900px)'

/** Phones: pieces sit apart on the floor, instead of overlapping past the edges. */
function restOnPhone<T extends { x: number; y: number }>(
  pieces: T[],
  width: number,
  height: number,
): T[] {
  if (!window.matchMedia(PHONE_BOARDS).matches) return pieces
  return pieces.map((piece, index) => ({
    ...piece,
    x: index === 0 ? 0 : width - BODY,
    y: height - BODY,
  }))
}

/** Screen pixels per board unit, since phones scale the whole board down. */
function boardScale(board: HTMLElement | null) {
  return board?.offsetWidth ? board.getBoundingClientRect().width / board.offsetWidth : 1
}

/**
 * The dark stage holding draggable pieces. The physics runs on the inner layer
 * at full size; on phones that layer is scaled to fit, so sizes, bounds and
 * speeds all stay as they are on desktop.
 */
function PieceStage({
  className,
  boardRef,
  children,
}: {
  className: string
  boardRef: RefObject<HTMLDivElement | null>
  children: ReactNode
}) {
  const stageRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const phone = window.matchMedia(PHONE_BOARDS)
    const applyScale = () => {
      if (phone.matches) {
        const room = stage.clientWidth - PHONE_STAGE_PADDING * 2
        stage.style.setProperty('--piece-scale', String(Math.min(1, room / PHONE_ROW_WIDTH)))
      } else {
        stage.style.removeProperty('--piece-scale')
      }
    }
    applyScale()
    const observer = new ResizeObserver(applyScale)
    observer.observe(stage)
    phone.addEventListener('change', applyScale)
    return () => {
      observer.disconnect()
      phone.removeEventListener('change', applyScale)
    }
  }, [])

  return (
    <div className={`dark-stage ${className}`} ref={stageRef}>
      <div className="piece-layer" ref={boardRef}>
        {children}
      </div>
    </div>
  )
}

type Piece = {
  label: string
  x: number
  y: number
  vx: number
  vy: number
}

function restingPieces(width: number, height: number): Piece[] {
  const stacked = height >= BODY * 2
  if (stacked) {
    return [
      { label: 'Vision Statement', x: 0, y: height - BODY * 2, vx: 0, vy: 0 },
      {
        label: 'Success Metrics',
        x: Math.min(102, Math.max(0, width - BODY)),
        y: height - BODY,
        vx: 0,
        vy: 0,
      },
    ]
  }
  return [
    { label: 'Vision Statement', x: -16, y: height - BODY, vx: 0, vy: 0 },
    {
      label: 'Success Metrics',
      x: 157,
      y: height - BODY,
      vx: 0,
      vy: 0,
    },
  ]
}

function stepPieces(pieces: Piece[], width: number, height: number, dt: number) {
  const left = height >= BODY * 2 ? 0 : -24
  const right = width - BODY - (height >= BODY * 2 ? 0 : -24)
  const floor = height - BODY

  for (const piece of pieces) {
    const restingOnFloor = piece.y >= floor - 0.6
    const restingOnOther = pieces.some((other) => {
      if (other === piece) return false
      const overlap = Math.min(piece.x + BODY, other.x + BODY) - Math.max(piece.x, other.x)
      const center = piece.x + BODY / 2
      return (
        overlap > 24 &&
        center > other.x &&
        center < other.x + BODY &&
        Math.abs(piece.y + BODY - other.y) < 2
      )
    })
    if ((restingOnFloor || restingOnOther) && piece.vy >= 0) {
      piece.vy = 0
      if (restingOnFloor) piece.y = floor
    } else {
      piece.vy += GRAVITY * dt
    }
    piece.vx *= Math.exp(-1.7 * dt)
    piece.vy *= Math.exp(-0.35 * dt)
    piece.x += piece.vx * dt
    piece.y += piece.vy * dt

    if (piece.x < left) {
      piece.x = left
      piece.vx = 0
    } else if (piece.x > right) {
      piece.x = right
      piece.vx = 0
    }
    if (piece.y < -BODY) {
      piece.y = -BODY
      piece.vy = 0
    } else if (piece.y > floor) {
      piece.y = floor
      piece.vy = Math.abs(piece.vy) < 50 ? 0 : -piece.vy * 0.2
      piece.vx *= 0.72
    }
  }

  const [a, b] = pieces
  const overlapX = Math.min(a.x + BODY, b.x + BODY) - Math.max(a.x, b.x)
  const overlapY = Math.min(a.y + BODY, b.y + BODY) - Math.max(a.y, b.y)
  if (overlapX <= 0 || overlapY <= 0) return

  if (overlapX < overlapY) {
    const dir = a.x < b.x ? -1 : 1
    a.x += dir * (overlapX / 2)
    b.x -= dir * (overlapX / 2)
    const bounce = (-(1 + 0.2) * (a.vx - b.vx)) / 2
    a.vx += bounce
    b.vx -= bounce
  } else {
    const upper = a.y < b.y ? a : b
    const lower = upper === a ? b : a
    upper.y -= overlapY
    upper.vy = Math.abs(upper.vy) < 50 ? 0 : -Math.abs(upper.vy) * 0.2
    lower.y = Math.min(lower.y, floor)
  }
}

function DiscoveryBoard() {
  const boardRef = useRef<HTMLDivElement>(null)
  const nodes = useRef<(HTMLButtonElement | null)[]>([])
  const piecesRef = useRef<Piece[]>(restingPieces(382, 558))
  const held = useRef<number | null>(null)
  const grab = useRef({ dx: 0, dy: 0, lt: 0 })
  const origin = useRef({ left: 0, top: 0 })
  const size = useRef({ w: 382, h: 558 })
  const reduced = useRef(false)
  const visible = useRef(true)
  const alive = useRef(true)
  const frame = useRef(0)

  const paint = (index: number) => {
    const node = nodes.current[index]
    const piece = piecesRef.current[index]
    if (!node || !piece) return
    const moving = held.current === index || Math.abs(piece.vx) > 1 || Math.abs(piece.vy) > 1
    node.style.transform = `translate(${piece.x}px, ${piece.y}px)`
    node.style.zIndex =
      held.current === index
        ? '2'
        : String(1 + Math.max(0, Math.round(piece.y)))
    node.style.willChange = moving ? 'transform' : ''
    node.classList.toggle('is-held', held.current === index)
  }

  const paintAll = () => {
    piecesRef.current.forEach((_, index) => paint(index))
  }

  const settle = () => {
    const { w, h } = size.current
    for (let i = 0; i < 240; i += 1) stepPieces(piecesRef.current, w, h, 1 / 60)
    for (const piece of piecesRef.current) {
      piece.vx = 0
      piece.vy = 0
    }
    paintAll()
  }

  const tick = (then: number) => {
    frame.current = requestAnimationFrame((now) => {
      if (!alive.current || held.current !== null) return
      if (!visible.current) {
        for (const node of nodes.current) {
          if (node) node.style.willChange = ''
        }
        return
      }
      const dt = Math.min(0.032, (now - then) / 1000)
      const { w, h } = size.current
      const floor = h - BODY
      const resting = piecesRef.current.every((piece) => {
        if (Math.abs(piece.vx) > 8 || Math.abs(piece.vy) > 8) return false
        if (piece.y >= floor - 0.6) return true
        return piecesRef.current.some((other) => {
          if (other === piece) return false
          const overlap = Math.min(piece.x + BODY, other.x + BODY) - Math.max(piece.x, other.x)
          const center = piece.x + BODY / 2
          return (
            overlap > 24 &&
            center > other.x &&
            center < other.x + BODY &&
            Math.abs(piece.y + BODY - other.y) < 2
          )
        })
      })
      if (resting) {
        for (const piece of piecesRef.current) {
          piece.vx = 0
          piece.vy = 0
        }
        paintAll()
        return
      }
      stepPieces(piecesRef.current, w, h, dt)
      paintAll()
      tick(now)
    })
  }

  const wake = () => {
    cancelAnimationFrame(frame.current)
    if (!reduced.current && visible.current) tick(performance.now())
  }

  useLayoutEffect(() => {
    const board = boardRef.current
    if (!board) return
    alive.current = true
    paintAll()
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const applySize = () => {
      reduced.current = motion.matches
      const width = board.clientWidth || 382
      const height = board.clientHeight || 558
      if (Math.abs(width - size.current.w) < 1 && Math.abs(height - size.current.h) < 1) return
      size.current = { w: width, h: height }
      if (held.current === null) {
        cancelAnimationFrame(frame.current)
        piecesRef.current = restOnPhone(restingPieces(width, height), width, height)
        paintAll()
      }
    }
    applySize()
    const observer = new ResizeObserver(applySize)
    observer.observe(board)
    const visibility = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting
      if (!entry.isIntersecting) {
        cancelAnimationFrame(frame.current)
        return
      }
      if (piecesRef.current.some((piece) => Math.abs(piece.vx) > 1 || Math.abs(piece.vy) > 1)) wake()
    })
    visibility.observe(board)
    motion.addEventListener('change', applySize)
    return () => {
      alive.current = false
      observer.disconnect()
      visibility.disconnect()
      motion.removeEventListener('change', applySize)
      cancelAnimationFrame(frame.current)
    }
  }, [])

  const release = (index: number) => {
    if (held.current !== index) return
    held.current = null
    const piece = piecesRef.current[index]
    const other = piecesRef.current[index === 0 ? 1 : 0]
    const overlapX = Math.min(piece.x + BODY, other.x + BODY) - Math.max(piece.x, other.x)
    if (overlapX > 60) {
      const dir = piece.x + BODY / 2 >= other.x + BODY / 2 ? -1 : 1
      other.vx = dir * 640
      piece.vx = dir * 150
    }
    paint(index)
    paint(index === 0 ? 1 : 0)
    if (reduced.current) settle()
    else wake()
  }

  const onPointerDown = (index: number, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      /* A canceled pointer can still drag from the element events. */
    }
    const rect = boardRef.current?.getBoundingClientRect()
    origin.current = { left: rect?.left ?? 0, top: rect?.top ?? 0 }
    const piece = piecesRef.current[index]
    const point = {
      x: (event.clientX - origin.current.left) / boardScale(boardRef.current),
      y: (event.clientY - origin.current.top) / boardScale(boardRef.current),
    }
    held.current = index
    grab.current = {
      dx: point.x - piece.x,
      dy: point.y - piece.y,
      lt: performance.now(),
    }
    piece.vx = 0
    piece.vy = 0
    cancelAnimationFrame(frame.current)
    paint(index)
  }

  const onPointerMove = (index: number, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (held.current !== index) return
    const piece = piecesRef.current[index]
    const point = {
      x: (event.clientX - origin.current.left) / boardScale(boardRef.current),
      y: (event.clientY - origin.current.top) / boardScale(boardRef.current),
    }
    const now = performance.now()
    const dt = Math.max(16, now - grab.current.lt) / 1000
    const x = point.x - grab.current.dx
    const y = point.y - grab.current.dy
    piece.vx = (x - piece.x) / dt
    piece.vy = (y - piece.y) / dt
    piece.x = x
    piece.y = y
    grab.current.lt = now
    paint(index)
  }

  const nudge = (index: number, x: number, y: number) => {
    const { w, h } = size.current
    const piece = piecesRef.current[index]
    held.current = index
    piece.x = Math.min(w - BODY / 2, Math.max(-BODY / 2, piece.x + x))
    piece.y = Math.min(h - BODY / 2, Math.max(-BODY / 2, piece.y + y))
    piece.vx = x * 8
    piece.vy = y * 8
    cancelAnimationFrame(frame.current)
    paint(index)
  }

  return (
    <PieceStage className="research-side" boardRef={boardRef}>
      {piecesRef.current.map((piece, index) => (
        <button
          key={piece.label}
          type="button"
          ref={(node) => {
            nodes.current[index] = node
          }}
          className="discovery-piece"
          aria-label={`${piece.label}. Drag to move, or use the arrow keys.`}
          aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
          onPointerDown={(event) => onPointerDown(index, event)}
          onPointerMove={(event) => onPointerMove(index, event)}
          onPointerUp={() => release(index)}
          onPointerCancel={() => release(index)}
          onKeyDown={(event) => {
            const step = event.shiftKey ? 48 : 24
            const move: Record<string, [number, number]> = {
              ArrowLeft: [-step, 0],
              ArrowRight: [step, 0],
              ArrowUp: [0, -step],
              ArrowDown: [0, step],
            }
            const delta = move[event.key]
            if (!delta) return
            event.preventDefault()
            nudge(index, delta[0], delta[1])
          }}
          onKeyUp={(event) => {
            if (event.key.startsWith('Arrow')) release(index)
          }}
        >
          {piece.label}
        </button>
      ))}
    </PieceStage>
  )
}

const PERSONA_BODY = 242

type PersonaPiece = {
  label: string
  x: number
  y: number
  vx: number
  vy: number
  angle: number
  va: number
}

function personaRest(width: number, height: number): PersonaPiece[] {
  if (height >= 350) {
    return [
      { label: 'Empathy Map', x: -16, y: 3, vx: 0, vy: 0, angle: 2, va: 0 },
      { label: 'Persona Profile', x: Math.min(179, width - 80), y: 151, vx: 0, vy: 0, angle: 2, va: 0 },
    ]
  }
  return [
    { label: 'Empathy Map', x: -29, y: -11, vx: 0, vy: 0, angle: 2, va: 0 },
    { label: 'Persona Profile', x: 146, y: -9, vx: 0, vy: 0, angle: 2, va: 0 },
  ]
}

function stepPersona(pieces: PersonaPiece[], width: number, height: number, dt: number) {
  const left = -36
  const right = width - PERSONA_BODY + 36
  const floor = height - PERSONA_BODY
  const radius = PERSONA_BODY / 2

  for (const piece of pieces) {
    const restingOnFloor = piece.y >= floor - 0.8
    const restingOnOther = pieces.some((other) => {
      if (other === piece) return false
      const dx = piece.x - other.x
      const dy = piece.y + PERSONA_BODY - other.y
      return Math.abs(dx) < PERSONA_BODY * 0.72 && Math.abs(dy) < 3 && other.y > piece.y
    })
    if ((restingOnFloor || restingOnOther) && piece.vy >= 0) {
      piece.vy = 0
      if (restingOnFloor) piece.y = floor
    } else {
      piece.vy += 1400 * dt
    }
    piece.vx *= Math.exp(-1.7 * dt)
    piece.vy *= Math.exp(-0.35 * dt)
    piece.va *= Math.exp(-12 * dt)
    piece.x += piece.vx * dt
    piece.y += piece.vy * dt
    piece.angle += piece.va * dt
    if (piece.x < left) {
      piece.x = left
      piece.vx = 0
    } else if (piece.x > right) {
      piece.x = right
      piece.vx = 0
    }
    if (piece.y < -PERSONA_BODY * 0.45) {
      piece.y = -PERSONA_BODY * 0.45
      piece.vy = 0
    } else if (piece.y > floor) {
      piece.y = floor
      piece.vy = 0
      piece.vx *= 0.7
      piece.va *= 0.2
    }
  }

  const [a, b] = pieces
  const ax = a.x + radius
  const ay = a.y + radius
  const bx = b.x + radius
  const by = b.y + radius
  const dx = bx - ax
  const dy = by - ay
  const dist = Math.hypot(dx, dy) || 0.01
  const overlap = 168 - dist
  if (overlap > 0) {
    const nx = dx / dist
    const ny = dy / dist
    a.x -= nx * (overlap / 2)
    a.y -= ny * (overlap / 2)
    b.x += nx * (overlap / 2)
    b.y += ny * (overlap / 2)
    const rel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny
    if (rel > 0) {
      const impulse = rel * 0.35
      a.vx -= impulse * nx
      a.vy -= impulse * ny
      b.vx += impulse * nx
      b.vy += impulse * ny
    }
  }
}

function PersonaCircles() {
  const boardRef = useRef<HTMLDivElement>(null)
  const piecesRef = useRef<PersonaPiece[]>(personaRest(405, 396))
  const held = useRef<number | null>(null)
  const grab = useRef({ lx: 0, ly: 0, lt: 0 })
  const size = useRef({ w: 405, h: 396 })
  const reduced = useRef(false)
  const frame = useRef(0)
  const [pieces, setPieces] = useState(piecesRef.current)

  const publish = () => setPieces(piecesRef.current.map((piece) => ({ ...piece })))

  const settle = () => {
    const { w, h } = size.current
    for (let i = 0; i < 240; i += 1) stepPersona(piecesRef.current, w, h, 1 / 60)
    for (const piece of piecesRef.current) {
      piece.vx = 0
      piece.vy = 0
      piece.va = 0
    }
    publish()
  }

  const tick = (then: number) => {
    frame.current = requestAnimationFrame((now) => {
      const dt = Math.min(0.032, (now - then) / 1000)
      const { w, h } = size.current
      const floor = h - PERSONA_BODY
      const resting = piecesRef.current.every((piece, index) => {
        if (index === held.current) return true
        if (Math.abs(piece.vx) > 6 || Math.abs(piece.vy) > 6 || Math.abs(piece.va) > 8) return false
        if (piece.y >= floor - 1) return true
        return piecesRef.current.some((other) => {
          if (other === piece || other.y <= piece.y) return false
          return Math.abs(piece.x - other.x) < PERSONA_BODY * 0.72 && Math.abs(piece.y + PERSONA_BODY - other.y) < 3
        })
      })
      if (held.current === null && resting) return
      if (held.current === null) stepPersona(piecesRef.current, w, h, dt)
      publish()
      tick(now)
    })
  }

  const wake = () => {
    cancelAnimationFrame(frame.current)
    if (!reduced.current) tick(performance.now())
  }

  useEffect(() => {
    const board = boardRef.current
    if (!board) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const applySize = () => {
      reduced.current = motion.matches
      const width = board.clientWidth || 405
      const height = board.clientHeight || 396
      if (Math.abs(width - size.current.w) < 1 && Math.abs(height - size.current.h) < 1) return
      size.current = { w: width, h: height }
      if (held.current === null) {
        piecesRef.current = restOnPhone(personaRest(width, height), width, height)
        publish()
      }
    }
    applySize()
    const observer = new ResizeObserver(applySize)
    observer.observe(board)
    motion.addEventListener('change', applySize)
    return () => {
      observer.disconnect()
      motion.removeEventListener('change', applySize)
      cancelAnimationFrame(frame.current)
    }
  }, [])

  const pointInBoard = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const rect = boardRef.current?.getBoundingClientRect()
    return {
      x: (event.clientX - (rect?.left ?? 0)) / boardScale(boardRef.current),
      y: (event.clientY - (rect?.top ?? 0)) / boardScale(boardRef.current),
    }
  }

  const release = (index: number) => {
    if (held.current !== index) return
    const piece = piecesRef.current[index]
    piece.vx = Math.max(-420, Math.min(420, piece.vx))
    piece.vy = Math.max(-420, Math.min(420, piece.vy))
    piece.va = Math.max(-28, Math.min(28, piece.va))
    held.current = null
    if (reduced.current) settle()
    else wake()
  }

  const onPointerDown = (index: number, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const piece = piecesRef.current[index]
    const point = pointInBoard(event)
    held.current = index
    grab.current = { lx: point.x, ly: point.y, lt: performance.now() }
    piece.vx = 0
    piece.vy = 0
    piece.va = 0
    publish()
    wake()
  }

  const onPointerMove = (index: number, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (held.current !== index) return
    const piece = piecesRef.current[index]
    const point = pointInBoard(event)
    const now = performance.now()
    const dt = Math.max(16, now - grab.current.lt) / 1000
    const dx = point.x - grab.current.lx
    const dy = point.y - grab.current.ly
    piece.vx = dx / dt
    piece.vy = dy / dt
    const ox = grab.current.lx - (piece.x + PERSONA_BODY / 2)
    const oy = grab.current.ly - (piece.y + PERSONA_BODY / 2)
    piece.va = ((ox * piece.vy - oy * piece.vx) / 14000) * (180 / Math.PI)
    piece.x += dx
    piece.y += dy
    piece.angle += piece.va * dt
    grab.current = { lx: point.x, ly: point.y, lt: now }
    publish()
  }

  const nudge = (index: number, x: number, y: number, angle: number) => {
    const { w, h } = size.current
    const piece = piecesRef.current[index]
    held.current = index
    piece.x = Math.min(w - PERSONA_BODY / 2, Math.max(-PERSONA_BODY / 2, piece.x + x))
    piece.y = Math.min(h - PERSONA_BODY / 2, Math.max(-PERSONA_BODY / 2, piece.y + y))
    piece.angle += angle
    piece.vx = x * 8
    piece.vy = y * 8
    piece.va = angle * 2
    publish()
  }

  const ordered = pieces
    .map((piece, index) => ({ piece, index }))
    .sort((a, b) => {
      if (a.index === held.current) return 1
      if (b.index === held.current) return -1
      return b.piece.y - a.piece.y
    })

  return (
    <PieceStage className="persona-side" boardRef={boardRef}>
      {ordered.map(({ piece, index }) => (
        <button
          key={piece.label}
          type="button"
          className={index === held.current ? 'persona-piece is-held' : 'persona-piece'}
          style={{
            transform: `translate(${piece.x}px, ${piece.y}px) rotate(${piece.angle}deg)`,
            zIndex: index === held.current ? 2 : 1,
          }}
          aria-label={`${piece.label}. Drag to move. Arrow keys move it, and Shift with the left or right arrow rotates it.`}
          aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
          onPointerDown={(event) => onPointerDown(index, event)}
          onPointerMove={(event) => onPointerMove(index, event)}
          onPointerUp={() => release(index)}
          onPointerCancel={() => release(index)}
          onKeyDown={(event) => {
            const step = event.shiftKey ? 0 : 24
            const turn = event.shiftKey ? 18 : 0
            const move: Record<string, [number, number, number]> = {
              ArrowLeft: [-step, 0, -turn],
              ArrowRight: [step, 0, turn],
              ArrowUp: [0, -step, 0],
              ArrowDown: [0, step, 0],
            }
            const delta = move[event.key]
            if (!delta) return
            event.preventDefault()
            nudge(index, delta[0], delta[1], delta[2])
          }}
          onKeyUp={(event) => {
            if (event.key.startsWith('Arrow')) release(index)
          }}
        >
          {piece.label}
        </button>
      ))}
    </PieceStage>
  )
}

function deliverableRest(width: number, height: number): Piece[] {
  if (height >= 280) {
    return [
      { label: 'Annotated Pain Points', x: 536, y: 69, vx: 0, vy: 0 },
      { label: 'As-Is Journey Maps', x: Math.min(700, Math.max(0, width - BODY)), y: 20, vx: 0, vy: 0 },
    ]
  }
  return [
    { label: 'As-Is Journey Maps', x: -29, y: -11, vx: 0, vy: 0 },
    { label: 'Annotated Pain Points', x: 145, y: -9, vx: 0, vy: 0 },
  ]
}

function DeliverableCircles() {
  const boardRef = useRef<HTMLDivElement>(null)
  const piecesRef = useRef<Piece[]>(deliverableRest(1116, 311))
  const held = useRef<number | null>(null)
  const grab = useRef({ dx: 0, dy: 0, lx: 0, ly: 0, lt: 0 })
  const size = useRef({ w: 1116, h: 311 })
  const reduced = useRef(false)
  const frame = useRef(0)
  const [pieces, setPieces] = useState(piecesRef.current)

  const publish = () => setPieces(piecesRef.current.map((piece) => ({ ...piece })))

  const settle = () => {
    const { w, h } = size.current
    for (let i = 0; i < 240; i += 1) stepPieces(piecesRef.current, w, h, 1 / 60)
    for (const piece of piecesRef.current) {
      piece.vx = 0
      piece.vy = 0
    }
    publish()
  }

  const tick = (then: number) => {
    frame.current = requestAnimationFrame((now) => {
      const dt = Math.min(0.032, (now - then) / 1000)
      const { w, h } = size.current
      const floor = h - BODY
      const resting = piecesRef.current.every((piece, index) => {
        if (index === held.current) return true
        if (Math.abs(piece.vx) > 8 || Math.abs(piece.vy) > 8) return false
        if (piece.y >= floor - 0.6) return true
        return piecesRef.current.some((other) => {
          if (other === piece) return false
          const overlap = Math.min(piece.x + BODY, other.x + BODY) - Math.max(piece.x, other.x)
          const center = piece.x + BODY / 2
          return (
            overlap > 24 &&
            center > other.x &&
            center < other.x + BODY &&
            Math.abs(piece.y + BODY - other.y) < 2
          )
        })
      })
      if (held.current === null && resting) return
      if (held.current === null) stepPieces(piecesRef.current, w, h, dt)
      publish()
      tick(now)
    })
  }

  const wake = () => {
    cancelAnimationFrame(frame.current)
    if (!reduced.current) tick(performance.now())
  }

  useEffect(() => {
    const board = boardRef.current
    if (!board) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const applySize = () => {
      reduced.current = motion.matches
      const width = board.clientWidth || 1116
      const height = board.clientHeight || 311
      if (Math.abs(width - size.current.w) < 1 && Math.abs(height - size.current.h) < 1) return
      size.current = { w: width, h: height }
      if (held.current === null) {
        piecesRef.current = restOnPhone(deliverableRest(width, height), width, height)
        publish()
      }
    }
    applySize()
    const observer = new ResizeObserver(applySize)
    observer.observe(board)
    motion.addEventListener('change', applySize)
    return () => {
      observer.disconnect()
      motion.removeEventListener('change', applySize)
      cancelAnimationFrame(frame.current)
    }
  }, [])

  const pointInBoard = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const rect = boardRef.current?.getBoundingClientRect()
    return {
      x: (event.clientX - (rect?.left ?? 0)) / boardScale(boardRef.current),
      y: (event.clientY - (rect?.top ?? 0)) / boardScale(boardRef.current),
    }
  }

  const release = (index: number) => {
    if (held.current !== index) return
    held.current = null
    const piece = piecesRef.current[index]
    const other = piecesRef.current[index === 0 ? 1 : 0]
    const overlapX = Math.min(piece.x + BODY, other.x + BODY) - Math.max(piece.x, other.x)
    if (overlapX > 60) {
      const dir = piece.x + BODY / 2 >= other.x + BODY / 2 ? -1 : 1
      other.vx = dir * 640
      piece.vx = dir * 150
    }
    if (reduced.current) settle()
    else wake()
  }

  const onPointerDown = (index: number, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const piece = piecesRef.current[index]
    const point = pointInBoard(event)
    held.current = index
    grab.current = {
      dx: point.x - piece.x,
      dy: point.y - piece.y,
      lx: point.x,
      ly: point.y,
      lt: performance.now(),
    }
    piece.vx = 0
    piece.vy = 0
    publish()
    wake()
  }

  const onPointerMove = (index: number, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (held.current !== index) return
    const piece = piecesRef.current[index]
    const point = pointInBoard(event)
    const now = performance.now()
    const dt = Math.max(16, now - grab.current.lt) / 1000
    const x = point.x - grab.current.dx
    const y = point.y - grab.current.dy
    piece.vx = (x - piece.x) / dt
    piece.vy = (y - piece.y) / dt
    piece.x = x
    piece.y = y
    grab.current.lx = point.x
    grab.current.ly = point.y
    grab.current.lt = now
    publish()
  }

  const nudge = (index: number, x: number, y: number) => {
    const { w, h } = size.current
    const piece = piecesRef.current[index]
    held.current = index
    piece.x = Math.min(w - BODY / 2, Math.max(-BODY / 2, piece.x + x))
    piece.y = Math.min(h - BODY / 2, Math.max(-BODY / 2, piece.y + y))
    piece.vx = x * 8
    piece.vy = y * 8
    publish()
  }

  const ordered = pieces
    .map((piece, index) => ({ piece, index }))
    .sort((a, b) => {
      if (a.index === held.current) return 1
      if (b.index === held.current) return -1
      return b.piece.y - a.piece.y
    })

  return (
    <PieceStage className="deliverable-board" boardRef={boardRef}>
      {ordered.map(({ piece, index }) => (
        <button
          key={piece.label}
          type="button"
          className={index === held.current ? 'discovery-piece is-held' : 'discovery-piece'}
          style={{ transform: `translate(${piece.x}px, ${piece.y}px)`, zIndex: index === held.current ? 2 : 1 }}
          aria-label={`${piece.label}. Drag to move, or use the arrow keys.`}
          aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
          onPointerDown={(event) => onPointerDown(index, event)}
          onPointerMove={(event) => onPointerMove(index, event)}
          onPointerUp={() => release(index)}
          onPointerCancel={() => release(index)}
          onKeyDown={(event) => {
            const step = event.shiftKey ? 48 : 24
            const move: Record<string, [number, number]> = {
              ArrowLeft: [-step, 0],
              ArrowRight: [step, 0],
              ArrowUp: [0, -step],
              ArrowDown: [0, step],
            }
            const delta = move[event.key]
            if (!delta) return
            event.preventDefault()
            nudge(index, delta[0], delta[1])
          }}
          onKeyUp={(event) => {
            if (event.key.startsWith('Arrow')) release(index)
          }}
        >
          {piece.label}
        </button>
      ))}
    </PieceStage>
  )
}

type ResearchPiece = {
  label: string
  size: number
  x: number
  y: number
  vx: number
  vy: number
  angle: number
}

function researchRest(width: number, height: number): ResearchPiece[] {
  if (height >= 400) {
    return [
      { label: 'Observation Notes', size: 251, x: -1, y: 4, vx: 0, vy: 0, angle: 2.11 },
      {
        label: 'Competitor Benchmarking Deck',
        size: 249,
        x: Math.min(223, Math.max(-20, width - 249 + 8)),
        y: 228,
        vx: 0,
        vy: 0,
        angle: 1.79,
      },
    ]
  }
  return [
    { label: 'Competitor Benchmarking Deck', size: 242, x: -29, y: -11, vx: 0, vy: 0, angle: 1.98 },
    { label: 'Observation Notes', size: 242, x: 145, y: -9, vx: 0, vy: 0, angle: 1.99 },
  ]
}

function clampResearch(piece: ResearchPiece, width: number, height: number) {
  piece.x = Math.min(width - piece.size + 30, Math.max(-40, piece.x))
  piece.y = Math.min(height - piece.size + 16, Math.max(-16, piece.y))
}

function ResearchCircles() {
  const boardRef = useRef<HTMLDivElement>(null)
  const piecesRef = useRef<ResearchPiece[]>(researchRest(464, 473))
  const held = useRef<number | null>(null)
  const grab = useRef({ dx: 0, dy: 0 })
  const size = useRef({ w: 464, h: 473 })
  const reduced = useRef(false)
  const frame = useRef(0)
  const settle = useRef<{ from: { x: number; y: number }[]; to: { x: number; y: number }[]; t0: number } | null>(null)
  const [pieces, setPieces] = useState(piecesRef.current)

  const publish = () => setPieces(piecesRef.current.map((piece) => ({ ...piece })))

  const tick = () => {
    frame.current = requestAnimationFrame((now) => {
      const motion = settle.current
      if (held.current !== null || !motion) return
      const t = Math.min(1, (now - motion.t0) / 450)
      const ease = 1 - (1 - t) ** 3
      piecesRef.current.forEach((piece, index) => {
        const from = motion.from[index]
        const to = motion.to[index]
        piece.x = from.x + (to.x - from.x) * ease
        piece.y = from.y + (to.y - from.y) * ease
        piece.vx = 0
        piece.vy = 0
      })
      publish()
      if (t < 1) tick()
      else settle.current = null
    })
  }

  const wake = () => {
    cancelAnimationFrame(frame.current)
    if (!reduced.current && settle.current) tick()
  }

  useEffect(() => {
    const board = boardRef.current
    if (!board) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const applySize = () => {
      reduced.current = motion.matches
      const width = board.clientWidth || 464
      const height = board.clientHeight || 473
      if (Math.abs(width - size.current.w) < 1 && Math.abs(height - size.current.h) < 1) return
      size.current = { w: width, h: height }
      if (held.current === null) {
        settle.current = null
        piecesRef.current = restOnPhone(researchRest(width, height), width, height)
        publish()
      }
    }
    applySize()
    const observer = new ResizeObserver(applySize)
    observer.observe(board)
    motion.addEventListener('change', applySize)
    return () => {
      observer.disconnect()
      motion.removeEventListener('change', applySize)
      cancelAnimationFrame(frame.current)
    }
  }, [])

  const pointInBoard = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const rect = boardRef.current?.getBoundingClientRect()
    return {
      x: (event.clientX - (rect?.left ?? 0)) / boardScale(boardRef.current),
      y: (event.clientY - (rect?.top ?? 0)) / boardScale(boardRef.current),
    }
  }

  const release = (index: number) => {
    if (held.current !== index) return
    held.current = null
    const pieces = piecesRef.current
    const [a, b] = pieces
    const overlapX = Math.min(a.x + a.size, b.x + b.size) - Math.max(a.x, b.x)
    const overlapY = Math.min(a.y + a.size, b.y + b.size) - Math.max(a.y, b.y)
    const goals = pieces.map((piece) => ({ x: piece.x, y: piece.y }))
    if (overlapX > 12 && overlapY > 12) {
      if (overlapX < overlapY) {
        const shift = overlapX / 2 + 6
        const dir = a.x <= b.x ? -1 : 1
        goals[0].x += dir * shift
        goals[1].x -= dir * shift
      } else {
        const shift = overlapY / 2 + 6
        if (a.y <= b.y) {
          goals[0].y -= shift
          goals[1].y += shift
        } else {
          goals[1].y -= shift
          goals[0].y += shift
        }
      }
    }
    const { w, h } = size.current
    goals.forEach((goal, goalIndex) => {
      const piece = pieces[goalIndex]
      goal.x = Math.min(w - piece.size + 30, Math.max(-40, goal.x))
      goal.y = Math.min(h - piece.size + 16, Math.max(-16, goal.y))
    })
    if (reduced.current) {
      pieces.forEach((piece, pieceIndex) => {
        piece.x = goals[pieceIndex].x
        piece.y = goals[pieceIndex].y
        piece.vx = 0
        piece.vy = 0
      })
      settle.current = null
      publish()
      return
    }
    const still = goals.every(
      (goal, goalIndex) =>
        Math.abs(goal.x - pieces[goalIndex].x) < 0.5 && Math.abs(goal.y - pieces[goalIndex].y) < 0.5,
    )
    if (still) {
      settle.current = null
      publish()
      return
    }
    settle.current = {
      from: pieces.map((piece) => ({ x: piece.x, y: piece.y })),
      to: goals,
      t0: performance.now(),
    }
    wake()
  }

  const onPointerDown = (index: number, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    settle.current = null
    cancelAnimationFrame(frame.current)
    const piece = piecesRef.current[index]
    const point = pointInBoard(event)
    held.current = index
    grab.current = { dx: point.x - piece.x, dy: point.y - piece.y }
    piece.vx = 0
    piece.vy = 0
    publish()
  }

  const onPointerMove = (index: number, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (held.current !== index) return
    const piece = piecesRef.current[index]
    const point = pointInBoard(event)
    piece.x = point.x - grab.current.dx
    piece.y = point.y - grab.current.dy
    clampResearch(piece, size.current.w, size.current.h)
    publish()
  }

  const nudge = (index: number, x: number, y: number) => {
    settle.current = null
    cancelAnimationFrame(frame.current)
    const piece = piecesRef.current[index]
    held.current = index
    piece.x += x
    piece.y += y
    clampResearch(piece, size.current.w, size.current.h)
    publish()
  }

  const ordered = pieces
    .map((piece, index) => ({ piece, index }))
    .sort((a, b) => {
      if (a.index === held.current) return 1
      if (b.index === held.current) return -1
      return b.piece.y - a.piece.y
    })

  return (
    <PieceStage className="comp-side research-board" boardRef={boardRef}>
      {ordered.map(({ piece, index }) => (
        <button
          key={piece.label}
          type="button"
          className={index === held.current ? 'discovery-piece is-held' : 'discovery-piece'}
          style={{
            width: piece.size,
            height: piece.size,
            transform: `translate(${piece.x}px, ${piece.y}px) rotate(${piece.angle}deg)`,
            zIndex: index === held.current ? 2 : 1,
          }}
          aria-label={`${piece.label}. Drag to move, or use the arrow keys.`}
          aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
          onPointerDown={(event) => onPointerDown(index, event)}
          onPointerMove={(event) => onPointerMove(index, event)}
          onPointerUp={() => release(index)}
          onPointerCancel={() => release(index)}
          onKeyDown={(event) => {
            const step = event.shiftKey ? 48 : 24
            const move: Record<string, [number, number]> = {
              ArrowLeft: [-step, 0],
              ArrowRight: [step, 0],
              ArrowUp: [0, -step],
              ArrowDown: [0, step],
            }
            const delta = move[event.key]
            if (!delta) return
            event.preventDefault()
            nudge(index, delta[0], delta[1])
          }}
          onKeyUp={(event) => {
            if (event.key.startsWith('Arrow')) release(index)
          }}
        >
          {piece.label}
        </button>
      ))}
    </PieceStage>
  )
}

const TOBE_BODY = 242

type ToBePiece = {
  label: string
  x: number
  y: number
  vx: number
  vy: number
  angle: number
  va: number
  awake: boolean
}

function tobeRest(height: number): ToBePiece[] {
  if (height >= 300) {
    return [
      { label: 'To-Be Journey Maps', x: -21, y: 3, vx: 0, vy: 0, angle: 2.02, va: 0, awake: false },
      { label: 'Gap Analysis', x: 166, y: 117, vx: 0, vy: 0, angle: 2.01, va: 0, awake: false },
    ]
  }
  return [
    { label: 'To-Be Journey Maps', x: -29, y: -11, vx: 0, vy: 0, angle: 2, va: 0, awake: false },
    { label: 'Gap Analysis', x: 145, y: -9, vx: 0, vy: 0, angle: 2, va: 0, awake: false },
  ]
}

function stepToBe(pieces: ToBePiece[], width: number, height: number, dt: number, separate = true) {
  const floor = height - TOBE_BODY
  const left = -36
  const right = width - TOBE_BODY + 36
  const radius = TOBE_BODY / 2

  for (const piece of pieces) {
    if (!piece.awake) continue
    const onFloor = piece.y >= floor - 0.8
    const onOther = pieces.some((other) => {
      if (other === piece || other.y <= piece.y) return false
      return Math.abs(piece.x - other.x) < TOBE_BODY * 0.72 && Math.abs(piece.y + TOBE_BODY - other.y) < 3
    })
    if ((onFloor || onOther) && piece.vy >= 0) {
      piece.vy = 0
      piece.vx *= 0.35
      if (onFloor) piece.y = floor
    } else {
      piece.vy += 1400 * dt
    }
    piece.vx *= Math.exp(-1.7 * dt)
    piece.vy *= Math.exp(-0.35 * dt)
    piece.va *= Math.exp(-12 * dt)
    piece.x += piece.vx * dt
    piece.y += piece.vy * dt
    piece.angle += piece.va * dt
    if (piece.x < left) {
      piece.x = left
      piece.vx = 0
    } else if (piece.x > right) {
      piece.x = right
      piece.vx = 0
    }
    if (piece.y < -TOBE_BODY * 0.45) {
      piece.y = -TOBE_BODY * 0.45
      piece.vy = 0
    } else if (piece.y > floor) {
      piece.y = floor
      piece.vy = 0
      piece.vx *= 0.7
      piece.va *= 0.2
    }
    const slow =
      Math.abs(piece.vx) < 12 && Math.abs(piece.vy) < 12 && Math.abs(piece.va) < 10
    if (slow && (piece.y >= floor - 0.8 || onOther)) {
      piece.vx = 0
      piece.vy = 0
      piece.va = 0
      piece.awake = false
    }
  }

  if (!separate) return
  const [a, b] = pieces
  const dx = b.x + radius - (a.x + radius)
  const dy = b.y + radius - (a.y + radius)
  const dist = Math.hypot(dx, dy) || 0.01
  const overlap = 168 - dist
  if (overlap <= 0) return
  const nx = dx / dist
  const ny = dy / dist
  if (a.awake && !b.awake) {
    a.x -= nx * overlap
    a.y -= ny * overlap
  } else if (b.awake && !a.awake) {
    b.x += nx * overlap
    b.y += ny * overlap
  } else if (a.awake && b.awake) {
    a.x -= nx * (overlap / 2)
    a.y -= ny * (overlap / 2)
    b.x += nx * (overlap / 2)
    b.y += ny * (overlap / 2)
  }
  const limit = -TOBE_BODY * 0.45
  for (const piece of pieces) {
    if (!piece.awake) continue
    if (piece.x < left) piece.x = left
    else if (piece.x > right) piece.x = right
    if (piece.y < limit) piece.y = limit
    else if (piece.y > floor) piece.y = floor
  }
}

function ToBeCircles() {
  const boardRef = useRef<HTMLDivElement>(null)
  const piecesRef = useRef<ToBePiece[]>(tobeRest(362))
  const held = useRef<number | null>(null)
  const grab = useRef({ lx: 0, ly: 0, lt: 0 })
  const size = useRef({ w: 387, h: 362 })
  const reduced = useRef(false)
  const frame = useRef(0)
  const [pieces, setPieces] = useState(piecesRef.current)

  const publish = () => setPieces(piecesRef.current.map((piece) => ({ ...piece })))

  const tick = (then: number) => {
    frame.current = requestAnimationFrame((now) => {
      const dt = Math.min(0.032, (now - then) / 1000)
      const { h } = size.current
      const floor = h - TOBE_BODY
      const resting = piecesRef.current.every((piece, index) => {
        if (index === held.current || !piece.awake) return true
        if (Math.abs(piece.vx) > 6 || Math.abs(piece.vy) > 6 || Math.abs(piece.va) > 8) return false
        if (piece.y >= floor - 1) return true
        return piecesRef.current.some((other) => {
          if (other === piece || other.y <= piece.y) return false
          return Math.abs(piece.x - other.x) < TOBE_BODY * 0.72 && Math.abs(piece.y + TOBE_BODY - other.y) < 3
        })
      })
      if (held.current === null && resting) {
        for (const piece of piecesRef.current) {
          if (!piece.awake) continue
          piece.vx = 0
          piece.vy = 0
          piece.va = 0
          piece.awake = false
        }
        publish()
        return
      }
      if (held.current === null) stepToBe(piecesRef.current, size.current.w, h, dt)
      publish()
      tick(now)
    })
  }

  const wake = () => {
    cancelAnimationFrame(frame.current)
    if (!reduced.current) tick(performance.now())
  }

  useEffect(() => {
    const board = boardRef.current
    if (!board) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const applySize = () => {
      reduced.current = motion.matches
      const width = board.clientWidth || 387
      const height = board.clientHeight || 362
      if (Math.abs(width - size.current.w) < 1 && Math.abs(height - size.current.h) < 1) return
      size.current = { w: width, h: height }
      if (held.current === null) {
        piecesRef.current = restOnPhone(tobeRest(height), width, height)
        publish()
      }
    }
    applySize()
    const observer = new ResizeObserver(applySize)
    observer.observe(board)
    motion.addEventListener('change', applySize)
    return () => {
      observer.disconnect()
      motion.removeEventListener('change', applySize)
      cancelAnimationFrame(frame.current)
    }
  }, [])

  const pointInBoard = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const rect = boardRef.current?.getBoundingClientRect()
    return {
      x: (event.clientX - (rect?.left ?? 0)) / boardScale(boardRef.current),
      y: (event.clientY - (rect?.top ?? 0)) / boardScale(boardRef.current),
    }
  }

  const release = (index: number) => {
    if (held.current !== index) return
    const piece = piecesRef.current[index]
    piece.vx = Math.max(-420, Math.min(420, piece.vx))
    piece.vy = Math.max(-420, Math.min(420, piece.vy))
    piece.va = Math.max(-28, Math.min(28, piece.va))
    held.current = null
    if (reduced.current) {
      piece.vx = 0
      piece.vy = 0
      piece.va = 0
      piece.awake = false
      publish()
      return
    }
    piece.awake = true
    wake()
  }

  const onPointerDown = (index: number, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      /* A canceled pointer can still drag from the element events. */
    }
    const piece = piecesRef.current[index]
    const point = pointInBoard(event)
    held.current = index
    grab.current = { lx: point.x, ly: point.y, lt: performance.now() }
    piece.vx = 0
    piece.vy = 0
    piece.va = 0
    piece.awake = true
    publish()
  }

  const onPointerMove = (index: number, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (held.current !== index) return
    const piece = piecesRef.current[index]
    const point = pointInBoard(event)
    const now = performance.now()
    const dt = Math.max(16, now - grab.current.lt) / 1000
    const dx = point.x - grab.current.lx
    const dy = point.y - grab.current.ly
    piece.vx = dx / dt
    piece.vy = dy / dt
    const ox = grab.current.lx - (piece.x + TOBE_BODY / 2)
    const oy = grab.current.ly - (piece.y + TOBE_BODY / 2)
    piece.va = ((ox * piece.vy - oy * piece.vx) / 14000) * (180 / Math.PI)
    piece.x += dx
    piece.y += dy
    piece.angle += piece.va * dt
    grab.current = { lx: point.x, ly: point.y, lt: now }
    publish()
  }

  const nudge = (index: number, x: number, y: number, angle: number) => {
    const { w, h } = size.current
    const piece = piecesRef.current[index]
    held.current = index
    piece.x = Math.min(w - TOBE_BODY / 2, Math.max(-TOBE_BODY / 2, piece.x + x))
    piece.y = Math.min(h - TOBE_BODY / 2, Math.max(-TOBE_BODY * 0.45, piece.y + y))
    piece.angle += angle
    piece.vx = x * 8
    piece.vy = y * 8
    piece.va = angle * 2
    piece.awake = true
    publish()
  }

  const ordered = pieces
    .map((piece, index) => ({ piece, index }))
    .sort((a, b) => {
      if (a.index === held.current) return 1
      if (b.index === held.current) return -1
      return b.piece.y - a.piece.y
    })

  return (
    <PieceStage className="tobe-side tobe-board" boardRef={boardRef}>
      {ordered.map(({ piece, index }) => (
        <button
          key={piece.label}
          type="button"
          className={index === held.current ? 'tobe-piece is-held' : 'tobe-piece'}
          style={{
            transform: `translate(${piece.x}px, ${piece.y}px) rotate(${piece.angle}deg)`,
            zIndex: index === held.current ? 2 : 1,
          }}
          aria-label={`${piece.label}. Drag to move. Arrow keys move it, and Shift with the left or right arrow rotates it.`}
          aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
          onPointerDown={(event) => onPointerDown(index, event)}
          onPointerMove={(event) => onPointerMove(index, event)}
          onPointerUp={() => release(index)}
          onPointerCancel={() => release(index)}
          onKeyDown={(event) => {
            const step = event.shiftKey ? 0 : 24
            const turn = event.shiftKey ? 18 : 0
            const move: Record<string, [number, number, number]> = {
              ArrowLeft: [-step, 0, -turn],
              ArrowRight: [step, 0, turn],
              ArrowUp: [0, -step, 0],
              ArrowDown: [0, step, 0],
            }
            const delta = move[event.key]
            if (!delta) return
            event.preventDefault()
            nudge(index, delta[0], delta[1], delta[2])
          }}
          onKeyUp={(event) => {
            if (event.key.startsWith('Arrow')) release(index)
          }}
        >
          {piece.label}
        </button>
      ))}
    </PieceStage>
  )
}

const insightLabels = ['Affinity Diagrams', 'Insights Summary'] as const

function insightRest(narrow: boolean) {
  return narrow
    ? [
        { x: -34, y: -36 },
        { x: 118, y: 28 },
      ]
    : [
        { x: -18, y: -12 },
        { x: 186, y: 118 },
      ]
}

function InsightsCircles() {
  const boardRef = useRef<HTMLDivElement>(null)
  const pieceRefs = useRef<Array<HTMLButtonElement | null>>([])

  useEffect(() => {
    const board = boardRef.current
    if (!board) return
    const rest = () =>
      restOnPhone(insightRest(board.clientHeight < 300), board.clientWidth, board.clientHeight)
    const points = rest().map((point) => ({ ...point }))
    const stops: Array<() => void> = []
    let held = -1
    let pointerId = -1
    let originX = 0
    let originY = 0
    let moved = false

    const paint = (index: number) => {
      const piece = pieceRefs.current[index]
      const point = points[index]
      if (!piece || !point) return
      piece.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`
    }

    const clamp = (index: number, x: number, y: number) => {
      const piece = pieceRefs.current[index]
      if (!piece) return { x, y }
      const minX = -piece.offsetWidth * 0.62
      const maxX = board.clientWidth - piece.offsetWidth * 0.38
      const minY = -piece.offsetHeight * 0.62
      const maxY = board.clientHeight - piece.offsetHeight * 0.38
      return {
        x: Math.min(maxX, Math.max(minX, x)),
        y: Math.min(maxY, Math.max(minY, y)),
      }
    }

    const placeRest = () => {
      if (moved || held !== -1) return
      rest().forEach((point, index) => {
        points[index].x = point.x
        points[index].y = point.y
        paint(index)
      })
    }

    pieceRefs.current.forEach((piece, index) => {
      if (!piece) return
      paint(index)

      const onDown = (event: PointerEvent) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return
        held = index
        pointerId = event.pointerId
        const scale = boardScale(board)
        originX = event.clientX / scale - points[index].x
        originY = event.clientY / scale - points[index].y
        piece.classList.add('is-held')
        piece.setPointerCapture(event.pointerId)
      }

      const onMove = (event: PointerEvent) => {
        if (held !== index || event.pointerId !== pointerId) return
        const scale = boardScale(board)
        const next = clamp(index, event.clientX / scale - originX, event.clientY / scale - originY)
        points[index].x = next.x
        points[index].y = next.y
        moved = true
        paint(index)
      }

      const onUp = (event: PointerEvent) => {
        if (held !== index || event.pointerId !== pointerId) return
        held = -1
        piece.classList.remove('is-held')
        if (piece.hasPointerCapture(event.pointerId)) {
          piece.releasePointerCapture(event.pointerId)
        }
      }

      const onKey = (event: KeyboardEvent) => {
        const step = event.shiftKey ? 28 : 14
        const move: Record<string, [number, number]> = {
          ArrowLeft: [-step, 0],
          ArrowRight: [step, 0],
          ArrowUp: [0, -step],
          ArrowDown: [0, step],
        }
        const delta = move[event.key]
        if (!delta) return
        event.preventDefault()
        const next = clamp(index, points[index].x + delta[0], points[index].y + delta[1])
        points[index].x = next.x
        points[index].y = next.y
        moved = true
        paint(index)
      }

      piece.addEventListener('pointerdown', onDown)
      piece.addEventListener('pointermove', onMove)
      piece.addEventListener('pointerup', onUp)
      piece.addEventListener('pointercancel', onUp)
      piece.addEventListener('keydown', onKey)
      stops.push(() => {
        piece.removeEventListener('pointerdown', onDown)
        piece.removeEventListener('pointermove', onMove)
        piece.removeEventListener('pointerup', onUp)
        piece.removeEventListener('pointercancel', onUp)
        piece.removeEventListener('keydown', onKey)
      })
    })

    placeRest()
    const observer = new ResizeObserver(placeRest)
    observer.observe(board)
    return () => {
      observer.disconnect()
      stops.forEach((stop) => stop())
    }
  }, [])

  return (
    <PieceStage className="pain-side insights-board" boardRef={boardRef}>
      {insightLabels.map((label, index) => (
        <button
          key={label}
          ref={(node) => {
            pieceRefs.current[index] = node
          }}
          type="button"
          className="insights-piece"
          style={{
            transform: `translate3d(${insightRest(false)[index].x}px, ${insightRest(false)[index].y}px, 0)`,
          }}
          aria-label={`${label}. Drag to move. Arrow keys nudge it.`}
          aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
        >
          {label}
        </button>
      ))}
    </PieceStage>
  )
}

function useCaseRest(height: number): ToBePiece[] {
  if (height >= 300) {
    return [
      { label: 'Prioritized Task List', x: -4.9, y: 118.7, vx: 0, vy: 0, angle: 2.03, va: 0, awake: false },
      { label: 'Use Case Catalog', x: 223, y: 10.5, vx: 0, vy: 0, angle: 1.96, va: 0, awake: false },
    ]
  }
  return [
    { label: 'Prioritized Task List', x: 52.6, y: -0.9, vx: 0, vy: 0, angle: 2, va: 0, awake: false },
    { label: 'Use Case Catalog', x: 173.5, y: 3.3, vx: 0, vy: 0, angle: 2, va: 0, awake: false },
  ]
}

function UseCaseCircles() {
  const boardRef = useRef<HTMLDivElement>(null)
  const nodes = useRef<(HTMLButtonElement | null)[]>([])
  const piecesRef = useRef<ToBePiece[]>(useCaseRest(362))
  const held = useRef<number | null>(null)
  const grab = useRef({ lx: 0, ly: 0, lt: 0 })
  const origin = useRef({ left: 0, top: 0 })
  const size = useRef({ w: 460, h: 362 })
  const reduced = useRef(false)
  const visible = useRef(true)
  const alive = useRef(true)
  const frame = useRef(0)

  const paint = (index: number) => {
    const node = nodes.current[index]
    const piece = piecesRef.current[index]
    if (!node || !piece) return
    const moving = held.current === index || piece.awake
    node.style.transform = `translate(${piece.x}px, ${piece.y}px) rotate(${piece.angle}deg)`
    node.style.zIndex = held.current === index ? '2' : '1'
    node.style.willChange = moving ? 'transform' : ''
    node.classList.toggle('is-held', held.current === index)
  }

  const paintAll = () => {
    piecesRef.current.forEach((_, index) => paint(index))
  }

  const tick = (then: number) => {
    frame.current = requestAnimationFrame((now) => {
      if (!alive.current || held.current !== null) return
      if (!visible.current) {
        for (const node of nodes.current) {
          if (node) node.style.willChange = ''
        }
        return
      }
      const dt = Math.min(0.032, (now - then) / 1000)
      const { h } = size.current
      const floor = h - TOBE_BODY
      stepToBe(piecesRef.current, size.current.w, h, dt, h >= 300)
      let moving = false
      piecesRef.current.forEach((piece, index) => {
        const resting =
          Math.abs(piece.vx) <= 6 &&
          Math.abs(piece.vy) <= 6 &&
          Math.abs(piece.va) <= 8 &&
          (piece.y >= floor - 1 ||
            piecesRef.current.some(
              (other) =>
                other !== piece &&
                other.y > piece.y &&
                Math.abs(piece.x - other.x) < TOBE_BODY * 0.72 &&
                Math.abs(piece.y + TOBE_BODY - other.y) < 3,
            ))
        if (piece.awake && resting) {
          piece.vx = 0
          piece.vy = 0
          piece.va = 0
          piece.awake = false
        }
        if (piece.awake) moving = true
        paint(index)
      })
      if (moving) tick(now)
    })
  }

  const wake = () => {
    cancelAnimationFrame(frame.current)
    if (!reduced.current && visible.current) tick(performance.now())
  }

  useLayoutEffect(() => {
    const board = boardRef.current
    if (!board) return
    alive.current = true
    paintAll()
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const applySize = () => {
      reduced.current = motion.matches
      const width = board.clientWidth || 460
      const height = board.clientHeight || 362
      if (Math.abs(width - size.current.w) < 1 && Math.abs(height - size.current.h) < 1) return
      size.current = { w: width, h: height }
      if (held.current === null) {
        cancelAnimationFrame(frame.current)
        piecesRef.current = restOnPhone(useCaseRest(height), width, height)
        paintAll()
      }
    }
    applySize()
    const observer = new ResizeObserver(applySize)
    observer.observe(board)
    const visibility = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting
      if (!entry.isIntersecting) {
        cancelAnimationFrame(frame.current)
        return
      }
      if (piecesRef.current.some((piece) => piece.awake)) wake()
    })
    visibility.observe(board)
    motion.addEventListener('change', applySize)
    return () => {
      alive.current = false
      observer.disconnect()
      visibility.disconnect()
      motion.removeEventListener('change', applySize)
      cancelAnimationFrame(frame.current)
    }
  }, [])

  const release = (index: number) => {
    if (held.current !== index) return
    const piece = piecesRef.current[index]
    piece.vx = Math.max(-420, Math.min(420, piece.vx))
    piece.vy = Math.max(-420, Math.min(420, piece.vy))
    piece.va = Math.max(-28, Math.min(28, piece.va))
    held.current = null
    if (reduced.current) {
      piece.vx = 0
      piece.vy = 0
      piece.va = 0
      piece.awake = false
    } else {
      piece.awake = true
      wake()
    }
    paint(index)
  }

  const onPointerDown = (index: number, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      /* A canceled pointer can still drag from the element events. */
    }
    const rect = boardRef.current?.getBoundingClientRect()
    origin.current = { left: rect?.left ?? 0, top: rect?.top ?? 0 }
    const piece = piecesRef.current[index]
    held.current = index
    grab.current = {
      lx: (event.clientX - origin.current.left) / boardScale(boardRef.current),
      ly: (event.clientY - origin.current.top) / boardScale(boardRef.current),
      lt: performance.now(),
    }
    piece.vx = 0
    piece.vy = 0
    piece.va = 0
    piece.awake = false
    cancelAnimationFrame(frame.current)
    paint(index)
  }

  const onPointerMove = (index: number, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (held.current !== index) return
    const piece = piecesRef.current[index]
    const point = {
      x: (event.clientX - origin.current.left) / boardScale(boardRef.current),
      y: (event.clientY - origin.current.top) / boardScale(boardRef.current),
    }
    const now = performance.now()
    const dt = Math.max(16, now - grab.current.lt) / 1000
    const dx = point.x - grab.current.lx
    const dy = point.y - grab.current.ly
    piece.vx = dx / dt
    piece.vy = dy / dt
    const ox = grab.current.lx - (piece.x + TOBE_BODY / 2)
    const oy = grab.current.ly - (piece.y + TOBE_BODY / 2)
    piece.va = ((ox * piece.vy - oy * piece.vx) / 14000) * (180 / Math.PI)
    piece.x += dx
    piece.y += dy
    piece.angle += piece.va * dt
    grab.current = { lx: point.x, ly: point.y, lt: now }
    paint(index)
  }

  const nudge = (index: number, x: number, y: number, angle: number) => {
    const { w, h } = size.current
    const piece = piecesRef.current[index]
    held.current = index
    piece.x = Math.min(w - TOBE_BODY / 2, Math.max(-TOBE_BODY / 2, piece.x + x))
    piece.y = Math.min(h - TOBE_BODY / 2, Math.max(-TOBE_BODY * 0.45, piece.y + y))
    piece.angle += angle
    piece.vx = x * 8
    piece.vy = y * 8
    piece.va = angle * 2
    piece.awake = false
    cancelAnimationFrame(frame.current)
    paint(index)
  }

  return (
    <PieceStage className="use-side use-board" boardRef={boardRef}>
      {piecesRef.current.map((piece, index) => (
        <button
          key={piece.label}
          type="button"
          ref={(node) => {
            nodes.current[index] = node
          }}
          className="use-piece"
          aria-label={`${piece.label}. Drag to move. Arrow keys move it, and Shift with the left or right arrow rotates it.`}
          aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
          onPointerDown={(event) => onPointerDown(index, event)}
          onPointerMove={(event) => onPointerMove(index, event)}
          onPointerUp={() => release(index)}
          onPointerCancel={() => release(index)}
          onKeyDown={(event) => {
            const step = event.shiftKey ? 0 : 24
            const turn = event.shiftKey ? 18 : 0
            const move: Record<string, [number, number, number]> = {
              ArrowLeft: [-step, 0, -turn],
              ArrowRight: [step, 0, turn],
              ArrowUp: [0, -step, 0],
              ArrowDown: [0, step, 0],
            }
            const delta = move[event.key]
            if (!delta) return
            event.preventDefault()
            nudge(index, delta[0], delta[1], delta[2])
          }}
          onKeyUp={(event) => {
            if (event.key.startsWith('Arrow')) release(index)
          }}
        >
          {piece.label}
        </button>
      ))}
    </PieceStage>
  )
}

function mvpRest(height: number): ToBePiece[] {
  if (height >= 300) {
    return [
      { label: 'Gap Analysis', x: 135.24, y: -6.77, vx: 0, vy: 0, angle: 2.03, va: 0, awake: false },
      { label: 'To-Be Journey Maps', x: 3.73, y: 208.82, vx: 0, vy: 0, angle: 2.01, va: 0, awake: false },
    ]
  }
  return [
    { label: 'Gap Analysis', x: -29.44, y: -10.58, vx: 0, vy: 0, angle: 2, va: 0, awake: false },
    { label: 'To-Be Journey Maps', x: 145.44, y: -9.41, vx: 0, vy: 0, angle: 2, va: 0, awake: false },
  ]
}

function MvpCircles() {
  const boardRef = useRef<HTMLDivElement>(null)
  const nodes = useRef<(HTMLButtonElement | null)[]>([])
  const piecesRef = useRef<ToBePiece[]>(mvpRest(444))
  const held = useRef<number | null>(null)
  const grab = useRef({ lx: 0, ly: 0, lt: 0 })
  const origin = useRef({ left: 0, top: 0 })
  const size = useRef({ w: 381, h: 444 })
  const reduced = useRef(false)
  const visible = useRef(true)
  const alive = useRef(true)
  const frame = useRef(0)

  const paint = (index: number) => {
    const node = nodes.current[index]
    const piece = piecesRef.current[index]
    if (!node || !piece) return
    const moving = held.current === index || piece.awake
    node.style.transform = `translate(${piece.x}px, ${piece.y}px) rotate(${piece.angle}deg)`
    node.style.zIndex = held.current === index ? '2' : '1'
    node.style.willChange = moving ? 'transform' : ''
    node.classList.toggle('is-held', held.current === index)
  }

  const paintAll = () => {
    piecesRef.current.forEach((_, index) => paint(index))
  }

  const tick = (then: number) => {
    frame.current = requestAnimationFrame((now) => {
      if (!alive.current || held.current !== null) return
      if (!visible.current) {
        for (const node of nodes.current) {
          if (node) node.style.willChange = ''
        }
        return
      }
      const dt = Math.min(0.032, (now - then) / 1000)
      const { h } = size.current
      const floor = h - TOBE_BODY
      stepToBe(piecesRef.current, size.current.w, h, dt, h >= 300)
      let moving = false
      piecesRef.current.forEach((piece, index) => {
        const resting =
          Math.abs(piece.vx) <= 6 &&
          Math.abs(piece.vy) <= 6 &&
          Math.abs(piece.va) <= 8 &&
          (piece.y >= floor - 1 ||
            piecesRef.current.some(
              (other) =>
                other !== piece &&
                other.y > piece.y &&
                Math.abs(piece.x - other.x) < TOBE_BODY * 0.72 &&
                Math.abs(piece.y + TOBE_BODY - other.y) < 3,
            ))
        if (piece.awake && resting) {
          piece.vx = 0
          piece.vy = 0
          piece.va = 0
          piece.awake = false
        }
        if (piece.awake) moving = true
        paint(index)
      })
      if (moving) tick(now)
    })
  }

  const wake = () => {
    cancelAnimationFrame(frame.current)
    if (!reduced.current && visible.current) tick(performance.now())
  }

  useLayoutEffect(() => {
    const board = boardRef.current
    if (!board) return
    alive.current = true
    paintAll()
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const applySize = () => {
      reduced.current = motion.matches
      const width = board.clientWidth || 381
      const height = board.clientHeight || 444
      if (Math.abs(width - size.current.w) < 1 && Math.abs(height - size.current.h) < 1) return
      size.current = { w: width, h: height }
      if (held.current === null) {
        cancelAnimationFrame(frame.current)
        piecesRef.current = restOnPhone(mvpRest(height), width, height)
        paintAll()
      }
    }
    applySize()
    const observer = new ResizeObserver(applySize)
    observer.observe(board)
    const visibility = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting
      if (!entry.isIntersecting) {
        cancelAnimationFrame(frame.current)
        return
      }
      if (piecesRef.current.some((piece) => piece.awake)) wake()
    })
    visibility.observe(board)
    motion.addEventListener('change', applySize)
    return () => {
      alive.current = false
      observer.disconnect()
      visibility.disconnect()
      motion.removeEventListener('change', applySize)
      cancelAnimationFrame(frame.current)
    }
  }, [])

  const release = (index: number) => {
    if (held.current !== index) return
    const piece = piecesRef.current[index]
    piece.vx = Math.max(-420, Math.min(420, piece.vx))
    piece.vy = Math.max(-420, Math.min(420, piece.vy))
    piece.va = Math.max(-28, Math.min(28, piece.va))
    held.current = null
    if (reduced.current) {
      piece.vx = 0
      piece.vy = 0
      piece.va = 0
      piece.awake = false
    } else {
      piece.awake = true
      wake()
    }
    paint(index)
  }

  const onPointerDown = (index: number, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      /* A canceled pointer can still drag from the element events. */
    }
    const rect = boardRef.current?.getBoundingClientRect()
    origin.current = { left: rect?.left ?? 0, top: rect?.top ?? 0 }
    const piece = piecesRef.current[index]
    held.current = index
    grab.current = {
      lx: (event.clientX - origin.current.left) / boardScale(boardRef.current),
      ly: (event.clientY - origin.current.top) / boardScale(boardRef.current),
      lt: performance.now(),
    }
    piece.vx = 0
    piece.vy = 0
    piece.va = 0
    piece.awake = false
    cancelAnimationFrame(frame.current)
    paint(index)
  }

  const onPointerMove = (index: number, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (held.current !== index) return
    const piece = piecesRef.current[index]
    const point = {
      x: (event.clientX - origin.current.left) / boardScale(boardRef.current),
      y: (event.clientY - origin.current.top) / boardScale(boardRef.current),
    }
    const now = performance.now()
    const dt = Math.max(16, now - grab.current.lt) / 1000
    const dx = point.x - grab.current.lx
    const dy = point.y - grab.current.ly
    piece.vx = dx / dt
    piece.vy = dy / dt
    const ox = grab.current.lx - (piece.x + TOBE_BODY / 2)
    const oy = grab.current.ly - (piece.y + TOBE_BODY / 2)
    piece.va = ((ox * piece.vy - oy * piece.vx) / 14000) * (180 / Math.PI)
    piece.x += dx
    piece.y += dy
    piece.angle += piece.va * dt
    grab.current = { lx: point.x, ly: point.y, lt: now }
    paint(index)
  }

  const nudge = (index: number, x: number, y: number, angle: number) => {
    const { w, h } = size.current
    const piece = piecesRef.current[index]
    held.current = index
    piece.x = Math.min(w - TOBE_BODY / 2, Math.max(-TOBE_BODY / 2, piece.x + x))
    piece.y = Math.min(h - TOBE_BODY / 2, Math.max(-TOBE_BODY * 0.45, piece.y + y))
    piece.angle += angle
    piece.vx = x * 8
    piece.vy = y * 8
    piece.va = angle * 2
    piece.awake = false
    cancelAnimationFrame(frame.current)
    paint(index)
  }

  return (
    <PieceStage className="mvp-circles" boardRef={boardRef}>
      {piecesRef.current.map((piece, index) => (
        <button
          key={piece.label}
          type="button"
          ref={(node) => {
            nodes.current[index] = node
          }}
          className="mvp-piece"
          aria-label={`${piece.label}. Drag to move. Arrow keys move it, and Shift with the left or right arrow rotates it.`}
          aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
          onPointerDown={(event) => onPointerDown(index, event)}
          onPointerMove={(event) => onPointerMove(index, event)}
          onPointerUp={() => release(index)}
          onPointerCancel={() => release(index)}
          onKeyDown={(event) => {
            const step = event.shiftKey ? 0 : 24
            const turn = event.shiftKey ? 18 : 0
            const move: Record<string, [number, number, number]> = {
              ArrowLeft: [-step, 0, -turn],
              ArrowRight: [step, 0, turn],
              ArrowUp: [0, -step, 0],
              ArrowDown: [0, step, 0],
            }
            const delta = move[event.key]
            if (!delta) return
            event.preventDefault()
            nudge(index, delta[0], delta[1], delta[2])
          }}
          onKeyUp={(event) => {
            if (event.key.startsWith('Arrow')) release(index)
          }}
        >
          {piece.label}
        </button>
      ))}
    </PieceStage>
  )
}

function iaRest(height: number): ToBePiece[] {
  if (height >= 300) {
    return [
      { label: 'IA Documentation', x: 161.8, y: 228.06, vx: 0, vy: 0, angle: 90.07, va: 0, awake: false },
      { label: 'Sitemap Diagram', x: 123.46, y: 469.96, vx: 0, vy: 0, angle: 0.05, va: 0, awake: false },
    ]
  }
  return [
    { label: 'IA Documentation', x: -29.47, y: -10.58, vx: 0, vy: 0, angle: 1.98, va: 0, awake: false },
    { label: 'Sitemap Diagram', x: 145.46, y: -9.42, vx: 0, vy: 0, angle: 1.99, va: 0, awake: false },
  ]
}

function IaCircles() {
  const boardRef = useRef<HTMLDivElement>(null)
  const nodes = useRef<(HTMLButtonElement | null)[]>([])
  const piecesRef = useRef<ToBePiece[]>(iaRest(712))
  const held = useRef<number | null>(null)
  const grab = useRef({ lx: 0, ly: 0, lt: 0 })
  const origin = useRef({ left: 0, top: 0 })
  const size = useRef({ w: 420, h: 712 })
  const reduced = useRef(false)
  const visible = useRef(true)
  const alive = useRef(true)
  const frame = useRef(0)

  const paint = (index: number) => {
    const node = nodes.current[index]
    const piece = piecesRef.current[index]
    if (!node || !piece) return
    const moving = held.current === index || piece.awake
    node.style.transform = `translate(${piece.x}px, ${piece.y}px) rotate(${piece.angle}deg)`
    node.style.zIndex = held.current === index ? '2' : '1'
    node.style.willChange = moving ? 'transform' : ''
    node.classList.toggle('is-held', held.current === index)
  }

  const paintAll = () => {
    piecesRef.current.forEach((_, index) => paint(index))
  }

  const tick = (then: number) => {
    frame.current = requestAnimationFrame((now) => {
      if (!alive.current || held.current !== null) return
      if (!visible.current) {
        for (const node of nodes.current) {
          if (node) node.style.willChange = ''
        }
        return
      }
      const dt = Math.min(0.032, (now - then) / 1000)
      const { h } = size.current
      const floor = h - TOBE_BODY
      stepToBe(piecesRef.current, size.current.w, h, dt, h >= 300)
      let moving = false
      piecesRef.current.forEach((piece, index) => {
        const resting =
          Math.abs(piece.vx) <= 6 &&
          Math.abs(piece.vy) <= 6 &&
          Math.abs(piece.va) <= 8 &&
          (piece.y >= floor - 1 ||
            piecesRef.current.some(
              (other) =>
                other !== piece &&
                other.y > piece.y &&
                Math.abs(piece.x - other.x) < TOBE_BODY * 0.72 &&
                Math.abs(piece.y + TOBE_BODY - other.y) < 3,
            ))
        if (piece.awake && resting) {
          piece.vx = 0
          piece.vy = 0
          piece.va = 0
          piece.awake = false
        }
        if (piece.awake) moving = true
        paint(index)
      })
      if (moving) tick(now)
    })
  }

  const wake = () => {
    cancelAnimationFrame(frame.current)
    if (!reduced.current && visible.current) tick(performance.now())
  }

  useLayoutEffect(() => {
    const board = boardRef.current
    if (!board) return
    alive.current = true
    paintAll()
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const applySize = () => {
      reduced.current = motion.matches
      const width = board.clientWidth || 420
      const height = board.clientHeight || 712
      if (Math.abs(width - size.current.w) < 1 && Math.abs(height - size.current.h) < 1) return
      size.current = { w: width, h: height }
      if (held.current === null) {
        cancelAnimationFrame(frame.current)
        piecesRef.current = restOnPhone(iaRest(height), width, height)
        paintAll()
      }
    }
    applySize()
    const observer = new ResizeObserver(applySize)
    observer.observe(board)
    const visibility = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting
      if (!entry.isIntersecting) {
        cancelAnimationFrame(frame.current)
        return
      }
      if (piecesRef.current.some((piece) => piece.awake)) wake()
    })
    visibility.observe(board)
    motion.addEventListener('change', applySize)
    return () => {
      alive.current = false
      observer.disconnect()
      visibility.disconnect()
      motion.removeEventListener('change', applySize)
      cancelAnimationFrame(frame.current)
    }
  }, [])

  const release = (index: number) => {
    if (held.current !== index) return
    const piece = piecesRef.current[index]
    piece.vx = Math.max(-420, Math.min(420, piece.vx))
    piece.vy = Math.max(-420, Math.min(420, piece.vy))
    piece.va = Math.max(-28, Math.min(28, piece.va))
    held.current = null
    if (reduced.current) {
      piece.vx = 0
      piece.vy = 0
      piece.va = 0
      piece.awake = false
    } else {
      piece.awake = true
      wake()
    }
    paint(index)
  }

  const onPointerDown = (index: number, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      /* A canceled pointer can still drag from the element events. */
    }
    const rect = boardRef.current?.getBoundingClientRect()
    origin.current = { left: rect?.left ?? 0, top: rect?.top ?? 0 }
    const piece = piecesRef.current[index]
    held.current = index
    grab.current = {
      lx: (event.clientX - origin.current.left) / boardScale(boardRef.current),
      ly: (event.clientY - origin.current.top) / boardScale(boardRef.current),
      lt: performance.now(),
    }
    piece.vx = 0
    piece.vy = 0
    piece.va = 0
    piece.awake = false
    cancelAnimationFrame(frame.current)
    paint(index)
  }

  const onPointerMove = (index: number, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (held.current !== index) return
    const piece = piecesRef.current[index]
    const point = {
      x: (event.clientX - origin.current.left) / boardScale(boardRef.current),
      y: (event.clientY - origin.current.top) / boardScale(boardRef.current),
    }
    const now = performance.now()
    const dt = Math.max(16, now - grab.current.lt) / 1000
    const dx = point.x - grab.current.lx
    const dy = point.y - grab.current.ly
    piece.vx = dx / dt
    piece.vy = dy / dt
    const ox = grab.current.lx - (piece.x + TOBE_BODY / 2)
    const oy = grab.current.ly - (piece.y + TOBE_BODY / 2)
    piece.va = ((ox * piece.vy - oy * piece.vx) / 14000) * (180 / Math.PI)
    piece.x += dx
    piece.y += dy
    piece.angle += piece.va * dt
    grab.current = { lx: point.x, ly: point.y, lt: now }
    paint(index)
  }

  const nudge = (index: number, x: number, y: number, angle: number) => {
    const { w, h } = size.current
    const piece = piecesRef.current[index]
    held.current = index
    piece.x = Math.min(w - TOBE_BODY / 2, Math.max(-TOBE_BODY / 2, piece.x + x))
    piece.y = Math.min(h - TOBE_BODY / 2, Math.max(-TOBE_BODY * 0.45, piece.y + y))
    piece.angle += angle
    piece.vx = x * 8
    piece.vy = y * 8
    piece.va = angle * 2
    piece.awake = false
    cancelAnimationFrame(frame.current)
    paint(index)
  }

  return (
    <PieceStage className="ia-circles" boardRef={boardRef}>
      {piecesRef.current.map((piece, index) => (
        <button
          key={piece.label}
          type="button"
          ref={(node) => {
            nodes.current[index] = node
          }}
          className="ia-piece"
          aria-label={`${piece.label}. Drag to move. Arrow keys move it, and Shift with the left or right arrow rotates it.`}
          aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
          onPointerDown={(event) => onPointerDown(index, event)}
          onPointerMove={(event) => onPointerMove(index, event)}
          onPointerUp={() => release(index)}
          onPointerCancel={() => release(index)}
          onKeyDown={(event) => {
            const step = event.shiftKey ? 0 : 24
            const turn = event.shiftKey ? 18 : 0
            const move: Record<string, [number, number, number]> = {
              ArrowLeft: [-step, 0, -turn],
              ArrowRight: [step, 0, turn],
              ArrowUp: [0, -step, 0],
              ArrowDown: [0, step, 0],
            }
            const delta = move[event.key]
            if (!delta) return
            event.preventDefault()
            nudge(index, delta[0], delta[1], delta[2])
          }}
          onKeyUp={(event) => {
            if (event.key.startsWith('Arrow')) release(index)
          }}
        >
          {piece.label}
        </button>
      ))}
    </PieceStage>
  )
}

function ThemeSlide({
  label,
  text,
  panels,
}: {
  label: string
  text: string
  panels: { src: string; color: string }[]
}) {
  return (
    <article className="theme-slide">
      <div className="theme-card">
        {panels.map((panel) => (
          <div
            className="theme-panel"
            key={panel.src}
            style={{ background: panel.color }}
          >
            <img src={panel.src} alt="" />
          </div>
        ))}
      </div>
      <div className="theme-copy">
        <p className="theme-tag">{label}</p>
        <p className="theme-quote">{text}</p>
      </div>
    </article>
  )
}

function Marquee({
  children,
  label,
  className = '',
}: {
  children: ReactNode
  label: string
  className?: string
}) {
  return (
    <div className={`marquee ${className}`} aria-label={label}>
      <div className="marquee-track">
        <div className="marquee-set">{children}</div>
        <div className="marquee-set" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  )
}

export function CaseStudy3() {
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'QA Platform For a Trillion Dollar Company — Abhishek Kashid'
    return () => {
      document.title = previousTitle
    }
  }, [])

  return (
    <div className="case-study">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <main id="main" className="cs-column">
        <section className="cs-hero" aria-labelledby="case-title">
          <div className="hero-head">
            <ShippedBadge>SHIPPED</ShippedBadge>
            <div className="cs-title-row">
              <h1 id="case-title">QA Platform For a Trillion Dollar Company</h1>
              <p className="dek">
                Digitalizing the QA Process for a Trillion-Dollar Automobile
                Manufacturer
              </p>
            </div>
          </div>
          <div className="hero-frame">
            <img
              src="/case-study-3/hero.png"
              alt="Dark dashboard layout with a sidebar and six content panels."
            />
          </div>
          <div className="cs-intro">
            <div className="cs-intro-copy">
              <p>
                This project was about transforming a complex, manual quality
                assurance (QA) process for one of the world’s largest automobile
                manufacturers into a seamless digital system.
              </p>
              <p>
                My role was to drive the research, product vision, UX strategy,
                and interface design basically taking the product from a messy
                manual workflow to a clear, efficient digital experience.
              </p>
            </div>
            <div className="meta-block">
              <dl className="meta-grid">
                <div>
                  <dt>PRODUCT</dt>
                  <dd>Dashboard</dd>
                </div>
                <div>
                  <dt>TIMELINE</dt>
                  <dd>Q2 2025 - Q3 2025</dd>
                </div>
                <div>
                  <dt>MY ROLE</dt>
                  <dd>Sole Designer</dd>
                </div>
              </dl>
              <ul className="role-list">
                <li>Product Design</li>
                <li>Primary Research</li>
                <li>Workshop</li>
                <li>Information Architect</li>
              </ul>
            </div>
          </div>
          <ul className="stat-list">
            {stats.map((stat) => (
              <li key={stat.label}>
                <p className="stat-label">
                  <UsersIcon />
                  {stat.label}
                </p>
                <p className="stat-value">{stat.value}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="cs-section" aria-labelledby="why-title">
          <Split id="why-title" title="Why This Project Started">
            <p>
              Even though this company is a global leader, its QA process was
              still running on Excel sheets, email threads, and paper-based
              approvals. Every new vehicle part required multiple quality checks,
              reports, and sign-offs, and each of those steps was painfully slow
              and error-prone.
            </p>
            <p>
              The management team wanted to digitize the process to save time,
              reduce errors, and gain visibility into where each quality issue
              stood. My goal was to design a platform that QA engineers,
              suppliers, and auditors could actually use without friction.
            </p>
          </Split>
          <Marquee label="Interview themes" className="theme-marquee">
            {themes.map((theme) => (
              <ThemeSlide key={theme.label} {...theme} />
            ))}
          </Marquee>
        </section>

        <section className="cs-section" aria-labelledby="research-title">
          <Split id="research-title" title="Research and Discovery">
            <p className="kicker">Stakeholder Alignment</p>
            <p>
              The project started with a kickoff workshop to align the business,
              tech, and design teams.
            </p>
          </Split>
          <div className="stage-row">
            <div className="question-stack">
              {questions.map((question) => (
                <p className="question-card" key={question}>
                  {question}
                </p>
              ))}
            </div>
            <DiscoveryBoard />
          </div>
          <CaptionRow
            columns="716fr 382fr"
            left="We defined the vision, success metrics, and constraints. The key questions were:"
            right="Deliverables: Vision statement, success metrics, stakeholder map."
          />
        </section>

        <section className="cs-section" aria-labelledby="persona-title">
          <Split id="persona-title" title="Persona Development">
            <p>
              We interviewed over 20 QA engineers, managers, suppliers, and
              auditors to understand how they work day to day.
            </p>
            <p>
              We asked about their responsibilities, frustrations, and current
              tools.
            </p>
            <p>
              The result was a set of personas that represented the core users of
              the system: QA Engineers (who execute), Managers (who monitor), and
              Auditors (who verify)
            </p>
          </Split>
          <div className="stage-row persona-stage">
            <PersonaCircles />
            <div className="dark-stage persona-board">
              <div className="marquee persona-avatars">
                <div className="avatar-track">
                  {Array.from({ length: 16 }, (_, index) => (
                    <figure className="avatar" key={index}>
                      <img src="/case-study-3/persona.png" alt="" />
                      <figcaption>Aspiring Designer</figcaption>
                    </figure>
                  ))}
                </div>
              </div>
              <div className="marquee persona-questions">
                <div className="q-track">
                  {[...personaQuestions, ...personaQuestions].map((question, index) => (
                    <p className="q-pill" key={`${question}-${index}`}>
                      {question}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <CaptionRow
            columns="405fr 693fr"
            left="Deliverables: Persona profiles and empathy maps"
            right="Questions and User Persona"
          />
        </section>

        <section className="cs-section" aria-labelledby="asis-title">
          <Split id="asis-title" title="As-Is Journey Mapping">
            <p>
              We mapped the existing QA process step-by-step from inspection to
              reporting to approval. It was a patchwork of emails, Excel files,
              and physical documents.
            </p>
            <p>
              We identified bottlenecks like unclear communication, broken
              handoffs, and repeated manual work
            </p>
          </Split>
          <div className="journey-sizer">
            <div className="dark-stage journey">
            <div className="journey-scale">
              <div className="journey-marquee">
                <div className="journey-people">
                  {[0, 1].map((copy) => (
                    <div className="journey-set" key={copy} aria-hidden={copy === 1}>
                      {Array.from({ length: 8 }, (_, index) => (
                        <figure key={index}>
                          <img src="/case-study-3/persona.png" alt="" />
                          <figcaption>Aspiring Designer</figcaption>
                        </figure>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <p className="journey-goal">Specific User + Scenario + Goals</p>
              <div className="journey-grid">
                <p className="cell cell-blue">Phase 1</p>
                <p className="cell cell-blue">Phase 1</p>
                <p className="cell cell-blue">Phase 2</p>
                <p className="cell cell-blue">Phase 3</p>
                <p className="cell cell-label">Touchpoints</p>
                <div className="journey-col">
                  <p className="cell cell-purple">Touchpoint 1</p>
                  <p className="cell cell-purple">Touchpoint 2</p>
                  <p className="cell cell-purple">Touchpoint 3</p>
                </div>
                <div className="journey-col">
                  <p className="cell cell-purple">Touchpoint 4</p>
                  <p className="cell cell-purple">Touchpoint 5</p>
                  <p className="cell cell-purple">Touchpoint 6</p>
                </div>
                <div className="journey-col">
                  <p className="cell cell-purple">Touchpoint 7</p>
                  <p className="cell cell-purple">Touchpoint 8</p>
                  <p className="cell cell-purple">Touchpoint 9</p>
                </div>
                <p className="cell cell-blue">Phase 1</p>
                <p className="cell cell-green">Opportunities + Internal Ownership</p>
              </div>
            </div>
            </div>
          </div>
          <p className="deliverable journey-caption">Mapping the As-Is Journey</p>
          <DeliverableCircles />
          <p className="deliverable">
            Deliverables: As-Is Journey Maps and Annotated Pain Points.
          </p>
        </section>

        <section className="cs-section" aria-labelledby="comp-title">
          <Split id="comp-title" title="Research and Competitor Analysis">
            <p>
              To ground our solution, we shadowed the QA teams and benchmarked
              competitor platforms in manufacturing and logistics.
            </p>
            <p>
              We noted how other tools handled data tracking, reporting, and
              communication.
            </p>
          </Split>
          <div className="stage-row">
            <div className="dark-stage shot-stage">
              {[0, 1].map((row) => (
                <div className="shot-row" key={row}>
                  <div className={row === 0 ? 'shot-track' : 'shot-track shot-track-right'}>
                    {[0, 1].map((copy) => (
                      <div className="shot-set" key={copy} aria-hidden={copy === 1 || undefined}>
                        {shots.map((src, index) => (
                          <img
                            key={`${src}-${copy}`}
                            src={src}
                            alt={
                              copy === 0 ? `Competitor interface screenshot ${index + 1}` : ''
                            }
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <ResearchCircles />
          </div>
          <CaptionRow
            columns="634fr 464fr"
            left="Indirect Similar Pattern Flow Mapping"
            right="Deliverables: Observation Notes and Competitor Benchmarking Deck."
          />
        </section>

        <section className="cs-section" aria-labelledby="insights-title">
          <Split id="insights-title" title="Insights and Pain Points">
            <p>
              After synthesizing all the research, we found a few core pain
              points driving most of the inefficiencies:
            </p>
            <p className="pain-line">
              Communication gaps between teams caused long approval cycles.
            </p>
            <p className="pain-line">
              Communication gaps between teams caused long approval cycles.
            </p>
            <p className="pain-line">
              Communication gaps between teams caused long approval cycles.
            </p>
            <p className="pain-line">
              Communication gaps between teams caused long approval cycles.
            </p>
          </Split>
          <div className="stage-row">
            <InsightsCircles />
            <div className="dark-stage tool-board">
              <div className="tool-row">
                <p className="tool-card">Maze</p>
                <p className="tool-card">Notion</p>
                <p className="tool-card">Dovetail</p>
              </div>
              <p className="tool-used">Tools Used</p>
            </div>
          </div>
          <CaptionRow
            columns="426fr 672fr"
            left="Deliverables: Affinity Diagrams and Insights Summary."
            right="Tools used to Conduct Research and Documentation"
          />
        </section>

        <section className="cs-section" aria-labelledby="use-title">
          <Split id="use-title" title="Use Case Analysis">
            <p>
              We listed every possible user action.. submitting reports,
              approving, tracking, commenting and prioritized them by frequency
              and importance.
            </p>
          </Split>
          <div className="stage-row use-row">
            <div className="dark-stage use-list">
              <p>Submitting Reports</p>
              <p>Approving Submissions</p>
              <p>Tracking Stages</p>
              <p>Commenting</p>
            </div>
            <UseCaseCircles />
          </div>
          <CaptionRow
            columns="646fr 452fr"
            left="High Level Use Cases"
            right="Deliverables: Use Case Catalog and Prioritized Task List."
          />
        </section>

        <section className="cs-section" aria-labelledby="tobe-title">
          <Split id="tobe-title" title="To-Be Journey Mapping">
            <p>
              Using insights and use cases, we designed the ideal digital
              workflow. This included reducing handoffs, adding automated alerts,
              and improving visibility into status tracking.
            </p>
            <p>
              We validated it through co-creation workshops with the QA team to
              ensure it aligned with real needs
            </p>
          </Split>
          <div className="stage-row tobe-row">
            <div className="tobe-col">
              <ToBeCircles />
              <p className="deliverable">
                Deliverables: To-Be Journey Maps and Gap Analysis.
              </p>
            </div>
            <div className="tobe-col tobe-col-pills">
              <div className="dark-stage tobe-pills">
                {['Reducing Handoffs', 'Automated Alerts', 'Improving Visibility', 'Status Tracking'].map(
                  (label) => (
                    <button key={label} type="button" className="tobe-pill">
                      <span className="tobe-pill-glow" aria-hidden="true" />
                      <span className="tobe-pill-sheen" aria-hidden="true" />
                      <span className="tobe-pill-fill" aria-hidden="true" />
                      <span>{label}</span>
                    </button>
                  ),
                )}
              </div>
              <p className="deliverable">Very high Level As -Is-Journey Mapping</p>
            </div>
          </div>
        </section>

        <section className="cs-section" aria-labelledby="mvp-title">
          <Split id="mvp-title" title="Feature Prioritization and MVP Scope">
            <p>
              We plotted features on a Value vs Effort matrix to decide what to
              build first.
            </p>
          </Split>
          <div className="stage-row mvp-stage">
            <div className="dark-stage mvp-board">
              <div className="mvp-row">
                <p>ACTIVITY</p>
                <div className="mvp-pills">
                  <span>Activity 1</span>
                  <span>Activity 2</span>
                  <span>Activity 3</span>
                </div>
              </div>
              <div className="mvp-row">
                <p>EPICS</p>
                <div className="mvp-pills">
                  <span>Real-time QA Visbility</span>
                  <span>Role Based Permissions</span>
                  <span>Simplified Defect Report</span>
                </div>
              </div>
              <div className="mvp-row">
                <p>USER STORIES</p>
                <div className="mvp-pills">
                  <span>Story 1</span>
                  <span>Story 2</span>
                  <span>Story 3</span>
                </div>
              </div>
            </div>
            <MvpCircles />
          </div>
          <CaptionRow
            columns="725fr 373fr"
            left="MVP Scoping"
            right="Deliverables: MVP Feature List and Prioritization Matrix."
          />
        </section>

        <section className="cs-section" aria-labelledby="ia-title">
          <Split id="ia-title" title="Information Architecture">
            <p>
              After validating the use cases, I clustered them into core modules:
              Dashboard, Workflows, Reports, and Settings.
            </p>
          </Split>
          <div className="ia-layout">
            <IaCircles />
            <div className="dark-stage ia-side">
              <div className="legend">
                <p className="legend-title">Legend</p>
                <ul>
                  <li>
                    <span className="swatch" />
                    Most Important
                  </li>
                  <li>
                    <span className="swatch" />
                    Important
                  </li>
                  <li>
                    <span className="swatch" />
                    Less Important
                  </li>
                  <li>
                    <span className="swatch" />
                    Least Important
                  </li>
                </ul>
              </div>
              <div className="ia-rows">
                <p>Dashboard</p>
                <p>Workflows</p>
                <p>Reports</p>
                <p>Settings</p>
              </div>
            </div>
          </div>
          <CaptionRow
            columns="420fr 678fr"
            left="Deliverables: Sitemap Diagram and IA Documentation."
            right="Information Architecture"
          />
        </section>

        <section className="cs-section" aria-labelledby="learn-title">
          <Split id="learn-title" title="Reflection and Learnings">
            <div className="learn-block">
              <p className="kicker">Designer &amp; Product Owner</p>
              <p>
                This project taught me how to think like both a designer and a
                product manager. I had to manage stakeholders, align business
                goals, and translate user research into tangible features.
              </p>
            </div>
            <div className="learn-block">
              <p className="kicker">Manual to Digital &lt;&gt; 0 - 1</p>
              <p>
                The biggest win was watching a manual, fragmented workflow evolve
                into a connected digital product that could actually scale across
                plants.
              </p>
            </div>
            <div className="learn-block">
              <p className="kicker">Holistic Visiblity</p>
              <p>
                The redesigned QA system didn’t just reduce errors and turnaround
                time it also gave leadership real-time visibility, which was
                previously impossible.
              </p>
            </div>
          </Split>
        </section>

        <section className="next-layout" aria-labelledby="request-title">
          <div className="next-copy">
            <h2 id="request-title">Request a Case Study</h2>
            <p>
              Want to learn more about this project?
              <br />
              Get in touch to request a case study.
            </p>
            <button className="touch" type="button">
              Get in Touch
            </button>
          </div>
          <article className="next-project" aria-labelledby="next-title">
            <p>Next Project</p>
            <div className="next-frame">
              <img
                src="/case-study-3/next-project.webp"
                alt="Dark learning interface labeled Edge."
              />
              <p className="next-chip">Product Design</p>
            </div>
            <h3 id="next-title">Gen Alpha Accelerator</h3>
            <p className="sub">AI - Enabled Learning Management System</p>
          </article>
        </section>
      </main>

      <CaseStudyFooter />
    </div>
  )
}
