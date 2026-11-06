import { useEffect, useId, useState } from 'react'
import { Glyph, PlayButton, playWire, prefersReducedMotion, useRun } from './caseStudyMotion.tsx'
import './system-flow.css'

const process = [
  { id: 'doc', title: 'Requirements doc', text: 'The single source of truth', icon: 'M4 2.5h6l2.5 2.5v8.5H4ZM10 2.5V5h2.5M6 8h4M6 10.5h4' },
  { id: 'bet', title: 'Hypothesis', text: 'A bet that a test can prove wrong', icon: 'decision-tree' },
  { id: 'test', title: 'Test', text: 'A replay, shadow mode or A/B', icon: 'chemistry' },
]

const layers = [
  { title: 'Tokens', text: '47 primitives, 58 semantic, 38 roles' },
  { title: 'Components', text: 'In code, described by the skills' },
  { title: 'Skills', text: '5 files, one per channel, plus rules' },
]

const channels = [
  { title: 'Webshop', icon: 'M2.5 3.5h11v9h-11ZM2.5 6.5h11' },
  { title: 'WhatsApp', icon: 'chat' },
  { title: 'Email', icon: 'email' },
  { title: 'Voice', icon: 'microphone' },
  { title: 'Agents', note: 'Buyer’s and merchant’s', icon: 'model-builder' },
  { title: 'New channel', note: 'One skill, one renderer', icon: 'plus', isNew: true },
]

const foot = [
  { title: 'Checks run on every build', text: 'Scripts check the tokens and the Teams card. The design team then reviews, and I sign off.', icon: 'M3.5 8.5 6.5 11.5 12.5 4.5' },
  { title: 'Any buyer’s agent gets the same rules', text: 'An outside agent first proves who it is and that the buyer’s company allows it. The check is built after the pilot.', icon: process[1].icon },
  { title: 'It grows through data', text: 'A merchant is one colour plus its console settings, and a channel is one skill plus one renderer. So the 50th merchant needs no new design work.', icon: 'M5 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM11 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z' },
]

const wires = [
  { word: 'a need' },
  { word: 'a bet' },
  { word: 'what passed' },
  ...channels.map((channel) => ({ dashed: channel.isNew })),
  { word: 'results' },
] as { word?: string; dashed?: boolean }[]

const captions = {
  doc: 'The requirements doc says what the order must do, and for whom.',
  need: 'Each need becomes a hypothesis that a test can prove wrong.',
  passed: 'Only what passes a test goes into the system.',
  inside: 'Inside: 143 tokens in 3 layers, then components, then 5 skills.',
  build: 'AI tools build every channel from the skills, and agents read the same schema.',
  results: 'What ships is measured, and the results go back into the doc.',
}

type Spot = { d: string; word?: [number, number] }

