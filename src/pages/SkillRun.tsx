import { useEffect, useState } from 'react'
import { PlayButton, TRAVEL, prefersReducedMotion, useRun } from './caseStudyMotion.tsx'
import { ReceiptLines } from './VoicePath.tsx'
import './skill-run.css'

type Part = { title: string; text: string; note: string }

const REST = (
  <>
    <strong>The same file holds every card to the same facts, and 3 checks hold it to the rules that cost money or safety.</strong> So a mistake by an AI tool is caught before it ships.
  </>
)
const CAPTION_READ = 'At design time, an AI tool reads the rules file, then each part, in order.'
const CAPTION_CHECK = 'Then the same 3 checks run on the card, and a designer reviews it.'

// Each part is read 1300ms after the last, and what it produces appears as its light arrives.
const WIRE_STARTS = [605, 1909, 3205, 4505, 5806]
const ARRIVALS = [1303, 2607, 3915, 5205, 6504]

function measure(root: HTMLElement) {
  const origin = root.querySelector('.sr-body')!.getBoundingClientRect()
  const targets = ['.sr-context', '.sr-quick', '.sr-bubble', '.sr-paint', '.sr-checks']
  const parts = root.querySelectorAll('.sr-part')
  const fileRight = root.querySelector('.sr-file')!.getBoundingClientRect().right - origin.left + 16
  const outLeft = root.querySelector('.sr-out')!.getBoundingClientRect().left - origin.left
  const mid = (fileRight + outLeft) / 2
  targets.forEach((selector, i) => {
    const y1 = parts[i].getBoundingClientRect().top - origin.top + 14
    const t = root.querySelector(selector)!.getBoundingClientRect()
    const y2 = t.top - origin.top + t.height / 2
    const d = `M ${fileRight} ${y1} C ${mid} ${y1} ${mid} ${y2} ${outLeft} ${y2}`
    root.querySelector(`.sr-trace[data-sr="${i}"]`)!.setAttribute('d', d)
    root.querySelector<HTMLElement>(`.sr-light[data-sr="${i}"]`)!.style.offsetPath = `path("${d}")`
  })
}

