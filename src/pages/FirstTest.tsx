import { ENTER, PlayButton, TRAVEL, enter, travelLight, useRun } from './caseStudyMotion.tsx'
import './research-flow.css'
import './first-test.css'

const numbers = [
  { value: '85', suffix: '/100', title: 'The threshold', scope: 'Set per category, checked on every part', text: 'The fit score a part needs for the agent to order it alone.' },
  { value: '90%', title: 'Rep agreement', scope: 'Per category, in replay and then live', text: 'How often the agent chose the same part as the sales rep. A category goes live only from 90%.' },
]

const steps = [
  {
    when: 'From week 1',
    title: 'Replay',
    text: <>Run a year of past orders through the rules, and see <strong>whether the agent picks the rep’s part.</strong></>,
    gate: 'At 90% agreement',
  },
  {
    when: 'Before go-live',
    title: 'Shadow',
    text: <>On live calls <strong>the agent suggests, the rep decides,</strong> and the two get compared.</>,
    gate: 'If 90% holds live',
  },
  {
    when: 'Category by category',
    title: 'Go live',
    text: <><strong>Only what the results support.</strong> Each category gets its own threshold, and those that pass go first.</>,
  },
]

// Timings and keyframes are the reference's own animation calls.
function buildRun(root: HTMLElement) {
  const run: Animation[] = []
  let start = 200
  root.querySelectorAll('.ft-step').forEach((step) => {
    const num = { delay: start, duration: 250, easing: ENTER, fill: 'both' } as const
    run.push(step.querySelector('.ft-num')!.animate([{ opacity: 0.22, transform: 'scale(0.86)' }, { opacity: 1, transform: 'scale(1)' }], num))
    run.push(
      step.querySelector('.ft-ring')!.animate(
        [
          { opacity: 0, transform: 'scale(0.9)' },
          { opacity: 0.7, transform: 'scale(1)', offset: 0.2 },
          { opacity: 0, transform: 'scale(1.8)' },
        ],
        { delay: start, duration: 1000, easing: 'cubic-bezier(0.2, 0, 0, 1)', fill: 'both' },
      ),
    )
    step.querySelectorAll('.ft-when, .ft-name, .ft-text').forEach((part) => run.push(enter(part, start, 0.32)))

    const gate = step.querySelector('.ft-gate')
    if (!gate) return
    const line = step.querySelector('.ft-line')!.getBoundingClientRect()
    const wire = start + 500
    const duration = Math.max(800, 600 + (Math.max(line.width, line.height) * 5) / 3)
    const lit = { color: 'var(--fx-ink)', borderColor: 'var(--fx-ink)' }
    run.push(
      step.querySelector('.ft-trace')!.animate(
        [
          { transform: 'var(--ft-trace-from)', opacity: 1 },
          { transform: 'none', opacity: 1 },
        ],
        { delay: wire, duration, easing: TRAVEL, fill: 'both' },
      ),
      step.querySelector('.ft-trace')!.animate([{ opacity: 1 }, { opacity: 0 }], { delay: wire + duration + 1100, duration: 900, easing: 'ease-out', fill: 'both' }),
      travelLight(step.querySelector('.rf-light')!, wire, duration),
      gate.animate(
        [
          { ...lit, offset: 250 / (duration + 1000) },
          { ...lit, offset: (duration + 250) / (duration + 1000) },
        ],
        { delay: wire, duration: duration + 1000, easing: 'ease-in-out' },
      ),
    )
    start = wire + duration * 0.92
  })
  run.push(enter(root.querySelector('.ft-stop')!, start + 500, 0.32))
  return run
}

export function FirstTest() {
  const { rootRef, replay } = useRun<HTMLDivElement>(buildRun)

  return (
    <div ref={rootRef} className="ft">
      <div className="ft-why">
        <p className="ft-label">Why first</p>
        <p className="ft-why-text">
          <strong>The threshold, starting at a fit score of 85 out of 100, carries the whole design. Set too low, the Golf in bay 2 gets the wrong pump.</strong>{' '}
          Set too high, the agent asks about parts it could have ordered itself.
        </p>
      </div>
      <ul className="ft-numbers">
        {numbers.map((number) => (
          <li key={number.title} className="ft-number">
            <span className="ft-figure">
              {number.value}
              {number.suffix ? <span className="ft-suffix">{number.suffix}</span> : null}
            </span>
            <span className="ft-body">
              <h4 className="ft-name">{number.title}</h4>
              <span className="ft-per">{number.scope}</span>
              <span className="ft-number-text">{number.text}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="ft-band">
        <PlayButton label="Play the steps" onClick={replay} />
        <ol className="ft-steps">
          {steps.map((step, index) => (
            <li key={step.title} className="ft-step">
              <span className="ft-top">
                <span className="ft-num">
                  {index + 1}
                  <span className="ft-ring" aria-hidden="true" />
                </span>
                <span className="ft-line" aria-hidden="true">
                  <span className="ft-trace" />
                  <span className="rf-light" />
                </span>
              </span>
              <span className="ft-when">{step.when}</span>
              <h4 className="ft-name">{step.title}</h4>
              <span className="ft-text">{step.text}</span>
              {step.gate ? (
                <span className="ft-gate">
                  <span className="visually-hidden">Moves on </span>
                  {step.gate}
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
      <p className="ft-stop">
        <span className="fx-pill is-rule">Stop rule</span>
        <span className="ft-stop-text">
          Below 90% agreement, the agent only asks the buyer to confirm in that category, and never orders alone.
        </span>
      </p>
    </div>
  )
}
