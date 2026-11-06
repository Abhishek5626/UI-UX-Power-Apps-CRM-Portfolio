import './system-frames.css'

const states = [
  { name: 'Go', tone: 'go' },
  { name: 'Look first', tone: 'look' },
  { name: 'A person', tone: 'person' },
  { name: 'Stop', tone: 'stop' },
  { name: 'Closed', tone: 'closed' },
  { name: 'Action', tone: 'action' },
]

/** Figma 236:2492; its absolute layout is reflowed for the 931px column. */
export function StateRulesFrame() {
  return (
    <div className="sx-states">
      <div className="sx-states-top">
        <p className="sx-states-text">
          <strong>Every agent state is a token, so every channel says the same thing.</strong> Act, ask, explain, fall back, hand over and be undone, in 5 state colours. The brand only marks actions.
        </p>
        <ul className="sx-pills">
          {states.map((state) => (
            <li key={state.name} className={`sx-pill is-${state.tone}`}>{state.name}</li>
          ))}
        </ul>
      </div>
      <p className="sx-states-note">Assumption: buyers read the 7 state pills at a glance. In the workshop visits, weeks 1 to 4, buyers say what each means. Under 8 of 10 right, the words change.</p>
    </div>
  )
}

/** Figma 236:2480; its absolute layout is reflowed for the 931px column. */
export function VoiceRationaleFrame() {
  return (
    <aside className="sx-voice" aria-label="Why I decided this">
      <p className="sx-voice-label">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 2a4.5 4.5 0 0 0-2.5 8.2V12h5v-1.8A4.5 4.5 0 0 0 8 2ZM6.5 14h3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Why I decided this
      </p>
      <p className="sx-voice-title">
        Voice gets tokens too, as speaking rules.
        <span className="sx-voice-tag">Assumption</span>
      </p>
      <p className="sx-voice-text">
        <strong>Voice has no colour, so its tokens are words and order.</strong> Part, price, arrival, then the source.
      </p>
      <p className="sx-voice-note">Assumption: buyers follow part, price, arrival, then source, by ear. The voice test, 6 buyers in weeks 6 to 8, tests it.</p>
    </aside>
  )
}

const evidenceSteps = [
  {
    who: 'The researcher',
    title: 'Hypothesis',
    lead: 'Every hypothesis is a bet a test can prove wrong.',
    example: 'At a fit score of 85 out of 100, the agent picks the rep’s part.',
  },
  {
    who: 'Researcher and engineer',
    title: 'Test',
    lead: 'The agent’s rules go through a replay, then shadow mode.',
    rest: ' A/B where traffic allows.',
    example: 'A year of past orders, replayed from week 1. 5 sales reps test the case card in weeks 2 to 4.',
  },
  {
    who: 'The designers, with AI tools',
    title: 'Design',
    lead: 'Designers build from the same tokens and skills.',
    rest: ' Every fit score shows its reason.',
  },
  {
    who: 'Engineer and QA',
    title: 'Ship',
    lead: '1 release goes out to every channel.',
    rest: ' The build runs the checks, then QA and I sign off.',
  },
]

/** Figma 270:92, the feature delivery framework. */
export function EvidenceFrame() {
  return (
    <div className="ef">
      <div className="ef-source">
        <p className="ef-label">Source of truth</p>
        <p className="ef-truth">1 doc says what a feature must do, and how we will know it works.</p>
        <p className="ef-note">The PM and I write it, as the agent behaviour spec.</p>
      </div>
      <ol className="ef-steps">
        {evidenceSteps.map((step, index) => (
          <li key={step.title} className="ef-step">
            <span className="ef-marker" aria-hidden="true">
              {index + 1}
            </span>
            <div className="ef-details">
              <p className="ef-note">{step.who}</p>
              <h4 className="ef-title">{step.title}</h4>
              <p className="ef-text">
                <strong>{step.lead}</strong>
                {step.rest}
              </p>
              {step.example ? (
                <p className="ef-example">
                  <span>In this case: </span>
                  {step.example}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
      <div className="ef-gate">
        <span className="ef-badge">Agent gate</span>
        <p className="ef-gate-text">
          <strong>A category acts alone only at 90% agreement with the reps in replay.</strong> It must hold in shadow
          mode, then a person switches it on.
        </p>
      </div>
    </div>
  )
}
