import { useEffect, useRef, useState } from 'react'
import { Glyph, ENTER, PlayButton, TRAVEL, enter, prefersReducedMotion, pulse, travelLight, useRun } from './caseStudyMotion.tsx'
import './research-flow.css'

/** Replace the [bracketed] values with real ones; nothing else needs to change. */
const content = {
  label: 'How the research works',
  text: 'Evidence comes first, then the bets it can’t settle, then the key tests, until the pilot proves the case.',
  loop: 'Pilot results feed back into the bets',
  steps: [
    { title: 'What I know', section: 'know', figure: '[00]', unit: '[unit]', note: '[Add the evidence]', wire: 'the gaps', icon: 'search' },
    { title: 'What I assume', section: 'assume', figure: '[00]', unit: '[unit]', note: '[Add the bets]', wire: 'top bets first', icon: 'decision-tree' },
    { title: 'What we test first', section: 'first', figure: '[00]', unit: '[unit]', note: '[Add the pass mark]', wire: 'what passes', icon: 'chemistry' },
    { title: 'How we know', section: 'after', figure: '[00]', unit: '[unit]', note: '[Add the pilot size]', icon: 'meter' },
  ],
}

const STEP = 1250

function buildRun(root: HTMLElement) {
  const reduced = prefersReducedMotion()
  const run: Animation[] = []
  const animate = (selector: string, index: number, keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
    const element = root.querySelectorAll(selector)[index]
    if (element) run.push(element.animate(keyframes, options))
  }
  const card = (index: number) => root.querySelectorAll('.rf-card')[index]

  content.steps.forEach((_, i) => {
    const start = 200 + STEP * i
    const wire = start + 450
    run.push(enter(card(i), start), pulse(card(i), start))
    if (!reduced) {
      animate('.rf-trace', i, [{ transform: 'none' }], { delay: wire, duration: 800, easing: TRAVEL, fill: 'both' })
      const light = root.querySelectorAll('.rf-light')[i]
      if (light) run.push(travelLight(light, wire, 800))
    }
    animate('.rf-word', i, [{ color: 'var(--rf-ink)', offset: 0.2 }, { color: 'var(--rf-ink)', offset: 0.7 }], { delay: wire, duration: 1700, easing: 'ease-in-out' })
  })
  if (!reduced) {
    animate('.rf-loop-trace', 0, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { delay: 4400, duration: 1120, easing: TRAVEL, fill: 'both' })
    animate('.rf-loop-light', 0, [{ offsetDistance: '0%', opacity: 0 }, { opacity: 1, offset: 0.1 }, { opacity: 1, offset: 0.9 }, { offsetDistance: '100%', opacity: 0 }], { delay: 4400, duration: 1120, easing: TRAVEL, fill: 'both' })
  }
  animate('.rf-loop-word', 0, [{ opacity: 0.35 }, { opacity: 1 }], { delay: 4400, duration: 250, easing: ENTER, fill: 'both' })
  run.push(pulse(card(1), 5520))
  return run
}

export function ResearchFlow({ chapterId }: { chapterId: string }) {
  const { rootRef, replay } = useRun<HTMLElement>(buildRun)
  const loopRef = useRef<HTMLDivElement>(null)
  const [loopWidth, setLoopWidth] = useState(0)

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setLoopWidth(entry.contentRect.width))
    if (loopRef.current) observer.observe(loopRef.current)
    return () => observer.disconnect()
  }, [])

  const w = loopWidth
  const loopPath = `M ${w} 0 V 24 Q ${w} 36 ${w - 12} 36 H 12 Q 0 36 0 24 V 4`

  return (
    <div className="rf-frame">
      <section ref={rootRef} className="rf" aria-labelledby={`${chapterId}-flow`}>
        <div className="rf-head">
          <h3 id={`${chapterId}-flow`} className="rf-label">
            {content.label}
          </h3>
          <p className="rf-text">{content.text}</p>
        </div>
        <PlayButton onClick={replay} />
        <div className="rf-board">
          <ol className="rf-row">
            {content.steps.map((step) => (
              <li key={step.title} className="rf-cell">
                <a className="rf-card fx-step" href={`#${chapterId}-${step.section}`}>
                  <span className="rf-icon" aria-hidden="true">
                    <Glyph icon={step.icon} />
                  </span>
                  <span className="rf-title">{step.title}</span>
                  <span className="rf-figure">{step.figure}</span>
                  <span className="rf-unit">{step.unit}</span>
                  <span className="rf-note">{step.note}</span>
                </a>
                {step.wire ? (
                  <span className="rf-wire">
                    <span className="rf-line" aria-hidden="true">
                      <span className="rf-trace" />
                      <span className="rf-light" />
                    </span>
                    <span className="rf-word">{step.wire}</span>
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
          <div ref={loopRef} className="rf-loop" aria-hidden="true">
            <svg className="rf-loop-svg" width="100%" height="56">
              <path className="rf-loop-base" d={w ? loopPath : undefined} />
              <path className="rf-loop-trace" d={w ? loopPath : undefined} pathLength={1} />
              <path className="rf-loop-arrow" d="M -4 8 L 0 4 L 4 8" />
            </svg>
            <span className="rf-loop-light" style={{ offsetPath: `path("${loopPath}")` }} />
          </div>
          <p className="rf-loop-word">{content.loop}</p>
        </div>
      </section>
    </div>
  )
}
