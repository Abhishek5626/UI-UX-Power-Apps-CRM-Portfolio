import { ShippedBadge } from '../components/ShippedBadge.tsx'
import { useId, useState, type CSSProperties } from 'react'
import { ThresholdFlow } from './ThresholdFlow.tsx'
import { AgentLimitsFrame, DecidesFrame, SafeguardsFrame } from './CaseStudyFigmaFrames.tsx'

type Outcome = 'Acts' | 'Asks' | 'Hands over' | 'Stops'

const parts = {
  pump: {
    label: 'Water pump',
    safety: false,
    options: [
      { name: 'Original part', fit: 100, note: 'not in stock', inStock: false },
      { name: 'Hollen', fit: 90, note: 'arrives 10:45', inStock: true },
      { name: 'Vantor', fit: 70, note: 'arrives 13:30, not listed for this VIN', inStock: true },
    ],
  },
  brakes: {
    label: 'Brake pads',
    safety: true,
    options: [
      { name: 'Original part', fit: 100, note: 'in stock', inStock: true },
    ],
  },
}

type PartKey = keyof typeof parts

const REP_FIT = 70

/** The dial's rule: a safety part stops; otherwise the best part in stock meets the threshold. */
function decide(part: PartKey, threshold: number): { outcome: Outcome; text: string; pick?: string } {
  if (parts[part].safety) {
    return { outcome: 'Stops', text: 'Brake pads are a safety part, so a sales rep decides whatever the threshold.' }
  }
  const best = parts[part].options
    .filter((option) => option.inStock)
    .reduce((top, option) => (option.fit > top.fit ? option : top))
  if (best.fit >= threshold) {
    return { outcome: 'Acts', pick: best.name, text: `${best.name} scores ${best.fit}, ${best.fit === threshold ? 'at' : 'above'} the threshold of ${threshold}. The agent orders it. The buyer can undo.` }
  }
  if (best.fit >= REP_FIT) {
    return { outcome: 'Asks', pick: best.name, text: `Nothing in stock reaches ${threshold}. ${best.name} scores ${best.fit}, so the agent asks the buyer first.` }
  }
  return { outcome: 'Hands over', text: `Nothing in stock scores ${REP_FIT} or more, so a sales rep decides.` }
}

function ThresholdDial() {
  const [part, setPart] = useState<PartKey>('pump')
  const [threshold, setThreshold] = useState(85)
  const sliderId = useId()
  const result = decide(part, threshold)

  const tone = { Acts: 'ok', Asks: 'ask', 'Hands over': 'ask', Stops: 'stop' }[result.outcome]
  const safety = parts[part].safety
  const fitTone = (option: { fit: number; inStock: boolean }) =>
    safety || !option.inStock ? 'off' : option.fit >= threshold ? 'ok' : 'ask'

  return (
    <div className={`td is-${tone}`} style={{ '--at': (threshold - 70) / 30 } as CSSProperties}>
      <div className="td-switch" role="group" aria-label="Part to test">
        {(Object.keys(parts) as PartKey[]).map((key) => (
          <button key={key} type="button" className="td-part" aria-pressed={part === key} onClick={() => setPart(key)}>
            {parts[key].label}
          </button>
        ))}
      </div>
      <div className="td-head">
        <label className="td-label" htmlFor={sliderId}>
          Threshold
        </label>
        <span className="td-hint">Drag to move it</span>
        <output className="td-value" htmlFor={sliderId}>
          {threshold}
        </output>
      </div>
      <div className="td-slider">
        <input
          id={sliderId}
          className="td-range"
          type="range"
          min={70}
          max={100}
          step={1}
          value={threshold}
          onChange={(event) => setThreshold(Number(event.target.value))}
        />
        <span className="td-zone is-ask" aria-hidden="true" />
        <span className="td-zone is-ok" aria-hidden="true" />
        {parts[part].options.map((option) => (
          <span
            key={option.name}
            className={`td-dot is-${fitTone(option)}`}
            style={{ '--fit': (option.fit - 70) / 30 } as CSSProperties}
            aria-hidden="true"
          />
        ))}
        <span className="td-handle" aria-hidden="true" />
      </div>
      <div className="td-axis" aria-hidden="true">
        <span>70</span>
        <span>80</span>
        <span>90</span>
        <span>100</span>
      </div>
      <ul className="td-options">
        {parts[part].options.map((option) => (
          <li key={option.name} className={option.name === result.pick ? 'td-option is-picked' : 'td-option'}>
            <span className={option.inStock ? 'td-name' : 'td-name is-off'}>{option.name}</span>
            <span className={`td-fit is-${fitTone(option)}`}>fit {option.fit}</span>
            <span className={option.name === result.pick ? 'td-note is-picked' : 'td-note'}>{option.note}</span>
          </li>
        ))}
      </ul>
      <p className="td-result" role="status">
        <span className="td-pill">{result.outcome}</span>
        <span className="td-result-text">{result.text}</span>
      </p>
      <p className="td-caption">
        Each part keeps its fit score. Only the merchant’s threshold moves. At or above it, the agent
        orders. From 70 up to it, the agent asks the buyer first. Under 70, a part is declined. The
        real setting is per category, in the prototype.
      </p>
    </div>
  )
}

