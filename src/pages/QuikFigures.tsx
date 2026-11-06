import { useEffect, useState } from 'react'
import './quik-figures.css'

/** The one-pager the agents drafted: the editor washes out to its two key sections, then reveals the rest. */
export function OnePagerFocus() {
  return (
    <div className="qf-focus">
      <img
        src="/case-study-5/one-pager.webp"
        width={2000}
        height={1151}
        alt="The drafted AWS Conversational Console one-pager open in a code editor, with the problem bullets and the opportunity section highlighted"
      />
      <span className="qf-focus-wash" aria-hidden="true" />
      <span className="qf-focus-band is-problem" aria-hidden="true" />
      <span className="qf-focus-band is-opportunity" aria-hidden="true" />
    </div>
  )
}

/** The full workspace with each panel lit in turn: rail, console and agents, chat, review, then all together. */
export function LayoutTour() {
  return (
    <div className="qf-tour">
      <img
        src="/case-study-5/layout-full.webp"
        width={2000}
        height={1422}
        alt="The Quik workspace with an icon rail, the console and agents panel, the assistant chat, and the review panel, each highlighted in turn"
      />
      {['rail', 'side', 'chat', 'review'].map((part) => (
        <span key={part} className={`qf-tour-wash is-${part}`} aria-hidden="true" />
      ))}
    </div>
  )
}

/** Zooms into the theme toggle, clicks it, and zooms out in the other theme: light, dark, then back. */
export function ThemeSwitch() {
  return (
    <div className="qf-theme" role="img" aria-label="The assistant chat switching from light mode to dark mode and back using the theme toggle">
      <div className="qf-theme-zoom">
        <img src="/case-study-5/light-chat.webp" width={2000} height={1422} alt="" />
        <img className="is-dark" src="/case-study-5/dark-chat.webp" width={2000} height={1422} alt="" />
      </div>
      <svg className="qf-theme-cursor" viewBox="0 0 16 20" aria-hidden="true">
        <path d="M1 1v15l4-4 3 7 3-1-3-7h6z" fill="#111" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

/* Scene start times (ms) for the 10s export walkthrough; the step index is how many have passed. */
const EXPORT_SCRIPT = [0, 700, 1300, 2200, 2900, 3700, 4300, 5100, 5700, 6500, 7700]
const EXPORT_LOOP = 10000
const ICONS = '/case-study-5/'

function Steps({ active }: { active: number }) {
  return (
    <ol className="qx-steps">
      {['Select source table', 'Choose destination', 'Configure export'].map((label, i) => (
        <li key={label} className={i < active ? 'is-done' : i === active ? 'is-active' : undefined}>{label}</li>
      ))}
    </ol>
  )
}

function Rows({ rows, picked }: { rows: string[][]; picked: number }) {
  return (
    <div className="qx-rows">
      {rows.map((row, i) => (
        <div key={row[0]} className={i === picked ? 'is-picked' : undefined}>
          {row.map((cell) => <span key={cell}>{cell}</span>)}
        </div>
      ))}
    </div>
  )
}

/** A guided export in the assistant, cut to 10 seconds: ask, pick table, bucket and type, then Review and the console open. */
export function ExportFlow() {
  const [step, setStep] = useState(EXPORT_SCRIPT.length - 1)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const start = performance.now()
    const tick = () => {
      const elapsed = (performance.now() - start) % EXPORT_LOOP
      setStep(EXPORT_SCRIPT.filter((t) => t <= elapsed).length - 1)
    }
    tick()
    const id = window.setInterval(tick, 100)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="qx" role="img" aria-label="The assistant walks through exporting a DynamoDB table to S3: pick the table, the bucket and the export type, then the Review panel shows the finished export and the console shows the matching command">
      <div className="qx-app" aria-hidden="true">
        <nav className="qx-rail">
          <img src={`${ICONS}message-square.svg`} alt="" />
          <img src={`${ICONS}square-terminal.svg`} alt="" />
          <img src={`${ICONS}bot.svg`} alt="" />
          <span className="qx-avatar" />
          <img src={`${ICONS}moon.svg`} alt="" />
        </nav>

        <aside className={step >= 10 ? 'qx-side is-open' : 'qx-side'}>
          <div>
            <p className="qx-panel-head">&gt;_ QUIK-CONSOLE - ZSH</p>
            <pre className="qx-console">
              <b>quik-console - %</b>
              {` aws dynamodb export-table-to-point-in-time \\
  --table-name orders \\
  --s3-bucket data-lake-prod \\
  --export-type FULL_EXPORT

`}
              <i>ExportStatus: COMPLETED</i>
            </pre>
          </div>
        </aside>

        <section className="qx-chat">
          <div className="qx-tabs"><span className="qx-tab">New Chat</span><span>+</span></div>
          <p className="qx-title">Quick Assistant</p>
          <div className="qx-thread">
            <p className="qx-hello">Hi, I am your<br />Quik Assistant</p>
            {step >= 1 && <p className="qx-user">Export my orders table to S3</p>}
            {step >= 2 && (
              <div className="qx-card">
                <p>Sure. Pick the table to export.</p>
                <Steps active={0} />
                <Rows picked={step >= 3 ? 0 : -1} rows={[['orders', 'us-west-2', '1.2M items'], ['users', 'us-west-2', '89K items'], ['products', 'us-east-1', '24K items']]} />
              </div>
            )}
            {step >= 4 && <p className="qx-user">orders</p>}
            {step >= 4 && (
              <div className="qx-card">
                <p>Which S3 bucket should it go to?</p>
                <Steps active={1} />
                <Rows picked={step >= 5 ? 0 : -1} rows={[['data-lake-prod', 'us-west-2'], ['analytics-raw', 'us-west-2']]} />
              </div>
            )}
            {step >= 6 && <p className="qx-user">data-lake-prod</p>}
            {step >= 6 && (
              <div className="qx-card">
                <p>Full or partial export?</p>
                <Steps active={2} />
                <div className="qx-chips"><span className={step >= 7 ? 'is-picked' : undefined}>Full export</span><span>Partial export</span></div>
              </div>
            )}
            {step >= 8 && <p className="qx-user">Full export</p>}
            {step >= 8 && (
              <div className="qx-card">
                <Steps active={step >= 9 ? 3 : 2} />
                <p>{step >= 9 ? 'Export completed. The details are in Review.' : 'Starting the export'}{step < 9 && <span className="qx-dots" />}</p>
              </div>
            )}
          </div>
          <div className="qx-input">
            <img src={`${ICONS}sparkles.svg`} alt="" />
            <span>Ask AI a question or make a request...</span>
            <b className="qx-send">↑</b>
          </div>
        </section>

        <aside className={step >= 9 ? 'qx-review is-open' : 'qx-review'}>
          <div>
            <p className="qx-panel-head">REVIEW</p>
            <div className="qx-review-body">
              <p className="qx-done">✓ Export completed</p>
              <p className="qx-label">What happened</p>
              <Steps active={3} />
              <p className="qx-label">Created resources</p>
              <code>s3://data-lake-prod/AWSDynamoDB/orders/</code>
              <p className="qx-label">Export type</p>
              <p>Full export · 1.2M items</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