/** Every wire's shape, using the reference's rules against the cards as they are laid out now. */
function measure(board: HTMLElement) {
  const origin = board.getBoundingClientRect()
  const box = (element: Element) => {
    const r = element.getBoundingClientRect()
    const left = r.left - origin.left
    const top = r.top - origin.top
    return { left, right: left + r.width, top, bottom: top + r.height, cx: left + r.width / 2, cy: top + r.height / 2 }
  }
  const cards = [...board.querySelectorAll('.sf-card')].map(box)
  const core = box(board.querySelector('.sf-core')!)
  const outs = [...board.querySelectorAll('.sf-channel')].map(box)
  const stacked = cards[1].top > cards[0].bottom
  const wrapped = !stacked && core.top > cards[0].bottom

  const arc = (a: (typeof cards)[0], x2: number, y2: number): Spot => {
    const x1 = a.cx + 14
    const y1 = a.top - 5
    const control = (y1 + y2) / 2 - (x2 - x1) * 0.62
    return { d: `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${control} ${x2} ${y2}`, word: [(x1 + x2) / 2, 0.25 * y1 + 0.5 * control + 0.25 * y2] }
  }
  const drop = (a: (typeof cards)[0], y2: number): Spot => ({ d: `M ${a.cx} ${a.bottom + 5} L ${a.cx} ${y2 - 5}`, word: [a.cx, (a.bottom + y2) / 2] })
  const steps: Spot[] = stacked
    ? [drop(cards[0], cards[1].top), drop(cards[1], cards[2].top), drop(cards[2], core.top)]
    : [arc(cards[0], cards[1].cx - 14, cards[0].top - 5), arc(cards[1], cards[2].cx - 14, cards[0].top - 5), wrapped ? drop(cards[2], core.top) : arc(cards[2], core.left + (core.right - core.left) * 0.45, core.top - 5)]

  const fan: Spot[] = outs.map((out) => {
    if (stacked) {
      const x = core.left + 9
      return { d: `M ${x} ${core.bottom + 5} V ${out.cy - 8} Q ${x} ${out.cy} ${x + 8} ${out.cy} H ${out.left - 5}` }
    }
    const x = core.right + 5
    return { d: `M ${x} ${core.cy} C ${x + 21} ${core.cy} ${x + 17} ${out.cy} ${out.left - 5} ${out.cy}` }
  })

  let results: Spot
  if (stacked || wrapped) {
    const x = Math.max(outs[0].right, cards[0].right) + 15
    const y1 = outs[0].cy
    const y2 = cards[0].cy
    results = {
      d: `M ${outs[0].right + 5} ${y1} H ${x - 8} Q ${x} ${y1} ${x} ${y1 - 8} V ${y2 + 8} Q ${x} ${y2} ${x - 8} ${y2} H ${cards[0].right + 5}`,
      word: [x, y2 + (y1 - y2) * 0.44],
    }
  } else {
    const from = outs[0].left + 13
    const to = cards[0].cx - 34
    const end = cards[0].top - 5
    const top = 9
    results = {
      d: `M ${from} ${outs[0].top - 5} V ${top + 12} Q ${from} ${top} ${from - 12} ${top} H ${to + 12} Q ${to} ${top} ${to} ${top + 12} V ${end}`,
      word: [(from + to) / 2, top],
    }
  }

  const spots = [...steps, ...fan, results]
  spots.forEach((spot, i) => {
    board.querySelectorAll(`[data-sf-line="${i}"]`).forEach((line) => line.setAttribute('d', spot.d))
    const group = board.querySelector<HTMLElement>(`[data-sf-wire="${i}"]`)!
    group.querySelector<HTMLElement>('.fx-wire-light')!.style.offsetPath = `path("${spot.d}")`
    const word = group.querySelector<HTMLElement>('.fx-word')
    if (word && spot.word) {
      word.style.left = `${spot.word[0]}px`
      word.style.top = `${spot.word[1]}px`
    }
  })
}