export function CaseStudy4Trust({ id }: { id: string }) {
  return (
    <div id={id} className="cs-chapter">
      <section className="cs-block" aria-labelledby={`${id}-title`}>
        <div className="cs-block-head">
          <span className="cs-chapter-label"><ShippedBadge>04 Trust</ShippedBadge></span>
          <h2 id={`${id}-title`} className="cs-h1">
            When an agent can act on its own.
          </h2>
          <p className="cs-b1 cs-block-summary">
            Each part gets a fit score out of 100. At or above the merchant’s threshold, the agent
            orders alone. From 70 up to it, the agent asks the buyer to confirm. Below 70, or on a
            hard rule, a sales rep decides.
          </p>
        </div>
      </section>

      <section className="cs-block" aria-labelledby={`${id}-work`}>
        <div className="cs-block-head">
          <h3 id={`${id}-work`} className="cs-h2">
            Threshold at work
          </h3>
          <p className="cs-b1 cs-block-summary">
            5 orders meet 3 checks, and the fulfilment agent writes the one that passes. Each of the
            others stops where a rule says so.
          </p>
        </div>
        <div className="cs-block-body">
          <ThresholdFlow />
          <div className="cs-notes">
            <p className="cs-h4">
              Only an order passing every check gets ordered alone. Every other order stops, asks or
              hands over, and says why.
            </p>
            <p className="cs-small cs-note-text">
              Example orders from the prototype’s mock ERP. The checks follow the engine’s own rules
              and order.
            </p>
          </div>
        </div>
      </section>

      <section className="cs-block" aria-labelledby={`${id}-limits`}>
        <div className="cs-block-head">
          <h3 id={`${id}-limits`} className="cs-h2">
            Each agent’s limits
          </h3>
          <p className="cs-b1 cs-block-summary">
            The same 6 words for every agent, so their limits compare at a glance.
          </p>
        </div>
        <div className="cs-block-body">
          <div className="fg-scroll" tabIndex={0} role="region" aria-label="Each agent’s limits">
            <AgentLimitsFrame />
          </div>
          <p className="cs-h4">
            A person can undo or overrule every agent. No agent approves a spend, changes a rule or
            decides on a safety part.
          </p>
        </div>
      </section>

      <section className="cs-block" aria-labelledby={`${id}-try`}>
        <div className="cs-block-head">
          <h3 id={`${id}-try`} className="cs-h2">
            Try the threshold
          </h3>
          <p className="cs-b1 cs-block-summary">
            Fit scores stay fixed, and only the threshold moves. Take it past 90 and the water pump
            goes from ordered to asked.
          </p>
        </div>
        <div className="cs-try">
          <ThresholdDial />
          <DecidesFrame />
        </div>
      </section>

      <section className="cs-block" aria-labelledby={`${id}-holds`}>
        <div className="cs-block-head">
          <h3 id={`${id}-holds`} className="cs-h2">
            What always holds
          </h3>
          <p className="cs-b1 cs-block-summary">
            Whatever fails, a person takes over, and both sides keep control.
          </p>
        </div>
        <div className="cs-block-body">
          <SafeguardsFrame />
        </div>
      </section>
    </div>
  )
}
