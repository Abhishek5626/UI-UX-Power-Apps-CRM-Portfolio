import type { ReactNode } from 'react'
import './quik-figures.css'

/** Original concept figures for the Quik case study, drawn from its own text. Everything here is assumed, not research data. */
function Figure({ label, title, children }: { label: string; title: string; children: ReactNode }) {
  return (
    <figure className="qf" aria-label={label}>
      <p className="qf-title">{title}</p>
      {children}
    </figure>
  )
}

const firstHour = [
  { step: 'Sign up', stops: 0 },
  { step: 'Create a project', stops: 1 },
  { step: 'Connect a repo', stops: 2 },
  { step: 'Set env variables', stops: 4 },
  { step: 'Add a domain', stops: 3 },
  { step: 'Read the logs', stops: 3 },
]

export function ResearchMap() {
  return (
    <Figure label="A first-hour map of where people stop in Quik, and the top three points ranked" title="The first hour in Quik">
      <ol className="qf-hour">
        {firstHour.map(({ step, stops }, index) => (
          <li key={step}>
            <span className="qf-hour-bar" aria-hidden="true">
              {Array.from({ length: stops }, (_, i) => (
                <i key={i} />
              ))}
            </span>
            <span className="qf-num">{index + 1}</span>
            <b>{step}</b>
            <small>{stops ? `${stops} look-up${stops > 1 ? 's' : ''}` : 'No stops'}</small>
          </li>
        ))}
      </ol>
      <div className="qf-rank">
        <p className="qf-label">Ranked by how often it comes up and how much it blocks</p>
        <ol>
          <li><b>Set env variables</b><span>Every project, and nothing works until it's right</span></li>
          <li><b>Add a domain</b><span>Needs DNS steps outside Quik</span></li>
          <li><b>Read the logs</b><span>Experts leave for their own terminal here</span></li>
        </ol>
      </div>
      <p className="qf-note">Concept: the stops are assumed, to be checked in interviews</p>
    </Figure>
  )
}

const directions = [
  { key: 'A', name: 'Chat added to the dashboard', verdict: 'The menus stay in the way', shape: 'dash' },
  { key: 'B', name: 'A separate assistant app', verdict: 'Splits people from their projects', shape: 'app' },
  { key: 'C', name: 'A workspace built around tasks', verdict: 'Taken forward', shape: 'work', chosen: true },
]

export function Directions() {
  return (
    <Figure label="Three directions compared: chat in the dashboard, a separate app, and the chosen task workspace" title="Three directions">
      <div className="qf-grid qf-three">
        {directions.map((d) => (
          <div key={d.key} className={d.chosen ? 'qf-card is-chosen' : 'qf-card'}>
            <div className={`qf-wire is-${d.shape}`} aria-hidden="true">
              <i /><i /><i />
            </div>
            <p className="qf-label">Direction {d.key}</p>
            <b>{d.name}</b>
            <span className={d.chosen ? 'qf-pill is-on' : 'qf-pill'}>{d.verdict}</span>
          </div>
        ))}
      </div>
    </Figure>
  )
}

const parts = [
  { part: 'Ask', panel: 'centre' },
  { part: 'Type commands', panel: 'left' },
  { part: 'Check a plan', panel: 'right' },
  { part: 'Review the result', panel: 'right' },
]

export function BuildingBlocks() {
  return (
    <Figure label="Four building blocks placed into three panels: console, conversation, and plan and results" title="Four parts, three panels">
      <div className="qf-blocks">
        <ul className="qf-parts">
          {parts.map(({ part, panel }) => (
            <li key={part} data-panel={panel}>
              {part}
            </li>
          ))}
        </ul>
        <span className="qf-arrow" aria-hidden="true">→</span>
        <div className="qf-panels">
          <div data-panel="left"><p className="qf-label">Console</p><b>Type commands</b></div>
          <div data-panel="centre"><p className="qf-label">Conversation</p><b>Ask</b></div>
          <div data-panel="right"><p className="qf-label">Plan and results</p><b>Check a plan</b><b>Review the result</b></div>
        </div>
      </div>
    </Figure>
  )
}

export function ActionSchema() {
  return (
    <Figure label="One action's structure drives both the plan step on screen and the matching console command" title="One action, two views">
      <div className="qf-schema">
        <pre className="qf-code">{`{
  "action": "add_domain",
  "does":   "Point shop.example.com at this project",
  "needs":  ["domain", "DNS access"],
  "cost":   "Free",
  "undo":   "Remove the domain"
}`}</pre>
        <span className="qf-arrow" aria-hidden="true">→</span>
        <div className="qf-views">
          <div className="qf-card">
            <p className="qf-label">Plan step</p>
            <b>Point shop.example.com at this project</b>
            <span>Needs DNS access · Free · Can be undone</span>
            <span className="qf-buttons"><i>Approve</i><i>Skip</i></span>
          </div>
          <div className="qf-card qf-term">
            <p className="qf-label">Console</p>
            <code>$ quik domains add shop.example.com</code>
          </div>
        </div>
      </div>
    </Figure>
  )
}

function PlanStep({ tone, n = 2, title = 'Set the env variables', text = '3 values from your .env file' }: { tone: 'dense' | 'open' | 'final'; n?: number; title?: string; text?: string }) {
  return (
    <div className={`qf-step is-${tone}`}>
      <span className="qf-num">{n}</span>
      <div>
        <b>{title}</b>
        <span>{text}</span>
      </div>
      <i>Approve</i>
    </div>
  )
}

export function VisualDirections() {
  return (
    <Figure label="The same plan step in a dense style, an open style and the final style" title="One plan step, three looks">
      <div className="qf-grid qf-three">
        {(['dense', 'open', 'final'] as const).map((tone) => (
          <div key={tone} className={tone === 'final' ? 'qf-card is-chosen' : 'qf-card'}>
            <p className="qf-label">{tone === 'dense' ? 'Dense and technical' : tone === 'open' ? 'Soft and open' : 'Final, in between'}</p>
            <PlanStep tone={tone} />
          </div>
        ))}
      </div>
    </Figure>
  )
}

export function BeforeAfter() {
  return (
    <Figure label="A plan step before and after: borders, icons and repeated labels removed, colour kept for the action" title="Before and after">
      <div className="qf-grid qf-two">
        <div className="qf-side is-before">
          <p className="qf-label">Before</p>
          <div className="qf-old">
            <p className="qf-label">Step 2 of 3 · Configuration</p>
            <div className="qf-old-row"><span className="qf-icon" aria-hidden="true">⚙</span><b>Set the env variables</b></div>
            <div className="qf-old-row"><span className="qf-icon" aria-hidden="true">ⓘ</span><span>Status: waiting · Source: .env</span></div>
            <span className="qf-buttons is-loud"><i>Approve</i><i>Skip</i><i>Details</i></span>
          </div>
        </div>
        <div className="qf-side is-after">
          <p className="qf-label">After</p>
          <PlanStep tone="final" />
          <PlanStep tone="final" n={3} title="Deploy to production" text="Builds from main, about 2 minutes" />
        </div>
      </div>
    </Figure>
  )
}