export function SystemFlow() {
  const arrowId = `sf-arrow-${useId().replace(/\W/g, '')}`
  const [caption, setCaption] = useState<string | null>(null)

  const { rootRef, replay } = useRun<HTMLElement>((root) => {
    const board = root.querySelector<HTMLElement>('.sf-board')!
    measure(board)
    if (prefersReducedMotion()) return []
    const run: Animation[] = []
    // Empty animations act as cues, so they restart with the run.
    const cue = (delay: number, text: string | null) => {
      const animation = root.animate([], { delay, duration: 1 })
      animation.onfinish = () => setCaption(text)
      run.push(animation)
    }
    const INK = 'var(--fx-ink)'
    const FLASH = 'color-mix(in oklab, var(--fx-ink) 7%, transparent)'
    const play = (i: number, start: number) => {
      const group = board.querySelector(`[data-sf-wire="${i}"]`)!
      const trace = board.querySelector<SVGPathElement>(`.fx-wire-trace[data-sf-line="${i}"]`)!
      const played = playWire(start, {
        trace,
        light: group.querySelector('.fx-wire-light')!,
        word: group.querySelector('.fx-word') ?? undefined,
        tone: INK,
        duration: Math.min(1500, Math.max(600, 520 + trace.getTotalLength())),
        fadeAfter: 800,
      })
      run.push(...played.run)
      return played.duration
    }
    const outline = (element: Element, delay: number) => run.push(element.animate([{ outlineColor: `color-mix(in oklab, ${INK} 40%, transparent)`, offset: 0.25 }], { delay, duration: 1400, easing: 'ease-out' }))
    const flash = (element: Element, delay: number, duration: number, easing: string) => run.push(element.animate([{ backgroundColor: FLASH, offset: 0.3 }], { delay, duration, easing }))
    const cards = board.querySelectorAll('.sf-card')
    const core = board.querySelector('.sf-core')!
    const outs = board.querySelectorAll('.sf-channel')

    cue(300, captions.doc)
    let start = 300
    let duration = play(0, start)
    outline(cards[1], start + duration * 0.92)
    start += duration + 350
    cue(start, captions.need)
    duration = play(1, start)
    outline(cards[2], start + duration * 0.92)
    start += duration + 350
    cue(start, captions.passed)
    duration = play(2, start)
    const arrive = start + duration * 0.92
    outline(core, arrive)
    cue(arrive, captions.inside)
    core.querySelectorAll('.sf-layer').forEach((layer, i) => flash(layer, arrive + 280 * i, 1100, 'ease-in-out'))
    flash(core.querySelector('.sf-ai')!, arrive + 840, 1100, 'ease-in-out')
    const fanStart = arrive + 1262
    cue(fanStart, captions.build)
    let fanEnd = 0
    outs.forEach((out, i) => {
      if (i === 5) return
      const length = play(3 + i, fanStart)
      flash(out, fanStart + length * 0.92, 1400, 'ease-out')
      fanEnd = Math.max(fanEnd, length)
    })
    start = fanStart + fanEnd + 350
    duration = play(8, start)
    flash(outs[5], start + duration * 0.92, 1400, 'ease-out')
    start += duration + 350
    cue(start, captions.results)
    duration = play(9, start)
    outline(cards[0], start + duration * 0.92)
    cue(start + duration + 1600, null)
    return run
  })

  useEffect(() => {
    const board = rootRef.current?.querySelector<HTMLElement>('.sf-board')
    if (!board) return
    const observer = new ResizeObserver(() => measure(board))
    observer.observe(board)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <figure ref={rootRef} className="sf">
      <PlayButton onClick={replay} />
      <div className="sf-board">
        <svg className="sf-wires" aria-hidden="true">
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path className="sf-arrow" d="M0 0 L6 3 L0 6 z" />
            </marker>
          </defs>
          {wires.map((wire, i) => (
            <path key={i} className="fx-wire" data-sf-line={i} strokeDasharray={wire.dashed ? '3 4' : undefined} markerEnd={`url(#${arrowId})`} />
          ))}
          {wires.map((_, i) => (
            <path key={i} className="fx-wire-trace" data-sf-line={i} pathLength={1} />
          ))}
        </svg>
        <ol className="sf-process">
          {process.map((item) => (
            <li key={item.id} className="sf-card fx-step">
              <span className="sf-icon" aria-hidden="true">
                <Glyph icon={item.icon} />
              </span>
              <span className="sf-name">{item.title}</span>
              <span className="sf-note">{item.text}</span>
            </li>
          ))}
        </ol>
        <div className="sf-core fx-step">
          <span className="sf-core-head">
            <span className="sf-name">Design system</span>
            <span className="sf-note">I own it. The design team builds it, with front end.</span>
          </span>
          <ol className="sf-layers">
            {layers.map((layer, i) => (
              <li key={layer.title} className="sf-layer">
                <span className="sf-layer-num">{i + 1}</span>
                <span className="sf-layer-text">
                  <span className="sf-layer-name">{layer.title}</span>
                  <span className="sf-layer-note">{layer.text}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="sf-ai">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 2.5 9.5 6.5 13.5 8 9.5 9.5 8 13.5 6.5 9.5 2.5 8 6.5 6.5Z" stroke="currentColor" strokeLinejoin="round" />
            </svg>
            AI tools read it as files
          </p>
        </div>
        <ul className="sf-channels">
          {channels.map((channel) => (
            <li key={channel.title} className={channel.isNew ? 'sf-channel is-new' : 'sf-channel'}>
              <span className="sf-channel-icon" aria-hidden="true">
                <Glyph icon={channel.icon} />
              </span>
              <span className="sf-channel-text">
                <span className="sf-channel-name">{channel.title}</span>
                {channel.note ? <span className="sf-channel-note">{channel.note}</span> : null}
              </span>
            </li>
          ))}
        </ul>
        <div className="sf-fx" aria-hidden="true">
          {wires.map((wire, i) => (
            <div key={i} data-sf-wire={i}>
              <span className="fx-wire-light" />
              {wire.word ? <span className="fx-word">{wire.word}</span> : null}
            </div>
          ))}
        </div>
      </div>
      <p className="sf-caption">
        {caption ? (
          <span key={caption} className="sf-caption-text">{caption}</span>
        ) : (
          <span key="rest" className="sf-caption-text is-rest">
            <strong>The results go back into the doc,</strong> so the next change starts from evidence.
          </span>
        )}
      </p>
      <div className="sf-foot">
        <ul className="sf-foot-list">
          {foot.map((item) => (
            <li key={item.title} className="sf-foot-item">
              <span className="sf-foot-icon" aria-hidden="true">
                <Glyph icon={item.icon} />
              </span>
              <p className="sf-foot-text">
                <strong>{item.title}</strong>
                {item.text}
              </p>
            </li>
          ))}
        </ul>
        <p className="sf-not-yet">
          <strong>Not yet, on purpose: a model drawing a buyer’s screen live.</strong> A reviewed renderer builds each card, and the card check only reads Teams cards for now.
        </p>
      </div>
    </figure>
  )
}