export function SkillRun({ parts }: { parts: Part[] }) {
  const [read, setRead] = useState(parts.length)
  const [reading, setReading] = useState<number | null>(null)
  const [shown, setShown] = useState(5)
  const [caption, setCaption] = useState<string | null>(null)

  const { rootRef, replay } = useRun<HTMLElement>((root) => {
    measure(root)
    if (prefersReducedMotion()) return []
    const run: Animation[] = []
    const cue = (delay: number, action: () => void) => {
      const animation = root.animate([], { delay, duration: 1 })
      animation.onfinish = action
      run.push(animation)
    }
    setRead(0)
    setReading(null)
    setShown(0)
    setCaption(CAPTION_READ)
    run.push(
      root.querySelector('.sr-rules-ring')!.animate(
        [
          { opacity: 0, transform: 'scale(0.96)' },
          { opacity: 0.9, transform: 'scale(1)', offset: 0.2 },
          { opacity: 0, transform: 'scale(1)' },
        ],
        { delay: 158, duration: 900, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
      ),
    )
    WIRE_STARTS.forEach((at, i) => {
      cue(at, () => {
        setRead(i + 1)
        setReading(i)
      })
      run.push(
        root.querySelector(`.sr-trace[data-sr="${i}"]`)!.animate(
          [
            { strokeDashoffset: 1, opacity: 1 },
            { strokeDashoffset: 0, opacity: 1, offset: 0.6 },
            { strokeDashoffset: 0, opacity: 0 },
          ],
          { delay: at, duration: 1600, easing: TRAVEL },
        ),
        root.querySelector(`.sr-light[data-sr="${i}"]`)!.animate(
          [
            { offsetDistance: '0%', opacity: 0 },
            { opacity: 0, offset: 0.06 },
            { opacity: 1, offset: 0.18 },
            { opacity: 1, offset: 0.88 },
            { offsetDistance: '100%', opacity: 0 },
          ],
          { delay: at, duration: 700, easing: TRAVEL },
        ),
      )
      cue(ARRIVALS[i], () => setShown(i + 1))
    })
    cue(5808, () => setCaption(CAPTION_CHECK))
    cue(8619, () => {
      setReading(null)
      setCaption(null)
    })
    return run
  })

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new ResizeObserver(() => measure(root))
    observer.observe(root.querySelector('.sr-body')!)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <figure ref={rootRef} className="sr">
      <div className="sr-bar">
        <code className="sr-file-name">skills/whatsapp-card.md</code>
        <span className="sr-rules">
          <span className="sr-rules-ring" aria-hidden="true" />
          ✓ Reads the rules file first
        </span>
        <PlayButton label="Play the skill" onClick={replay} />
      </div>
      <div className="sr-body">
        <svg className="sr-wires" aria-hidden="true">
          {parts.map((part, i) => (
            <path key={part.title} className="sr-trace" data-sr={i} pathLength={1} />
          ))}
        </svg>
        {parts.map((part, i) => (
          <span key={part.title} className="sr-light" data-sr={i} aria-hidden="true" />
        ))}
        <div className="sr-file">
          <p className="sr-col-label">The skill file</p>
          <p className="sr-md-title">
            <span className="sr-md-mark"># </span>
            Skill: WhatsApp card
          </p>
          <ol className="sr-parts">
            {parts.map((part, i) => (
              <li key={part.title} className={`sr-part${read > i ? ' is-read' : ''}${reading === i ? ' is-now' : ''}`}>
                <span className="sr-part-num">{i + 1}</span>
                <span className="sr-part-body">
                  <code className="sr-md">
                    {part.title}: {part.text}
                  </code>
                  <span className="sr-gives">→ {part.note}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="sr-out">
          <p className="sr-col-label">The card the skill asks for</p>
          <div className="sr-phone">
            <div className={shown >= 1 ? 'sr-context is-shown' : 'sr-context'}>
              <span className="sr-context-name">WhatsApp</span>
              <span className="sr-context-to">To the workshop lead</span>
            </div>
            <div className={`sr-paint${shown >= 2 ? ' is-on' : ''}${shown >= 4 ? ' is-tokens' : ''}`}>
              <div className={shown >= 3 ? 'sr-bubble is-shown' : 'sr-bubble'}>
                <p className="sr-sender">Delta Parts, AI ordering agent</p>
                <span className="fx-pill is-ok sr-acted">Agent acted</span>
                <p className="sr-bubble-text">Your receipt.</p>
                <ReceiptLines />
                <div className="vp-total">
                  <span>Total</span>
                  <strong>€325.50</strong>
                </div>
                <div className="vp-undo">
                  <span className="vp-undo-ring" aria-hidden="true" />
                  <span className="vp-undo-text">
                    <span className="vp-undo-left">Undo, 09:47 left</span>
                    <span className="vp-undo-when">Closes at 07:54, or when the van leaves</span>
                  </span>
                </div>
              </div>
              <div className={shown >= 2 ? 'sr-quick is-shown' : 'sr-quick'}>
                <span className="sr-quick-max">Max 3</span>
                <span className="sr-quick-button">Undo order</span>
                <span className="sr-quick-button">Track the van</span>
                <span className="sr-quick-button">Talk to a sales rep</span>
              </div>
            </div>
          </div>
          <div className={shown >= 5 ? 'sr-checks is-shown' : 'sr-checks'}>
            <p className="sr-check-row">
              <span className="sr-check-icons" aria-hidden="true">
                <span>✓</span>
                <span>✓</span>
                <span>✓</span>
              </span>
              <span>
                <strong>3 of 3 rules hold.</strong> A stamp on every number, 3 buttons at most, no action on a safety part.
              </span>
            </p>
            <p className="sr-check-row">
              <span className="sr-check-person" aria-hidden="true">✓</span>
              <span>Then a designer reviews the wording and the order, and I sign off.</span>
            </p>
          </div>
        </div>
      </div>
      <p className="sr-caption">
        <span key={caption ?? 'rest'} className={caption ? 'sf-caption-text' : 'sf-caption-text is-rest'}>{caption ?? REST}</span>
      </p>
    </figure>
  )
}
