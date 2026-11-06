import { useState, type CSSProperties } from 'react'
import { PlayButton, TRAVEL, prefersReducedMotion, useRun } from './caseStudyMotion.tsx'
import './token-story.css'

const merchants = [
  { name: 'Delta Parts', colour: '#1f4fbf' },
  { name: 'Rijnmond Foodservice', colour: '#1b6b3a' },
]

const stages = [
  { layer: 'Primitive', path: 'color.brand.500', note: 'The raw value is each merchant’s one colour.', word: 'means' },
  { layer: 'Semantic', path: 'surface.brand', ref: '{color.brand.500}', note: 'Gives it a meaning: the brand’s surface.', word: 'acts as' },
  { layer: 'Role', path: 'action.primary-bg', ref: '{surface.brand}', note: 'Says where it acts: the main button’s fill.', word: 'paints' },
]

const REST = 'Change one primitive, and each role built on it follows.'

export function TokenStory() {
  const [picked, setPicked] = useState(0)
  const [lit, setLit] = useState(4)
  const [colours, setColours] = useState<number[] | null>(null)
  const [hexFor, setHexFor] = useState<number | null>(null)
  const [caption, setCaption] = useState<string | null>(null)

  const { rootRef, replay } = useRun<HTMLElement>((root) => {
    if (prefersReducedMotion()) {
      setCaption(null)
      return []
    }
    const from = picked
    const to = (picked + 1) % merchants.length
    const run: Animation[] = []
    const cue = (delay: number, action: () => void) => {
      const animation = root.animate([], { delay, duration: 1 })
      animation.onfinish = action
      run.push(animation)
    }
    const rings = root.querySelectorAll('.ts-ring')
    const ring = (i: number, delay: number) => run.push(rings[i].animate([{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 0 }], { delay, duration: 900, easing: 'cubic-bezier(0.2, 0, 0, 1)' }))
    const wire = (i: number, delay: number, light: number) => {
      const cell = root.querySelectorAll('.ts-wire')[i]
      const total = light + 900
      run.push(
        cell.querySelector('.ts-trace')!.animate(
          [
            { transform: 'var(--ts-trace-from)', opacity: 1 },
            { transform: 'none', opacity: 1, offset: 0.7 },
            { transform: 'none', opacity: 0 },
          ],
          { delay, duration: total, easing: TRAVEL },
        ),
        cell.querySelector('.ts-light')!.animate(
          [
            { opacity: 0 },
            { opacity: 0, offset: 0.08 },
            { opacity: 1, offset: 0.22 },
            { opacity: 1, offset: 0.88 },
            { opacity: 0, transform: 'var(--ts-light-end)' },
          ],
          { delay, duration: light, easing: TRAVEL },
        ),
        cell.querySelector('.ts-word')!.animate(
          [
            { color: 'var(--fx-ink)', offset: 0.2 },
            { color: 'var(--fx-ink)', offset: 0.7 },
          ],
          { delay, duration: light + 700, easing: 'ease-in-out' },
        ),
      )
    }
    const paint = (delay: number, stage: number, merchant: number) =>
      cue(delay, () =>
        setColours((current) => {
          const next = [...(current ?? [from, from, from, from])]
          next[stage] = merchant
          return next
        }),
      )

    setLit(0)
    setColours([from, from, from, from])
    setHexFor(from)
    setCaption('A raw value gets a meaning, then a place, then a screen.')
    ;[209, 1209, 2209, 3203].forEach((at, i) => {
      cue(at, () => setLit(i + 1))
      ring(i, at)
    })
    ;[604, 1603, 2605].forEach((at, i) => wire(i, at, 600))

    cue(4008, () => {
      setHexFor(to)
      setCaption(`Swap in ${merchants[to].name}’s primitive, ${merchants[to].colour}. The names above it stay.`)
    })
    paint(4008, 0, to)
    ;[4006, 4576, 4995, 5413].forEach((at, i) => {
      ring(i, at)
      if (i) paint(at, i, to)
    })
    ;[4153, 4576, 4996].forEach((at, i) => wire(i, at, 420))
    cue(5413, () => setPicked(to))
    cue(5703, () => setCaption('Approve follows. “Call the workshop lead” stays purple at every merchant.'))
    run.push(root.querySelector('.ts-press-ring')!.animate([{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 0 }], { delay: 5703, duration: 900, easing: 'cubic-bezier(0.2, 0, 0, 1)' }))

    cue(7604, () => {
      setHexFor(from)
      setCaption(null)
    })
    paint(7604, 0, from)
    ;[7603, 8073, 8392, 8712].forEach((at, i) => {
      ring(i, at)
      if (i) paint(at, i, from)
    })
    ;[7753, 8074, 8393].forEach((at, i) => wire(i, at, 320))
    cue(8713, () => {
      setPicked(from)
      setColours(null)
      setHexFor(null)
    })
    return run
  })

  const colourOf = (stage: number) => merchants[colours ? colours[stage] : picked].colour
  const hex = merchants[hexFor ?? picked]
  const rest = caption === null

  return (
    <figure ref={rootRef} className="ts">
      <div className="ts-head">
        <p className="ts-label">Follow one token</p>
        <PlayButton label="Play the token" onClick={replay} />
      </div>
      <ol className="ts-stages">
        {stages.map((stage, i) => (
          <li key={stage.layer} className="ts-cell">
            <div className={lit > i ? 'ts-stage is-lit' : 'ts-stage'}>
              <span className="ts-ring" aria-hidden="true" />
              <span className="ts-layer">{stage.layer}</span>
              <span className="ts-token">
                <span className="ts-swatch" style={{ background: colourOf(i) }} aria-hidden="true" />
                <span className="ts-token-text">
                  <code className="ts-path">{stage.path}</code>
                  {stage.ref ? <code className="ts-ref">= {stage.ref}</code> : <span className="ts-override">= {'{color.brand.base}'}, the merchant’s override</span>}
                </span>
              </span>
              {i === 0 ? (
                <span key={hex.name} className="ts-hex-row">
                  <code className="ts-hex">{hex.colour}</code>
                  <span className="ts-hex-owner">{hex.name}</span>
                </span>
              ) : null}
              <strong className="ts-note">{stage.note}</strong>
            </div>
            <span className="ts-wire" aria-hidden="true">
              <span className="ts-line">
                <span className="ts-trace" />
                <span className="ts-light" />
              </span>
              <span className="ts-word">{stage.word}</span>
            </span>
          </li>
        ))}
        <li className="ts-cell is-screen">
          <div className={lit > 3 ? 'ts-stage is-lit' : 'ts-stage'}>
            <span className="ts-ring" aria-hidden="true" />
            <span className="ts-layer">On screen</span>
            <span className="ts-buttons">
              <span className="ts-press">
                <span className="ts-button" style={{ '--ts-brand': colourOf(3) } as CSSProperties}>Approve €325.50</span>
                <code className="ts-tag">action.primary-bg</code>
              </span>
              <span className="ts-press">
                <span className="ts-button is-person">
                  Call the workshop lead
                  <span className="ts-press-ring" aria-hidden="true" />
                </span>
                <code className="ts-tag">action.person-bg</code>
              </span>
            </span>
            <strong className="ts-note">The approver taps it for the Golf in bay 2, at step B5.</strong>
          </div>
        </li>
      </ol>
      <p className="ts-caption">
        <span key={caption ?? 'rest'} className={rest ? 'ts-caption-text is-rest' : 'ts-caption-text'}>{caption ?? REST}</span>
      </p>
      <div className="ts-foot">
        <span className="ts-foot-label">Merchant</span>
        <div className="ts-segment" role="group" aria-label="Merchant">
          {merchants.map((merchant, i) => (
            <button key={merchant.name} type="button" className="ts-segment-item" aria-pressed={picked === i} onClick={() => setPicked(i)}>
              <span className="ts-segment-dot" style={{ background: merchant.colour }} aria-hidden="true" />
              {merchant.name}
            </button>
          ))}
        </div>
      </div>
      <figcaption className="visually-hidden">Change one primitive and each role built on it follows. 6 of the 38 roles use the brand, and a pale brand gets dark text, so white never falls below 4.5:1.</figcaption>
    </figure>
  )
}
